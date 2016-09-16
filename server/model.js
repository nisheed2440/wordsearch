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

var scoreSchema = new mongoose.Schema(
    {
        username: String,
        wordsAvailable: Number,
        wordsSolved: Number,
        score: Number,
        duration:Number //milliseconds
    }
);
module.exports.user = mongoose.model('User', userSchema);
module.exports.score = mongoose.model('Score', scoreSchema);
