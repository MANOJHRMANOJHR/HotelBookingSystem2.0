
const app = angular.module('hotelApp', ['ngRoute']);

app.config(function($routeProvider) {
  $routeProvider
    .when('/hero', {
      templateUrl: 'hero.html'
    })
    .when('/rooms', {
      templateUrl: 'rooms.html'
    })
    .when('/book', {
      templateUrl: 'book.html'
    })
    .otherwise({
      redirectTo: '/hero'
    });
});


app.controller('HotelController', function ($scope, $http, $filter) {
  const BACKEND = "http://localhost:3000";
  $scope.rooms = [];
  $scope.booking = {};
  $scope.cancel = {};
  $scope.showModal = false;
  $scope.roomDetails = {};


//function to fetch rooms from the backend
  $scope.fetchRooms = function () {
    $http.get(`${BACKEND}/rooms`).then(function (response) {
      $scope.rooms = response.data;
    });
  };


// Function to book a room
  $scope.bookRoom = function () {
if (!$scope.booking) {
    alert("Please fill in the booking form.");
    return;
  }
const booking = $scope.booking;
    if (!$scope.booking.roomNumber || !$scope.booking.phoneNumber.match(/^\d{10}$/)) {
      alert("Please select a room and enter a valid phone number.");
      return;
    }
      if (!booking.userName || !booking.phoneNumber || !booking.checkIn || !booking.checkOut || !booking.roomNumber) {
    alert("Please fill all fields.");
    return;
  }

  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);

  if (checkOutDate <= checkInDate) {
    alert("Check-out date must be after check-in date.");
    return;
  }
const bookingData = {
  userName: $scope.booking.userName,
  phoneNumber: $scope.booking.phoneNumber,
  checkIn: $filter('date')($scope.booking.checkIn, 'yyyy-MM-dd'),
  checkOut: $filter('date')($scope.booking.checkOut, 'yyyy-MM-dd'),
  roomNumber: $scope.booking.roomNumber
};
    $http.post(`${BACKEND}/book-room`, bookingData).then(function (response) {
      if (response.data.message === "Booking successful!") {
        alert("Room booked successfully!");
        $scope.fetchRooms();
        $scope.booking = {}; // Reset form
      } else {
        alert("Booking failed: " + (response.data.error || 'Unknown error'));
      }
    });
  };




// Function to cancel a booking
  $scope.cancelBooking = function () {
    if (!$scope.cancel.roomNumber || !$scope.cancel.userName || !$scope.cancel.phoneNumber) {
      alert("Please fill in all fields");
      return;
    }

    $http.post(`${BACKEND}/api/cancel-booking`, {
      user_name: $scope.cancel.userName,
      phone_number: $scope.cancel.phoneNumber,
      room_number: $scope.cancel.roomNumber,
    }).then(function (response) {
      if (response.data.success) {
        alert("Booking cancelled successfully");
        $scope.fetchRooms();
        $scope.cancel = {}; // Reset form
      } else {
        alert("Cancellation failed. Please check your details and try again.");
      }
    });
  };


  $scope.viewRoom = function (room) {
    if (room.status === 'Booked') {
      alert('This room is already booked.');
      return;
    }

    $scope.roomDetails = {
      image: getRandomRoomImage(room.type),
      title: `Room ${room.room_number} - ${room.type}`,
      description: generateRoomDescription(room.type),
      price: room.price
    };
    $scope.showModal = true;
  };

  // Function to close the modal
  $scope.closeModal = function () {
    $scope.showModal = false;
  };

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
    return images[type] || './public/images/image8.jpeg';
  }

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

  $scope.fetchRooms(); // Initial load
});
