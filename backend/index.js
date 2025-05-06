require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Set up MySQL connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Test database connection
db.getConnection()
    .then(() => console.log('Connected to the MySQL database'))
    .catch((err) => {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    });

// Get available rooms
app.get('/rooms', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM rooms');
        res.json(results);
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({ success: false, message: 'Error fetching rooms' });
    }
});

// Handle booking requests
app.post('/book-room', async (req, res) => {
    const { userName, phoneNumber, checkIn, checkOut, roomNumber } = req.body;

    // Input validation
    if (!userName || !phoneNumber || !checkIn || !checkOut || !roomNumber) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!/^[A-Za-z\s]+$/.test(userName)) {
        return res.status(400).json({ error: 'Invalid name format.' });
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({ error: 'Phone number must be 10 digits.' });
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
        return res.status(400).json({ error: 'Check-out date must be after check-in date.' });
    }

    try {
        // Insert booking details into the database
        const query = `
            INSERT INTO bookings (user_name, phone_number, check_in, check_out, room_number) 
            VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.execute(query, [userName, phoneNumber, checkIn, checkOut, roomNumber]);

        // Update room status to 'Booked'
        const updateRoomQuery = 'UPDATE rooms SET status = "Booked" WHERE room_number = ?';
        await db.execute(updateRoomQuery, [roomNumber]);

        res.status(200).json({ message: 'Booking successful!', bookingId: result.insertId });
    } catch (err) {
        console.error('Database Error:', err);
        res.status(500).json({ error: 'Database error. Please try again later.' });
    }
});

// Cancel booking
app.post('/api/cancel-booking', async (req, res) => {
    const { user_name, phone_number, room_number } = req.body;

    try {
        const updateBookingQuery = `
            UPDATE bookings
            SET status = 'Cancelled', cancelled_at = NOW()
            WHERE user_name = ? AND phone_number = ? AND room_number = ? AND status = 'Booked'`;

        const [result] = await db.execute(updateBookingQuery, [user_name, phone_number, room_number]);

        if (result.affectedRows > 0) {
            const updateRoomQuery = 'UPDATE rooms SET status = "Available" WHERE room_number = ?';
            await db.execute(updateRoomQuery, [room_number]);
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: 'No matching booking found or already cancelled.' });
        }
    } catch (err) {
        console.error('Error cancelling booking:', err);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});

// Get all booked rooms
app.get('/api/bookings', async (req, res) => {
    try {
        const [results] = await db.query('SELECT room_number, type, price FROM rooms WHERE status = "Booked"');
        res.json({ rooms: results });
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
