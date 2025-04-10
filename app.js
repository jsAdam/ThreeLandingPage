const express = require("express");
const app = express();
const morgan = require("morgan");
const path = require("path");

app.use(morgan("tiny"));

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(3000, function() {
    console.log("Listening on port 3000!");
})