// Importing the necessary modules
const express = require('express');
const morgan = require('morgan');
const app = express();
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const viewRouter = require('./routes/viewRoutes');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

// const { CrossOriginResourcePolicy } = require('cross-origin-resource-policy');
app.enable('trust proxy');

// Set Templating Engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.options('*', cors());

// Start Express App
// Requiring Route Handlers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');

// Getting the enivornment variables
// console.log(app.get("env"));
// console.log(process.env.NODE_ENV);

// MiddleWare
/* 
// Request reposnse Cycle
1. app.use is used to call a middleware
2. Middleware applies to every single route 
3. Middleware must be present before the request response cycle ends
4. Everything should be in order in express js
5. Morgan is the middleware used to see the request right in the console.

Express app receives a request when someone hits a server for which then create a request and response object.
Everything is middleware (Even Routers)

Examples of MiddleWare: 
1. Body Parser
2. Logging
3. Setting Headers 
4. Router
After each middleware a next function is called
For the last middle ware we use the res.send function
*/

// The below middlewares applies for all the routes.

// Set security HTTP headers
//Set Security HTTP headers
app.use(helmet());
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: ["'self'"],
//             baseUri: ["'self'"],
//             fontSrc: ["'self'", 'https:', 'data:'],
//             scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com/ajax/libs/axios/0.20.0/axios.min.js'],
//             objectSrc: ["'none'"],
//             styleSrc: ["'self'", 'https:', 'unsafe-inline'],
//             upgradeInsecureRequests: [],
//         },
//     })
// );

// Development login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

if (process.env.NODE_ENV === 'production') {
  console.log('You are in PRODUCTION!');
}

// Setting rate limit
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: 'Too Many requests from this IP, please try again in a hour',
  validate: { trustProxy: false }, // Avoid permissive trust warnings
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL Query Injection
app.use(mongoSanitize());

// Data sanitization from xss
app.use(xss());

// Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Middleware for serving static files
// This sends the static files in to the webpage
// Here the public folder will be the root folder and the required files can be accessed using the directory in respect to the public(root folder)

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, `public`)));

// The below middle ware applies only for those routes.
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// Exporting this module
module.exports = app;
