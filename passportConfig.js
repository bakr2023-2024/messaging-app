const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("./model");
const bcrypt = require("bcryptjs");
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false, { message: "invalid username" });
      if (!bcrypt.compareSync(password, user.password))
        return done(null, false, { message: "invalid password" });
      return done(null, user);
    } catch (err) {
      done(err);
    }
  })
);
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
module.exports = passport;
