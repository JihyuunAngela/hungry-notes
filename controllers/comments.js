const { fileURLToPath } = require("url");
const Comment = require("../models/Comment");
const Post = require("../models/Post");

module.exports = {
  createComment: async (req, res) => {
    try {
      await Comment.create({
        comment: req.body.comment,
        likes: 0,
        post: req.params.id,
        user: req.user._id
      });
      console.log("Comment has been added!");
      res.redirect("/post/"+req.params.id, );
    } catch (err) {
      console.log(err);
    }
  },
  deleteComment: async (req, res) => {
    try {
      // Delete comment from db
      let postID = await Comment.find({ _id: req.params.id });
      await Comment.deleteOne({ _id: req.params.id });
      console.log(postID[0].post)
      console.log("Deleted Comment");
      res.redirect(`/post/${postID[0].post.valueOf()}`);
    } catch (err) {
      res.redirect(`/post/${postID[0].post.valueOf()}`);
    }
  },
};
