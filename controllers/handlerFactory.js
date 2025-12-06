const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

// Delete a doc
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return new AppError('No Document found with that ID', 404);
    }

    res.status(200).json({
      status: 'Success',
      data: null,
    });
  });

// Update a doc
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return new AppError('No document found with that ID', 404);
    }

    res.status(200).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  });

// Create A Doc
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // const newdoc = new doc({});
    // newdoc.save();
    //The same thing is acheived below. As this a async function we are using async and await
    const newdoc = await Model.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: {
        doc: newdoc,
      },
    });
  });

// Get an unique doc
exports.getOne = (Model, popPtions) =>
  catchAsync(async (req, res, next) => {
    let query = await Model.findById(req.params.id);
    if (popPtions) query = query.populate(popPtions);
    const doc = await query;

    if (!doc) {
      return new AppError('No Tour found with that ID', 404);
    }

    res.status(200).json({
      status: 'Success',
      data: {
        doc,
      },
    });
  });

// Get all Documents

// Getting all the tours
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow nested Get  Reviews On Tour
    filter = {};

    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }

    const apiFeatures = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();

    const docs = await apiFeatures.query; // .explain();

    // Sending Response
    res.status(200).json({
      status: 'Success',
      results: docs.length,
      data: {
        docs,
      },
    });
  });
