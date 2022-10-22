const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const SavedPost = require("../models/SavedPost");
const Comment = require("../models/Comment");
const { render } = require('ejs');

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id }); // limit to the user
      res.render("profile.ejs", { posts: posts, user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
  getAdd: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean(); // .lean to use it in a template
      res.render("add.ejs", {posts: posts, user: req.user} );
    } catch (err) {
      console.log(err);
    }
  },
  getSaved: async (req, res) => {
    try {
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
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const comments = await Comment.find({post: req.params.id, user: req.user}).sort({createdAt: "desc"}).lean();
      const isSavedTrue = await SavedPost.find({user: req.user, postID: req.params.id}).lean()

      res.render("post.ejs", { post: post, user: req.user, comments: comments, saved: isSavedTrue} );
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      // const result = await cloudinary.uploader.upload(req.file.path);
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
      const URL = req.body.link

      request(URL, function (err, resp, main) {
      if(err){
        console.log(err);
      }
      else{
        let $ = cheerio.load(main);

        $('main').each(function(index){
          const data = URL;
          const name = $(this).find('h1').text();
          // const image = $(this).find('figure').find('img').eq(0).attr('data-src') || $(this).find('figure').find('img').attr('data-jpibfi-src') || $(this).find('article').find('img').attr('src') || "https://res.cloudinary.com/dkyzxqrqb/image/upload/v1666297391/no-image_bwammd.png" ;

          // save recipe to mongoDB
          Post.create({
            type: 'LinkedRecipe',
            link: req.body.link,
            title: name,
            //imageLink: image,
            likes: 0,
            user: req.user.id,
          });
          console.log("Post has been added!");
          res.redirect("/");
        });
        }
      });
    } catch (err) {
      console.log(err);
    }
  },
  savePost: async (req, res) => {
    try {
      console.log(req.params)
      await SavedPost.create({
        postID: req.params.id,
        user: req.user.id,
      });
      console.log("Post has been saved!");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  unsavePost: async (req, res) => {
    try {
      await SavedPost.remove({ postID: req.params.id });``
      console.log("Unsave Post");
      res.redirect(`/post/${req.params.id}`);
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
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId); // must require an img for function to work
      // Delete post from db
      await Post.deleteOne({ _id: req.params.id });
      await Comment.deleteMany( {post: req.params.id} )
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
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
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
