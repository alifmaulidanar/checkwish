const winston = require("winston");
const { createLogger, transports, format } = winston;

const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    // Output ke file error.log
    new transports.File({
      level: "error",
      filename: "./log/error.log",
      handleExceptions: true,
      maxsize: 20971520, // 20MB
      maxFiles: 5,
    }),
    // Output ke file combined.log
    new transports.File({
      filename: "./log/combined.log",
      handleExceptions: true,
      maxsize: 20971520, // 20MB
      maxFiles: 5,
    }),
    // Output ke konsol
    // new transports.Console({
    //   format: format.combine(format.colorize(), format.simple()),
    // }),
  ],
  exitOnError: false,
});

module.exports = logger;
