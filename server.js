const express = require("express");
const mongoose = require("mongoose"); //using Mongoose for MongoDB
const cors = require("cors");
const bcrypt = require('bcrypt'); // For password hashing
require('dotenv').config()


// const mongoURI = "mongodb://localhost:27017/?directConnection=true";
const mongoURI = `${process.env.MONGO_URL}`;


mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("RegisteredUser", userSchema);

const saltRounds = 10; // Adjust the number of rounds for hashing

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const app = express();
app.use(express.json());
app.use(cors());

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.json("userNotFound"); // User not found
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.json("success"); // Login successful (you might send user data here)
    } else {
      res.json("incorrectPassword"); // Incorrect password
    }
  } catch (error) {
    console.error(error);
    res.json("fail"); // Login failed
  }
});

// Register Route
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.json("exist"); // User already exists
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.json("success"); // Registration successful
  } catch (error) {
    console.error(error);
    res.json("fail"); // Registration failed
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server listening on port 8000");
});
