// Importing the necessary modules
const Review = require("./../models/reviewModel");
// const catchAsync = require('./../utils/catchAsync');
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");


// Get All Reviews
exports.getAllReviews = factory.getAll(Review);
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//     filter = {};

//     if (req.params.tourId) {
//         filter = { tour: req.params.tourId };
//     }
//     const reviews = await Review.find(filter);
//     res.status(200).json({
//         status: "Success",
//         results: reviews.length,
//         data: {
//             reviews
//         }
//     });
// });


exports.setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}

// exports.createReview = catchAsync(async (req, res, next) => {


//     const newReview = await Review.create(req.body);
//     res.status(201).json({
//         status: "Success",
//         data: {
//             review: newReview
//         }
//     });

// });


exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);