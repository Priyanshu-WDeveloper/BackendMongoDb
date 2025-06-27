const axios = require("axios");
const ApiResponse = require("../utils/ApiResponse");

const DUMMY_JSON_BASE_URL = "https://dummyjson.com";

const proxyDummyJson = async (req, res) => {
  // console.log("paathhhhh", req.path);

  try {
    // Extract the path after /api/dummy

    const path = req.path;
    // console.log("path", path);

    const queryString = Object.keys(req.query).length
      ? "?" + new URLSearchParams(req.query).toString()
      : "";
    const fullUrl = `${DUMMY_JSON_BASE_URL}${path}${queryString}`;
    // console.log(`Proxying request to: ${fullUrl}`);

    let requestConfig = {
      method: req.method,
      url: fullUrl,
      // data: req.method !== "GET" ? req.body : null, //? This is the cause of the problems
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    // Only include data for non-GET requests
    if (req.method !== "GET") {
      requestConfig.headers["Content-Type"] = "application/json";
      requestConfig.data = req.body;
    }

    const response = await axios(requestConfig);
    // Return the response data from DummyJSON
    // res.status(response.status).json(response.data);
    res
      .status(response.status)
      .json(new ApiResponse(200, response.data, "Successfully fetched data"));
  } catch (error) {
    console.error("Error proxying request to DummyJSON:", error);
    // Handle error responses from DummyJSON and forward them

    if (error.response) {
      console.log("errror");

      return res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(500).json({
        message: "No response received from DummyJSON API",
      });
    } else {
      // Generic error for network/server errors

      return res.status(500).json({
        message: "Error connecting to DummyJSON API",
        error: error.message,
      });
    }
  }
};

module.exports = { proxyDummyJson };
