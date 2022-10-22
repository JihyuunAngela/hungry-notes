const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth"); // .. up one level; 

//Main Routes - simplified for now
router.get("/", homeController.getIndex);
router.get("/profile", ensureAuth, postsController.getProfile); // when you want to use a middleware, use a second argument
router.get("/add", ensureAuth, postsController.getAdd);
router.get("/saved", ensureAuth, postsController.getSaved);

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.post("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;
