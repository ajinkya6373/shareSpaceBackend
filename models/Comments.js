const mongoose = require("mongoose");
const { Schema } = mongoose;

const replySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: {
      type: String,
      required: [true, "Cannot enter an empty Reply"],
    },
    parentId:{
      type: Schema.Types.ObjectId, ref: "Comment", 
    }
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema({
    userId:{ type: Schema.Types.ObjectId, ref: "User", required: true },
    text: {
        type: String,
        required: [true, "Cann't enter an empty Comment"],
      },
    replies:[replySchema]
},  { timestamps: true });


const commnets = new  mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts",
    required: true
  },
  commentList:[commentSchema]
},{ timestamps: true })

module.exports = mongoose.model("Comment",commnets);



