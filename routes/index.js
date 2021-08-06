const team = require("./team");
const users = require("./users");
const signUpOrLogIn = require("./signUpOrLogin");

module.exports = (app) => {
  app.use("/team", team);
  app.use("/users", users);
  app.use("/", signUpOrLogIn);
};
