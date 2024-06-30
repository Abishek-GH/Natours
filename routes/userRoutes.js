// Importing the necessary modules
const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");





// Creating a new router Previously all the routes were handles using the app router
const router = express.Router();
// This all routes can also be handled as shown in the below lines of code
// app.get("/api/v1/users", getAllTours);
// app.post("/api/v1/users", createTour);

// app.get("/api/v1/users/:id", getTour);
// app.patch("/api/v1/users/:id", updateTour);
// app.delete("/api/v1/users/:id", deleteTour);

// Handling routes

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.use(authController.protect);

router.patch("/updateMyPassword", authController.updateMyPassword);

router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe", userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

router.use(authController.restrictTo("admin"));

router
    .route("/")
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route("/:id")
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

// Exporting this module
module.exports = router;