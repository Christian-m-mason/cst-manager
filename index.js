require("dotenv").config();

const express = require("express");

const mountRoutes = require("./routes");
const app = express();
app.use(express.json());

mountRoutes(app);

app.listen(process.env.PORT, () => {
  console.log(`Server running on Port ${process.env.PORT}`);
});
