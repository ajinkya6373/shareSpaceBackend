const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    img: {
        url: {
          type: String,
        },
        public_id: {
          type: String,
        },
      },
    desc: {
        type: String,
        max: 500,
    },
    likes: {
        type: Array,
        default: [],
    },
  
}, {timestamps: true}

)

module.exports=mongoose.model("Posts",postSchema)