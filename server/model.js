var mongoose = require('mongoose');

var userSchema = new mongoose.Schema(
  {
    githubId: String,
    username: String,
  	name : String,
    email: String,
    gravatar: String
  }
);

module.exports.user = mongoose.model('User', userSchema)
