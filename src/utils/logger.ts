import winston from "winston";
import "winston-mongodb";
import "dotenv/config";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/app.log" }),
    new winston.transports.MongoDB({
      db: process.env.MONGO_URI as string, 
      collection: "logs",
      options: { useUnifiedTopology: true },
      level: "info",
    }),
  ],
});

export default logger;
