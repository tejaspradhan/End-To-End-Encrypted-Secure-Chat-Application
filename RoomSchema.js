var room_schema = new mongoose.Schema({
  name: String,
  secretKey: String,
});

var Room = mongoose.model("room", room_schema);

module.exports = Room;
