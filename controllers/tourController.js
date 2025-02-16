// Importing the necessary modules
const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const User = require('./../models/userModel');
const sharp = require('sharp');
const multer = require('multer');

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

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImage = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) {
    return next();
  }
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
});
// upload.single('image');
// upload.array('images', 5);
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// Exporting this module exports. is used to export the functions

// Create a checkBody Middleware
// Check if body contains the name and price property
// If not, send back 400 request
// Add it to the post hnadler stack.
// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: "Fail",
//             message: "Missing name or price data"
//         })
//     }
//     next();
// }

// Creating a param middle ware
// Here param middle ware is created
// Param middleware is a middleware which runs only when a specific parameter is present in the URL (Here its id)
// Return function is importnat in the below code else if the id is invalid still the code will be executing
// exports.checkID = (req, res, next, val) => {
//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: "Fail",
//             message: "Invalid ID"
//         });
//     }
//     next();
// };

// Alias API
exports.aliasTopTours = catchAsync((req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
});

// Get All Tours
exports.getAllTours = factory.getAll(Tour);
// Getting all the tours
// exports.getAllTours = catchAsync(async (req, res, next) => {

//     // Building Query
//     // // Filtering
//     // const queryObj = { ...req.query };
//     // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//     // excludedFields.forEach(el => delete queryObj[el]);

//     // // Advanced Filtering
//     // let queryStr = JSON.stringify(queryObj);
//     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

//     // // Executing Query
//     // let query = Tour.find(JSON.parse(queryStr));

//     // // Sorting
//     // if (req.query.sort) {
//     //     const sortBy = req.query.sort.split(',').join(' ');
//     //     query = query.sort(sortBy);
//     // } else {
//     //     query = query.sort("-createdAt");
//     // }

//     // // Limiting
//     // if (req.query.fields) {
//     //     const fields = req.query.fields.split(',').join(' ');
//     //     query = query.select(fields);
//     // } else {
//     //     query = query.select("-__v");
//     // }

//     // // Pagination
//     // const page = req.query.page * 1 || 1;
//     // const limit = req.query.limit * 1 || 100;
//     // const skip = (page - 1) * limit;

//     // query = query.skip(skip).limit(limit);

//     // if (req.query.page) {
//     //     const numTours = await Tour.countDocuments();
//     //     if (skip >= numTours) throw new Error("This page does not exist");
//     // }

//     const apiFeatures = new APIFeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limit()
//         .paginate();

//     const tours = await apiFeatures.query;

//     // Sending Response
//     res.status(200).json({
//         status: "Success",
//         results: tours.length,
//         data: {
//             tours
//         }
//     });

// });

/* Using API
exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: "Success",
        // results: tours.length,
        // data: {
        //     tours
        // }
    });
};
*/

// // Get an unique tour
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// // Getting an unique tour
// exports.getTour = catchAsync(async (req, res, next) => {

//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     if (!tour) {
//         return (new AppError('No Tour found with that ID', 404));
//     }
//     res.status(200).json({
//         status: "Success",
//         data: {
//             tour
//         }
//     });

// });

/* Using API
exports.getTour = (req, res) => {
    const id = req.params.id;
    // const tour = tours.find(el => el.id == id);
    res.status(200).json({
        status: "Success",
        // results: tour.length,
        // data: {
        //     tour
        // }
    });
};
*/

// Create A TOur
exports.createTour = factory.createOne(Tour);
// // Creating a tour
// exports.createTour = catchAsync(async (req, res, next) => {
//     // const newTour = new Tour({});
//     // newTour.save();
//     //The same thing is acheived below. As this a async function we are using async and await
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//         status: "Success",
//         data: {
//             tour: newTour
//         }
//     });
// });

/* Using API
exports.createTour = (req, res) => {
    // let newId = tours[tours.length - 1].id + 1;
    // console.log(`This is the new ID: ${newId}`);
    // let newTour = Object.assign({ id: newId }, req.body);
    // tours.push(newTour);
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    //     res.status(201).json({
    //         status: "Success",
    //         data: {
    //             tour: newTour
    //         }
    //     });
    // });
}
*/
// Update A Tour
exports.updateTour = factory.updateOne(Tour);

// // Updating a tour
// exports.updateTour = catchAsync(async (req, res, next) => {

//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     });

//     if (!tour) {
//         return (new AppError('No Tour found with that ID', 404));
//     }

//     res.status(200).json({
//         status: "Success",
//         data: {
//             tour
//         }
//     });

// });
/* Using API
exports.updateTour = (req, res) => {
    const id = req.params.id;
    // const tour = tours.find(el => el.id == id);
    res.status(200).json({
        status: "Success",
        message: "Patch request was successfull"
    });
};
*/

// Deleting A Tour
exports.deleteTour = factory.deleteOne(Tour);

// // Deleting a tour
// exports.deleteTour = catchAsync(async (req, res, next) => {

//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     if (!tour) {
//         return (new AppError('No Tour found with that ID', 404));
//     }

//     res.status(200).json({
//         status: "Success",
//         data: null
//     })

// });
/* Using API
exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: "Success",
        data: null
    });
};
*/

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTour: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    data: {
      stats,
    },
  });
});

// Aggregrate Functions for for doing basic mathematical operations
exports.monthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      // Unwind is used to unpack the elemensta packed in a single object.
      $unwind: '$startDates',
    },

    // Here the result will show only if the document matches with the below condition.
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    // Here we are grouping the results based on the conditions applied
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    // This is to add additional fields to the results without actually adding it into the db
    {
      $addFields: { month: '$_id' },
    },
    // This is to enable or disable the value in the results
    {
      $project: {
        _id: 0,
      },
    },
    // It sort accoring either in ascending order using 1 or in descending order using -1
    {
      $sort: {
        numTourStarts: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    data: {
      plan,
    },
  });
});

// tour-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithIn = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // Mongo DB accepts the data only in the unit radians
  // To convert it the distance into radians we have to divide the distance by the Earth's radius (In Miles or In Kilometers)
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lng || !lat) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lng || !lat) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      data: distances,
    },
  });
});
