const whitelist = [
  // "http://localhost:3000",
  // "http://localhost:3500",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://ever-basket.vercel.app/",
  "https://ever-basket.vercel.app",
];
const corsOptions = {
  origin: (origin, callback) => {
    // console.log("CORS Origin:", origin);

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
