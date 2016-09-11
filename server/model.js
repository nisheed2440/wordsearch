var mongoose = require('mongoose');

module.exports.user = mongoose.model('user', {
	name : String,
  email: String
})
