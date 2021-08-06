const team = require("./team");
const users = require("./users");
const auth = require("./auth");

module.exports = (app) => {
  app.use("/team", team);
  app.use("/users", users);
  app.use("/auth", auth);
};
