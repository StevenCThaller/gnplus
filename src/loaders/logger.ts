import winston from "winston";
import config from "@config/index";
import path from "path";

const transports = [];
if (process.env.NODE_ENV !== "development") {
  transports.push(new winston.transports.Console());
} else {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.cli(), winston.format.splat())
    })
  );
}

transports.push(
  new winston.transports.File({
    level: "error",
    filename: path.join(__dirname, "..", "..", "logs", "errors.log")
  })
);

const LoggerInstance = winston.createLogger({
  level: config.logs.level,
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports
});

export default LoggerInstance;
