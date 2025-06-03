require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const { logEvents, logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const { error } = require("console");
const corsOptions = require("./config/corsOptions");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");

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
app.use("/", express.static(path.join(__dirname, "/public")));
app.use("/subdir", express.static(path.join(__dirname, "/public")));
app.use("/", require("./routes/root"));
app.use("/api/dummy", require("./routes/api/dummyJson"));
app.use("/auth", require("./routes/auth"));
app.use("/register", require("./routes/register"));
app.use("/subdir", require("./routes/subdir"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));
app.use(verifyJWT); // verify JWT token for all routes and also give them data??
app.use("/employees", require("./routes/api/employees"));
app.use("/users", require("./routes/api/users"));
app.use("/followingUsers", require("./routes/api/followingUsers"));

//route handlers
// app.get(
//   "/hello(.html)?",
//   (req, res, next) => {
//     console.log("Hello requested");
//     next();
//   },
//   (req, res) => {
//     res.send("Hello");
//   }
// );
// const one = (req, res, next) => {
//   console.log("one");
//   next();
// };
// const two = (req, res, next) => {
//   console.log("two");
//   next();
// };
// const three = (req, res) => {
//   console.log("three");
//   res.send("Chain three");
// };
// app.get("/chain", [one, two, three]);
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
app.use(errorHandler);

// app.get(/^\/$|^\/index(\.html)?$/, (req, res) => {
//   res.sendFile("./views/index.html",{root: __dirname}));
// });
// app.get(/^\/newpage(\.html)?$/, (req, res) => {
//   res.sendFile(path.join(__dirname, "views", "newpage.html"));
// });
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}/`));
});
