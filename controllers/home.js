const Post = require("../models/Post");
const User = require("../models/User");

module.exports = {
  getIndex: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean(); // .lean to use it in a template
      res.render("index.ejs", { posts: posts, user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
  getSearch: async (req, res) => {
    try {
      let search = req.query.search
      const posts = await Post.find({
        $text: {
          $search: search,
          $caseSensitive: false,
        }})
     
      console.log(posts)

      res.render('search.ejs', { posts: posts, search: search, user: req.user });
     
    } catch (err) {
      console.log(err);
    }
  }
};
