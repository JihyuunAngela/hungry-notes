module.exports = {
  ensureAuth: function (req, res, next) { // next runs when it is done
    if (req.isAuthenticated()) { //if authenticated, do next; if not, go back home
      return next();
    } else {
      res.redirect("/");
    }
  },
  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) { // if guest next; if not go to dashboard
      return next();
    } else {
      res.redirect("/dashboard");
    }
  },
};
