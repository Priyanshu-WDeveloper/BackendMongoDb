class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    // this.data = null; //! Commented out to avoid confusion with the new structure
    // this.data = {
    //   message,
    //   errors,
    //   stack,
    // };
    this.message = message;
    this.success = false;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
    // this.isOperational = true; // to differentiate between operational and programming errors
  }
}

module.exports = ApiError;
// Usage example:
// const ApiError = require('./ApiError');
// throw new ApiError(404, 'Resource not found', ['Invalid ID'], new Error().stack);

// This code defines a custom error class ApiError that extends the built-in Error class in JavaScript.
// It allows you to create error objects with a specific status code, message, and additional data such as errors and stack trace.
// This can be useful for handling errors in a consistent way across your application, especially in APIs where you want to return structured error responses.
// The class constructor takes parameters for status code, message, errors, and stack trace, and initializes the properties accordingly.
// The class also sets the success property to false, indicating that this is an error response.
// The stack trace is captured automatically unless provided, which helps in debugging.
// The module exports the ApiError class, allowing it to be used in other parts of the application.
