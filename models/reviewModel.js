const { ObjectId, MongoNotConnectedError } = require("mongodb");
const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: [true, "Review cannot be empty"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, "Review must belong to a Tour!"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "Review Must belong to a User"]
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });


reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: "tour",
    //     select: "name"
    // }).populate({
    //     path: "user",
    //     select: "name photo"
    // });

    this.populate({
        path: "user",
        select: "name photo"
    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: "$tour",
                nRating: { $sum: 1 },
                avgRating: { $avg: "$rating" }
            }
        }
    ]);
    console.log(stats);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].nRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 0,
            ratingsQuantity: 4.5
        });
    }

};

// Post Function doesnot have access to next
reviewSchema.post("save", function () {
    this.constructor.calcAverageRatings(this.tour);
});

// We dont have document middle ware for the below hooks
// We only have query middleware

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//     // const re = await this;
//     const r = await this.clone().findOne();
//     console.log(r);
//     // console.log(re);
// });


// To Be Checked later Lecture No 169
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.current_review = await this.clone().findOne();
    console.log(this.current_review);
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    await this.current_review.constructor.calcAverageRatings(this.current_review.tour);
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;