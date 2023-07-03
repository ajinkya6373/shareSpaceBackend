const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");


router.post("/register", async (req, res) => {
  try {
    // Generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    // Save user
    const user = await newUser.save();

    // Return a success response with limited user data
    res.status(200).json({
      success: true,
      message: "Successfully Created account",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture:user.profilePicture.url
      },
    });
  } catch (err) {
    // Handle error and return an error response
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: err.message,
    });
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  try {
    const {email,password} = req.body;
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Return a success response with limited user data
    res.status(200).json({
      success: true,
      message: "Successfully loggedIn",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture:user.profilePicture.url,
        coverPicture:user.coverPicture.url
      },
    });
  } catch (err) {
    // Handle error and return an error response
    res.status(500).json({
      success: false,
      message: "Failed to log in",
      error: err.message,
    });
  }
});



module.exports = router