const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      min: 3,
      max: 20,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    img: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    profilePicture: {
      url: {
        type: String,
        default: "https://res.cloudinary.com/dt43t4ytm/image/upload/v1633579584/socialApp/profiles/noAvatar_xw5jvy.png",
      },
      public_id: {
        type: String,
      },
    },
    coverPicture: {
      url: {
        type: String,
        default: "https://res.cloudinary.com/dt43t4ytm/image/upload/v1633579687/socialApp/profiles/noCover_pygyt0.png",
      },
      public_id: {
        type: String,
      },
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
    bio:{
      type:String,
      max: 50,
    },
    desc: {
      type: String,
      max: 50,
    },
    city: {
      type: String,
      max: 50,
    },
    from: {
      type: String,
      max: 50,
    },
    relationship: {
      type: Number,
      enum: [1, 2, 3],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
