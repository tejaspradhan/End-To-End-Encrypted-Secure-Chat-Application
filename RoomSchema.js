const mongoose = require("mongoose");
var room_schema = new mongoose.Schema({
  name: String,
  secretKey: String,
});

var Room = mongoose.model("room", room_schema);

module.exports = Room;

// "cybersec12345"
// "algo12345"
// "ds12345"
// "os12345"
//"ai12345"
// "se12345"
