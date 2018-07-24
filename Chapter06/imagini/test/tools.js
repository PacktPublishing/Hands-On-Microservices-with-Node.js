const fs   = require("fs");
const path = require("path");

exports.service = require("../imagini");
exports.sample  = fs.readFileSync(path.join(__dirname, "sample.png"));
