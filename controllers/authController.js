const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("./../utils/appError");
const dotenv = require("dotenv");
const Email = require("./../utils/email");
const crypto = require("crypto");

dotenv.config({ path: "./../config.env" });

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET_CODE, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        secure: false,
        httpOnly: true
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("jwt", token, cookieOptions);

    user.password = undefined;
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    // const newUser = await User.create(req.body);
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    // The below code is same as teh below code in ES6
    // const email = req.body.email;
    // const password = req.body.password;
    const { email, password } = req.body;

    // Check if email and password are entered
    if (!email || !password) {
        return next(new AppError("Please provide a email id and password", 400));
    }
    // Check if user exists and the password is correct
    // This code is const user = User.find({ email: email }); same as the below code in ES6
    const user = await User.findOne({ email }).select("+password");
    console.log(user);
    console.log(password, user.password);
    const correct = await user.correctPassword(password, user.password);
    console.log(correct);
    if (!user || !(correct)) {
        return next(new AppError("Incorrect email or password", 401));
    }

    // If everything is correct send token to the client
    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: "success" })
};

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // Accessing the token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError("You are not logged in!. Please log in", 401));
    }

    // Verification of the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_CODE);

    // Check if the user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('The user no longer exists', 401));
    }

    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError("User recently chnaged the password, Please try again", 401));
    };

    // Grant Access to protected route
    req.user = freshUser;
    res.locals.user = freshUser
    next();
});

// Only for rendered pages, will not have any error
exports.isLoggedIn = async (req, res, next) => {
    // getting token and check if one's there
    if (req.cookies.jwt) {
        try {
            // Verification of the token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET_CODE);

            // Check if the user still exists
            const freshUser = await User.findById(decoded.id);
            if (!freshUser) {
                return next();
            }

            if (freshUser.changedPasswordAfter(decoded.iat)) {
                return next();
            };

            // There is a logged in user
            res.locals.user = freshUser
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action", 403));
        }
        next();
    }
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // Get user based on Posted Email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError("There is no user with the email address", 404));
    }

    // Generate a token and send it to the user's email
    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // Send it to user's email
    // const message = `Forgot your password? Submit PATCH request with your new password and passwordConfirm to ${resetURL}.\nIf you didn't changed your password, please ignore the email!`;
    try {
        // await Email({
        //     email: user.email,
        //     subject: "Your Password reset token (valid for 10 min)",
        //     message: message
        // });
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: "Success",
            message: "Token sent to email"
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was a problem in sending the email, Please try again later!', 500));
    }

});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // Get user based on the token
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExires: { $gt: Date.now() }
    });

    // if token has not expired and there is a user, set the new password,
    if (!user) {
        return next(new AppError("Token is invalid or has expired", 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExires = undefined;
    await user.save();
    //Update the changePasswordAt property for the user
    createSendToken(user, 200, res);
    //Log user in, send JWT
});


exports.updateMyPassword = catchAsync(async (req, res, next) => {
    // Get user from the collection
    const user = await User.findById(req.user.id).select("+password");
    // console.log(user.password, req.body.passwordCurrent);
    // Check if the posted password us correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError("The password entered is Incorrect, Please try again", 401));
    }
    // If so update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // Log user in, send JWT
    createSendToken(user, 200, res);

});