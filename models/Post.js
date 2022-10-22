const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  // image: {
  //   type: String,
  //   require: false,
  // },
  // cloudinaryId: {
  //   type: String,
  //   require: false,
  // },
  // imageLink: {
  //   type: String,
  //   require: false,
  // },
  ingredients: {
    type: String,
    required: false,
  },
  instructions: {
    type: String,
    required: false,
  },

  // linked recipe only
  link: {
    type: String,
    required: false,
  },

  // all
  likes: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);
