// Importing the necessary modules
const express = require("express");
const tourController = require("./../controllers/tourController");
const authController = require("./../controllers/authController");
const reviewRouter = require("./../routes/reviewRoutes");

// Creating a new router Previously all the routes were handles usingthe app router
const router = express.Router();

// Original Syntax
/*
router.param("path", (req, res, next, val) => {
    Task to perform...
    next();
})
*/
// router.param("id", tourController.checkID);

// This all routes can also be handled as shown in the below lines of code
// app.get("/api/v1/tours", getAllTours);
// app.post("/api/v1/tours", createTour);

// app.get("/api/v1/tours/:id", getTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);

// Handling routes
router.use("/:tourId/reviews", reviewRouter);

router
    .route("/top-5-cheap")
    .get(tourController.aliasTopTours, tourController.getAllTours);

router
    .route("/tour-stats")
    .get(tourController.getTourStats);

router
    .route("/monthly-plan/:year")
    .get(authController.protect, authController.restrictTo("admin", "lead-guide", "gudie"), tourController.monthlyPlan);

router
    .route("/")
    .get(tourController.getAllTours)
    .post(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.createTour);

router
    .route("/:id")
    .get(tourController.getTour)
    .patch(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.uploadTourImages, tourController.resizeTourImage, tourController.updateTour)
    .delete(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.deleteTour);



router
    .route("/tours-within/:distance/center/:latlng/unit/:unit")
    .get(tourController.getToursWithIn);

router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);
// router
//     .route("/:tourId/reviews")
//     .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);
// Exporting this module
module.exports = router;