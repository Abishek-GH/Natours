const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("./models/tourModel");
const User = require("./models/userModel");
const Review = require("./models/reviewModel");

dotenv.config({ path: `./config.env` })

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB)
    .then(() => console.log("Data Base Connected Successfully"));

const tours = fs.readFileSync(`${__dirname}/dev-data/data/tours.json`);
const users = fs.readFileSync(`${__dirname}/dev-data/data/users.json`);
const reviews = fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`);

const importData = async () => {
    try {
        await Tour.create(JSON.parse(tours));
        await User.create(JSON.parse(users), { validateBeforeSave: false });
        await Review.create(JSON.parse(reviews));
        console.log("Data was imported succesfully");
    } catch (err) {
        console.log(`Data was not Imported: ${err}`);
    }
    process.exit();
}

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data was deleted successfully");
    } catch (err) {
        console.log(`Data was not Deleted: ${err}`);
    }
    process.exit();
}

if (process.argv[2] === "--import") {
    importData();
    console.log("Data imported");
} else if (process.argv[2] === "--delete") {
    deleteData();
    console.log(deleteData);
}