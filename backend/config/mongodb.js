const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongooseConnection = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/meeting-rag",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log(`MongoDB connected: ${mongooseConnection.connection.host}`);
    return mongooseConnection;
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
