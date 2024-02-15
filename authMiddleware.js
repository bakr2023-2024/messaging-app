const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) next();
  else {
    req.flash("error", "please login before accessing this page");
    res.redirect("/login");
  }
};
const isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) next();
  else {
    res.redirect("/");
  }
};
module.exports = { isAuthenticated, isNotAuthenticated };
