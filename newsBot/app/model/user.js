var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: String,
  fb_id: { type: String, required: true, unique: true },
  created_at: Date,
  updated_at: Date
});


var User = mongoose.model('User', userSchema);

module.exports = User;