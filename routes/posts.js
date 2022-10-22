// bring express
const express = require("express");
// create router
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now

// GET /post/:id
router.get("/:id", postsController.getPost);
// GET /post/createPost
router.post("/createPost", upload.single("file"), postsController.createPost);
router.post("/createPostUsingLink", upload.single("file"), postsController.createPostUsingLink);
// save posts
router.post("/savePost/:id", postsController.savePost);
router.delete("/unsavePost/:id", postsController.unsavePost)
// like post
router.put("/likePost/:id", postsController.likePost);
// edit posts
router.get("/edit/:id", postsController.editPostPage)
router.put("/editPost/:id", postsController.editPost);
// delete post
router.delete("/deletePost/:id", postsController.deletePost);
router.delete("/deletePostWithLink/:id", postsController.deletePostWithLink);


//export the router
module.exports = router;
