require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { app } = require("./app");
const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
  console.log(`Postline backend started on port ${port}`);
});
module.exports = { server };