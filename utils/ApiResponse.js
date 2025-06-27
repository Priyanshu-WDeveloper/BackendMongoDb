class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode >= 200 && statusCode < 300; // true for success codes
  }
}
module.exports = ApiResponse;
// Usage example:
// const ApiResponse = require('./ApiResponse');
// const response = new ApiResponse(200, { id: 1, name: 'John Doe' }, 'User fetched successfully');
// res.status(response.statusCode).json(response);
// This code defines a class ApiResponse
// that is used to create a standardized response object for API responses.
// The class constructor takes three parameters: statusCode, data, and message.
// - statusCode: The HTTP status code for the response (e.g., 200, 404, 500).
// - data: The data to be included in the response, which can be any type (object, array, etc.).
// - message: An optional message to provide additional context about the response (default is "Success").
// The class also has a success property that is set to true if the status code indicates a successful response (2xx codes), and false otherwise.
// This class can be used to create consistent API responses across your application, making it easier to handle and parse responses on the client side.
// You can create an instance of ApiResponse and return it in your API routes, ensuring that all responses follow the same structure.
