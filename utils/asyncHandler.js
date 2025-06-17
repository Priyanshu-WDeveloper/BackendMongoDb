const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
module.exports = asyncHandler;
// This code defines a utility function `asyncHandler` that wraps an asynchronous request handler function.
// It ensures that any errors thrown within the asynchronous function are caught and passed to the next middleware in the Express.js error handling chain.
// This is useful for avoiding repetitive try-catch blocks in your route handlers, allowing you to write cleaner and more concise code.
// The `asyncHandler` function takes a request handler function as an argument and returns a new function that handles the request, response, and next middleware.
// Inside the returned function, it uses `Promise.resolve` to ensure that the request handler is executed as a promise.
// If the promise is rejected (i.e., an error occurs), it catches the error and passes it to the `next` function, which is typically used for error handling in Express.js.
// This way, you can use `asyncHandler` to wrap your route handlers and automatically handle errors without cluttering your code with try-catch blocks.

//* Other Choice for asyncHandler
// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }
