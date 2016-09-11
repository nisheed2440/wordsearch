var mongoModel = require('./model.js');
var userModel = mongoModel.user;

module.exports.pushUser = function(req, res){
  console.log('req', req);
	var user = new userModel({
    name: req.name,
    email: req.email
  });
	user.save(function(err,result){
    console.log('result', result);
		// res.json(result);
	});
};
