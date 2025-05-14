const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const { v4: uuid } = require("uuid");
const { format } = require("date-fns"); //? it is main unless takes aload to load ??
const logEvents = async (message, logName) => {
  // console.log("Logged");
  const dateTime = `${format(new Date(), "yyyy-MM-dd\tHH:mm:ss")}`;
  // const dateTime = `${new Date()}`;
  const logItem = `${dateTime} \t ${uuid()} \t${message} \n`;

  try {
    //! contain only directory \/
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs")); //! contain only directory
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logName),
      logItem
    );
  } catch (error) {
    console.error(error);
  }
};

const logger = (req, res, next) => {
  logEvents(`${req.method}\t ${req.headers.origin} ${req.url}`, "reqlog.txt");
  console.log(req.method, req.path);
  next();
};

module.exports = { logEvents, logger };
