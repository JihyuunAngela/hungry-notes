// bring express
const express = require("express");
// create router
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now

// GET /post/:id
router.get("/:id", ensureAuth, postsController.getPost);
// GET /post/createPost
router.post("/createPost", upload.single("file"), postsController.createPost);

router.put("/likePost/:id", postsController.likePost);

router.delete("/deletePost/:id", postsController.deletePost);


//export the router
module.exports = router;
