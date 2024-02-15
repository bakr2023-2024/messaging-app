var express = require("express");
var router = express.Router();
const { isAuthenticated, isNotAuthenticated } = require("../authMiddleware");
const passport = require("passport");
const { User } = require("../model");
const bcrypt = require("bcryptjs");
router.get("/", isAuthenticated, function (req, res, next) {
  res.render("chat", { username: req.user.username });
});
router.get("/login", isNotAuthenticated, (req, res) => {
  res.render("login");
});
router.post(
  "/login",
  isNotAuthenticated,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect("/");
  }
);
router.get("/register", isNotAuthenticated, (req, res) => {
  res.render("register");
});
router.post("/register", isNotAuthenticated, async (req, res) => {
  try {
    let userExists = await User.findOne({ username: req.body.username });
    if (userExists) {
      req.flash("error", "user already exists with that username");
      return res.redirect("/register");
    }
    if (req.body.password !== req.body.confPassword) {
      req.flash("error", "passwords don't match");
      return res.redirect("/register");
    }
    const user = new User({
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 10),
    });
    await user.save();
    req.login(user, (err) => {
      console.log(err);
      if (err) {
        req.flash("error", "couldn't sign in");
        return res.redirect("/register");
      } else res.redirect("/");
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "one or more fields missing");
    return res.redirect("/register");
  }
});
router.delete("/logout", isAuthenticated, (req, res, next) => {
  req.logout((err) => {
    if (err) return res.sendStatus(400);
    else res.status(200).send("Logout successful");
  });
});
module.exports = router;
