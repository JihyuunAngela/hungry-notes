const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.post("/createComment/:id", ensureAuth, commentsController.createComment);

router.get("/edit/:id", ensureAuth, commentsController.editCommentPage);
router.put("/editComment/:id", ensureAuth, commentsController.editComment);
router.delete("/deleteComment/:id", commentsController.deleteComment);

module.exports = router;
