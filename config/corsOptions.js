const whitelist = [
  // "http://localhost:3000",
  // "http://localhost:3500",
  // "http://localhost:5173",
  // "http://localhost:5174",
  // "http://localhost:5175",
  "https://ever-basket.vercel.app/",
  "https://ever-basket.vercel.app",
  "https://backendmongodb-s30u.onrender.com",
  "https://backendmongodb-s30u.onrender.com/",
  "https://o4509439141412864.ingest.us.sentry.io/api/4509439158321152/envelope/?sentry_version=7&sentry_key=8b8792473ed68a3187a61fc7381f5cea&sentry_client=sentry.javascript.react%2F9.25.1",
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
