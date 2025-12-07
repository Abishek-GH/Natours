// Importing the necessary modules
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('unhandledException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED Exception!: Shutting Down Server...');
  server.close(() => {
    process.exit(1);
  });
});

// It uses the configuration variables file path
dotenv.config({ path: './config.env' });

// Replacing the Passowrd with the DB Password present in the local env variables file
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// DB is the connection string from the atlas server
mongoose.connect(DB).then(() => console.log('DB connection was successfull!'));

const app = require('./app');
const { getTourStats } = require('./controllers/tourController');

// Starting the Server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('Server is Running');
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION!: Shutting Down Server...');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM Received, Shutting down gracefully');
  server.close(() => {
    console.log('Process Terminated');
  });
});
