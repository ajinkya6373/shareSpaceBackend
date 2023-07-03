const mongoose = require("mongoose");

const bookMarkSchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId, ref: "User"
  },
  bookMarkItems: [{
    post: {
      type: mongoose.Schema.Types.ObjectId, ref: "Posts",
    },
  }]
}, { timestamps: true });
module.exports  = mongoose.model('bookMarkList', bookMarkSchema);
