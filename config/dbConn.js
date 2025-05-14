const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.DATABASE_URI;
  if (!uri) {
    throw new Error("DATABASE_URI environment variable not set.");
  }
  try {
    await mongoose.connect(uri);
    // If you see deprecation warnings, consider uncommenting below:
    // await mongoose.connect(uri, {
    //   useUnifiedTopology: true,
    //   useNewUrlParser: true,
    // });
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error);
    // Optionally: process.exit(1);
  }
};
module.exports = connectDB;
