const cors = require("cors");
const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const { errorHandler, notFound } = require("./middleware/error.middleware");
const { apiLimiter } = require("./middleware/rateLimit.middleware");
const authRoutes = require("./routes/auth.routes");
const contentRoutes = require("./routes/content.routes");
const healthRoutes = require("./routes/health.routes");
const practiceRoutes = require("./routes/practice.routes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(mongoSanitize());

if (env.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

app.use("/api", apiLimiter);
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", contentRoutes);
app.use("/api", practiceRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
