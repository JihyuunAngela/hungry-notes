const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const SavedPost = require("../models/SavedPost");
const Comment = require("../models/Comment");
const { render } = require('ejs');
const User = require('../models/User');

module.exports = {
  getAuthorProfile: async (req, res) => {
    try {
      const author = await User.findById(req.params.id).lean()
      const posts = await Post.find({ user: req.params.id }).lean() // limit to the user
      res.render("profile.ejs", { posts: posts, author: author, user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
  getAdd: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean(); // .lean to use it in a template
      if (!req.user) {
        res.redirect("/login")
      } else {
        res.render("add.ejs", {posts: posts, user: req.user} );
      }
    } catch (err) {
      console.log(err);
    }
  },
  getSaved: async (req, res) => {
    try {

      if (!req.user) {
        res.redirect("/login")
      } else {
        // array of saved posts in Saved Model with post id only
        const saved = await SavedPost.find({ user: req.user.id}).lean();
        let promises = [];

        // array of saved posts in Post Model
        for (i=0; i < saved.length; i++ ) {
          const found = await Post.find( {_id: saved[i].postID} );
          promises = promises.concat(found)
        }
        const savedPosts = await Promise.all(promises);
        const originalPosts = await Post.find({ user: req.user.id }).lean();
        // combined posts
        const all = savedPosts.concat(originalPosts);

        // order in alphabetical 
        all.sort(function(a, b) {
          return a.title.localeCompare(b.title);
          });

        res.render("saved.ejs", {posts: all, user: req.user} );
        }
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const comments = await Comment.find({post: req.params.id, user: req.user}).sort({createdAt: "desc"}).lean();
      const author = await User.findById(post.user).lean()
      const isSavedTrue = await SavedPost.find({user: req.user, postID: req.params.id}).lean()

      res.render("post.ejs", { post: post, user: req.user, author: author, comments: comments, saved: isSavedTrue} );
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      console.log(req.body)
      await Post.create({
        type: 'OriginalRecipe',
        title: req.body.title,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  },
  createPostUsingLink: async (req, res) => {
    try {
      await Post.create({
        type: 'LinkedRecipe',
        link: req.body.link,
        title: req.body.title,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  },
  savePost: async (req, res) => {
    try {
      if (!req.user) {
        res.redirect('/login')
      } else {
        await SavedPost.create({
          postID: req.params.id,
          user: req.user.id,
        });
        console.log("Post has been saved!");
        res.redirect(`/post/${req.params.id}`);
      }
      
    } catch (err) {
      console.log(err);
    }
  },
  unsavePost: async (req, res) => {
    try {
      if (!req.user) {
        res.redirect('/login')
      } else {
        await SavedPost.remove({ postID: req.params.id });``
        console.log("Unsave Post");
        res.redirect(`/post/${req.params.id}`);
      }
    }catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate( // mongoose method
        { _id: req.params.id }, // find id
        {
          $inc: { likes: 1 }, // request what to replace
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`); // redirect 
    } catch (err) {
      console.log(err);
    }
  },
  editPostPage: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).lean()
      if ( !post ) {
        return res.render("error/404")
      }

      if (post.user != req.user.id) {
        res.redirect(`/post/${req.params.id}`)
      } else {
        res.render("edit.ejs", {post: post, user: req.user} );
      }
    } catch (err) {
      console.log(err);
    }
  },
  editPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).lean()
      if ( !post ) {
        return res.render("error/404")
      }

      if (post.user != req.user.id) {
        res.redirect(`/post/${req.params.id}`)
      } else {
        await Post.findOneAndUpdate( // mongoose method
        { _id: req.params.id }, // find id
        req.body, // req what to replace
        );
      console.log("Post edited");
      res.redirect(`/post/${req.params.id}`); // redirect 
      }
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id, type: 'OriginalRecipe' }); // check to see if post is there
      // Delete post from db
      await Post.deleteOne({ _id: req.params.id });
      await Comment.deleteMany( {post: req.params.id} )
      console.log("Deleted Post");
      res.redirect("/");
    } catch (err) {
      res.redirect("/");
    }
  },
  deletePostWithLink: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id, type: 'LinkedRecipe' }); // check to see if post is there
      // Delete post from db
      await Post.deleteOne({ _id: req.params.id });
      await Comment.deleteMany( {post: req.params.id} )
      console.log("Deleted Post");
      res.redirect("/");
    } catch (err) {
      res.redirect("/");
    }
  },
};
