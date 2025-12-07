class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'Fail' : 'Error';
    this.isOperational = true;
    // In this way if teh AppError function is called it will not show it self in the stack track errors and will not pollute it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
