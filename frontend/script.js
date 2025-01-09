document.addEventListener('DOMContentLoaded', () => {
    const cancelBookingForm = document.getElementById('cancel-booking-form');
    const cancelRoomNumberSelect = document.getElementById('cancelRoomNumber');
    const cancelUserNameInput = document.getElementById('cancelUserName');
    const cancelPhoneNumberInput = document.getElementById('cancelPhoneNumber');

    fetchRooms();
    document.getElementById('booking-form').addEventListener('submit', bookRoom);

    // Fetch current bookings and populate the cancel booking select input
    function loadBookings() {
        fetch('http://localhost:3000/api/bookings')  // Ensure the correct URL
            .then(response => response.json())
            .then(data => {
                 // Clear the cancelRoomNumber dropdown before adding options
            cancelRoomNumberSelect.innerHTML = '<option value="">Select Room to Cancel</option>';

            data.rooms.forEach(room => {
                if (room.status === 'Booked') {  // Check for booked rooms only
                    const option = document.createElement('option');
                    option.value = room.room_number;
                    option.textContent = `Room ${room.room_number} - ${room.type}`;
                    cancelRoomNumberSelect.appendChild(option);
                }
            });
            })
            .catch(error => {
                console.error('Error loading rooms:', error);
            });
    }

    // Handle cancel booking form submission
    cancelBookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const userName = cancelUserNameInput.value;
        const phoneNumber = cancelPhoneNumberInput.value;
        const roomNumber = cancelRoomNumberSelect.value;
    
        if (!userName || !phoneNumber || !roomNumber) {
            alert('Please fill in all fields');
            return;
        }
    
        fetch('http://localhost:3000/api/cancel-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_name: userName,
                phone_number: phoneNumber,
                room_number: roomNumber,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Booking cancelled successfully');
                updateRoomStatus(roomNumber); // Update status after cancellation
                fetchRooms(); // Refresh the rooms list after cancellation
            } else {
                alert('Cancellation failed. Please check your details and try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        });
    });
    
    // Function to update the room status to 'Available'
    function updateRoomStatus(roomNumber) {
        // Update the UI for the cancelled room
        const roomSelect = document.getElementById('roomNumber');
        const roomOptions = roomSelect.querySelectorAll('option');

        roomOptions.forEach(option => {
            if (option.value === roomNumber) {
                option.textContent = `Room ${roomNumber} - Available`;
                option.style.color = 'green';
            }
        });

         // Update the UI for the cancelled room in the cancellation section
    const cancelRoomSelect = document.getElementById('cancelRoomNumber');
    const cancelRoomOptions = cancelRoomSelect.querySelectorAll('option');

    cancelRoomOptions.forEach(option => {
        if (option.value === roomNumber) {
            option.textContent = `Room ${roomNumber} - Available`;
            option.style.color = 'green';
        }
    });

    }

    loadBookings();
});

//Booking failed: Booking successful!
async function fetchRooms() {
    try {
        const response = await fetch('http://localhost:3000/rooms');
        const rooms = await response.json();
        const roomList = document.getElementById('room-list');
        const roomDropdown = document.getElementById('roomNumber'); // Room dropdown
        roomDropdown.innerHTML = '<option value="">Select Room</option>'; // Reset dropdown
        roomList.innerHTML = '';
        const cancelRoomDropdown = document.getElementById('cancelRoomNumber'); // Room dropdown for cancellation
        
        cancelRoomDropdown.innerHTML = '<option value="">Select Room to Cancel</option>'; // Reset dropdown for cancellation


        rooms.forEach((room) => {
            // Update the dropdown for available rooms
            if (room.status === 'Available') {
                const option = document.createElement('option');
                option.value = room.room_number;
                option.textContent = `Room ${room.room_number} - ${room.type}`;
                roomDropdown.appendChild(option);
            }
            
            if(room.status === 'Booked'){
                 // Also add available rooms to cancellation dropdown
                 const cancelOption = document.createElement('option');
                 cancelOption.value = room.room_number;
                 cancelOption.textContent = `Room ${room.room_number} - ${room.type}`;
                 cancelRoomDropdown.appendChild(cancelOption);

            }

            // Display room details in the room list
            const roomDiv = document.createElement('div');
            roomDiv.classList.add('room');
            roomDiv.innerHTML = `
                <h3>Room ${room.room_number}</h3>
                <p>${room.type}</p>
                <p>$${room.price} per night</p>
                <p class="status">${room.status}</p>
            `;

            // If room is available, allow users to click and view more details
            if (room.status === 'Available') {
                roomDiv.addEventListener('click', () => openRoomModal(room));
            } else {
                // If the room is booked, disable it
                roomDiv.classList.add('booked');
                roomDiv.style.cursor = 'not-allowed';
                roomDiv.addEventListener('click', () => alert('This room is already booked.'));
            }

            roomList.appendChild(roomDiv);
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
    }
}


async function bookRoom(event) {
    event.preventDefault();

    const userName = document.getElementById('userName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const roomNumber = document.getElementById('roomNumber').value;

    if (!roomNumber) {
        alert('Please select a room.');
        return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
        alert("Please enter a valid phone number.");
        return;
    }

    const response = await fetch('http://localhost:3000/book-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, phoneNumber, checkIn, checkOut, roomNumber })
    });

    const data = await response.json();

    if (response.ok && data.message === "Booking successful!") {
        alert('Room booked successfully!');
        fetchRooms(); // Refresh the rooms list after booking
    } else {
        alert('Booking failed: ' + (data.error || 'Unknown error'));
    }
}


  // Function to open the modal with room details
function openRoomModal(room) {
    const modal = document.getElementById('roomPopup');
    const popupImage = document.getElementById('popupImage');
    const popupTitle = document.getElementById('popupTitle');
    const popupDescription = document.getElementById('popupDescription');
    const popupPrice = document.getElementById('popupPrice');

    // Set modal content
    popupImage.src = getRandomRoomImage(room.type); // Get room image
    popupTitle.textContent = `Room ${room.room_number} - ${room.type}`;
    popupDescription.textContent = generateRoomDescription(room.type);
    popupPrice.textContent = room.price;

    // Display the modal
    modal.style.display = 'flex';

    // Close the modal when clicking the close button
    document.getElementById('closePopup').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close the modal when clicking outside the modal content
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}




// Function to get room image based on the room type
function getRandomRoomImage(type) {
    const images = {
        'Deluxe Room': './public/images/image1.webp',
        'Suite': './public/images/image2.jpeg',
        'Standard Room': './public/images/image3.jpeg',
        'Family Room': './public/images/image4.jpeg',
        'Single Room': './public/images/image5.jpeg',
        'Luxury Suite': './public/images/image6.jpeg',
        'Presidential Suite': './public/images/image7.jpeg',
    };
    return images[type] || './public/images/image8.jpeg'; // Default image
}




// Function to generate room description based on room type
function generateRoomDescription(type) {
    const descriptions = {
        'Deluxe Room': 'A cozy deluxe room with modern amenities and a comfortable bed.',
        'Suite': 'Spacious suite with elegant décor and a stunning view.',
        'Standard Room': 'A budget-friendly room with essential facilities.',
        'Family Room': 'Perfect for families with ample space and comfort.',
        'Single Room': 'Ideal for solo travelers with a cozy and private setup.',
        'Luxury Suite': 'A luxurious suite with premium amenities and breathtaking views.',
        'Presidential Suite': 'Unparalleled luxury and service in the most exclusive room.',
    };
    return descriptions[type] || 'A beautiful room designed for comfort and relaxation.';
}

