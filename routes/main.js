const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth"); // .. up one level; 

//Main Routes - simplified for now
router.get("/", homeController.getIndex);

//profiles
router.get("/profile/:id", postsController.getAuthorProfile) // others profile

router.get("/add", postsController.getAdd);
router.get("/saved", postsController.getSaved);

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.post("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

router.get("/search", homeController.getSearch);

module.exports = router;
