var mongoose = require('mongoose');

var userSchema = new mongoose.Schema(
  {
    githubId: String,
    username: String,
  	name : String,
    email: String,
    gravatar: String,
    stats: {
        score: { type: Number, default: 0 },
        lastPlayed: { type: Date, default: Date.now },
        submitted: { type: Date, default: Date.now }
    }
  }
);

module.exports.user = mongoose.model('User', userSchema)
