// Importing the necessary modules
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Getting all users
exports.getAllUsers = factory.getAll(User);
// Getting all the tours
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find();
//     // Sending Response
//     res.status(200).json({
//         status: "Success",
//         results: users.length,
//         data: {
//             users
//         }
//     });
// });

// Get Me
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Creating an user
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not yet defined. Please Signup instead',
  });
};

// Getting an unique user
exports.getUser = factory.getOne(User);
// exports.getUser = (req, res) => {
//     res.status(500).json({
//         status: 'Error',
//         message: "This route is not yet defined"
//     });
// };

// Updating the data of the current user
exports.updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) {
    filteredBody.photo = req.file.filename;
  }
  // Create an error if user posts password data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route is not for passwords Update, Please use /updateMyPassword', 400),
    );
  }

  //Update user Document
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Deactivating the data of the current user
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  //Deactivate user Document
  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

// Updating an user
// exports.updateUser = (req, res) => {
//     res.status(500).json({
//         status: 'Error',
//         message: "This route is not yet defined"
//     });
// };

// Deleting an user
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);
