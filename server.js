require("dotenv").config();
const path = require("path");

const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const { logEvents, logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const { error } = require("console");
const corsOptions = require("./config/corsOptions");
const verifyJWT = require("./middleware/verifyJWT");
const connectDB = require("./config/dbConn");

const app = express();

const PORT = process.env.PORT || 3500;
//connect to mongoDB
connectDB();
//custom middleware logger
app.use(logger);

app.use(cors(corsOptions));
//for content type: form x www.form.com
app.use(express.urlencoded({ extended: false }));
// for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());
// for static file
app.use("/", express.static(path.join(__dirname, "/public"))); // public the folder or file to the frontend
app.use("/subdir", express.static(path.join(__dirname, "/public")));
app.use("/", require("./routes/root"));
app.use("/api/dummy", require("./routes/api/dummyJson"));
app.use("/auth", require("./routes/auth.route.js"));
app.use("/register", require("./routes/register.route.js"));
app.use("/subdir", require("./routes/subdir"));
app.use("/refresh", require("./routes/refresh"));
app.use(verifyJWT); // verify JWT token for all routes and also give them data??
app.use("/logout", require("./routes/logout.route.js"));
app.use("/employees", require("./routes/api/employees"));
app.use("/users", require("./routes/api/users.route.js"));
app.use("/followingUsers", require("./routes/api/followingUsers"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 NOT FOUND" });
  } else {
    res.type("txt").send("404 NOT FOUND");
  }
});
// Add this at the end of your server.js or app.js
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}/`));
});
