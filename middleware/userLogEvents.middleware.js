const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const { format } = require("date-fns");

const LogEvents = async (message, logname) => {
  const log = format(new Date(), "EEEE,MMMM do yyyy\t HH:mm:ss");
  const logMessage = `🔐📝 ${log} 🐛\n ${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs", "userLogs"))) {
      fs.mkdirSync(path.join(__dirname, "..", "logs", "userLogs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", "userLogs", logname),
      logMessage
    );
    //   fs.appendFile(logMessage, path.join(__dirname, "log", logname));
  } catch (error) {
    console.error(error);
  }
};

module.exports = LogEvents;
