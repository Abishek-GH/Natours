const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// bookingController.js

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }

  // 2) Create a booking
  const booking = await Booking.create({
    tour: req.params.tourId,
    user: req.user.id,
    price: tour.price,
    paid: true,
  });

  // ⭐ Populate tour slug
  const populatedBooking = await Booking.findById(booking.id).populate({
    path: 'tour',
    select: 'slug',
  });

  // 3) Return JSON response
  res.status(200).json({
    status: 'success',
    message: 'Booking successful!',
    booking: populatedBooking,
  });
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
