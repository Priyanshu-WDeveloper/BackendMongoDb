const whitelist = [
  "http://www.google.com",
  "http://localhost:3000",
  "http://localhost:3500",
  "http://localhost:5173",
  "http://localhost:5174",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
