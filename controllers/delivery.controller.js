const Pincode = require("../models/pincode.model");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const checkDelivery = asyncHandler(async (req, res) => {
  const { pincode } = req.params;

  const pin = await Pincode.findOne({ pincode });
  if (pin) {
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { pin, deliveryAvailable: true },
          "Delivery check successful"
        )
      );
  } else {
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { pin: null, deliveryAvailable: false },
          "No delivery service available for this pincode."
        )
      );
    // res.status(404).json({ message: 'No delivery service available for this pincode.' });
  }
});
const suggestPincode = asyncHandler(async (req, res) => {
  const query = req.query.query || "";
  //   console.log("query", query);

  //   const allPincodes = ["560001", "560002", "110001", "400001"];
  //   const results = allPincodes.filter((pin) => pin.startsWith(query));
  //   console.log("results", results);

  const results = await Pincode.find({
    pincode: { $regex: "^" + query },
  }).limit(10); // optional: limit suggestions
  const suggestions = results.map((r) => r.pincode);
  //   res.json(results);
  //   if (results.length !== 0) {
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        suggestions,
        suggestions.length > 0
          ? "Pincode suggestion successful"
          : "No pincodes found",
        "Pincode suggestion successful"
      )
    );

  // return res
  //   .status(404)
  //   .json(new ApiResponse(404, { results }, "No pincodes found"));
  //   }
});
module.exports = {
  checkDelivery,
  suggestPincode,
};
