
CREATE DATABASE hotel_booking;

USE hotel_booking;


-- Create the 'rooms' table to store room details
CREATE TABLE rooms (
    room_number INT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL
);

SELECT * FROM rooms;

SELECT * FROM bookings;

-- Create the 'bookings' table to store booking details including phone number
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    room_number INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('booked', 'cancelled', 'completed') DEFAULT 'booked',
    cancelled_at TIMESTAMP NULL,
    FOREIGN KEY (room_number) REFERENCES rooms(room_number)
);


INSERT INTO rooms (room_number, type, price, status) VALUES
(101, 'Deluxe Room', 120, 'Available'),
(102, 'Deluxe Room', 120, 'Booked'),
(103, 'Suite', 200, 'Available'),
(104, 'Suite', 200, 'Booked'),
(105, 'Standard Room', 80, 'Available'),
(106, 'Standard Room', 80, 'Available'),
(107, 'Family Room', 150, 'Booked'),
(108, 'Family Room', 150, 'Available'),
(109, 'Single Room', 60, 'Available'),
(110, 'Single Room', 60, 'Booked'),
(201, 'Luxury Suite', 250, 'Available'),
(202, 'Presidential Suite', 400, 'Available');

