import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { connectDB } from "./database/mongoose.js";

const start = async () => {
  try {
    // check database connection env
    const dbConnectionEnv = config.MONGODB_URI;
    console.log("Database connection string:", dbConnectionEnv);

    await connectDB(config.MONGODB_URI);
    const app = createApp();
    app.listen(config.PORT, () => {
      console.log(`🚀 Server listening on port ${config.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

start();
