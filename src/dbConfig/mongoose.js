const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
<<<<<<< HEAD
      "mongodb+srv://pidev:pidev@cluster0.ckgz9.mongodb.net/pidev?retryWrites=true&w=majority",
=======
      "mongodb://0.0.0.0:27017/pi",
      //"mongodb+srv://pidev:pidev@cluster0.ckgz9.mongodb.net/pidev?retryWrites=true&w=majority",

>>>>>>> dfd7ec22f3bda219bce920b245d03bf26ca4a91e
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );  

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
