const { logEvents } = require("./logEvents");

const errorHandler = (err, req, res, next) => {
  logEvents(`${err.name}\t ${err.message}`, "errLog.txt");
  console.error(err.stack);

  // res.status(500).send(err.message);
  // Add this at the end of your server.js or app.js
  // console.log(`Error===============: ${err.statusCode}`);

  // Normalize known errors
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error.";

  if (err.name === "CastError") {
    message = `Invalid ${err.path}`;
    statusCode = 400;
  } else if (err.name === "JsonWebTokenError") {
    message = `JWT is invalid. Try logging in again.`;
    statusCode = 401;
  } else if (err.name === "TokenExpiredError") {
    message = `JWT has expired. Please re-authenticate.`;
    statusCode = 401;
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate ${field} entered.`;
    statusCode = 409;
  }

  // Send response
  res.status(err.statusCode || 500).json({
    statusCode: err.statusCode || 500,
    message,
    // message: err.message || "Internal Server Error",
    errors: err.errors || [],
    success: false,

    // Optionally include stack in development:
    // stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
