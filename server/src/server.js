const app = require("./app");
const connectDb = require("./config/db");
const env = require("./config/env");

const startServer = async () => {
  try {
    await connectDb();

    app.listen(env.port, () => {
      console.log(`API server listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
