const express = require("express");
const app = express();
const morgan = require("morgan");
const path = require("path");

app.use(morgan("tiny"));

app.use(express.static(__dirname + "/public"));
app.use("/build", express.static(path.join(__dirname, "node_modules/three/build")));
app.use("/jsm", express.static(path.join(__dirname, "node_modules/three/examples/jsm")));
//app.use("/pp", express.static(path.join(__dirname, "node_modules/postprocessing/build")));

app.listen(3000, function() {
    console.log("Listening on port 3000!");
})