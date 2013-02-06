module.exports = function (compound, User) {
	// Validate Presence
	User.validatesPresenceOf('username');
	User.validatesPresenceOf('password');
	User.validatesPresenceOf('email');
	User.validatesPresenceOf('home');

	// Validate Uniqueness
	User.validatesUniquenessOf('username');
	User.validatesUniquenessOf('email');

	// Validate Lenght
	User.validatesLengthOf('username', {allowBlank: 'false'});
	User.validatesLengthOf('password', {allowBlank: 'false'});
	User.validatesLengthOf('email', {allowBlank: 'false'});
	User.validatesLengthOf('home', {allowBlank: 'false'});

	exports.verifyPassword = function (password, user_password) {
		console.log('model user verifyPassword !!');
	    if (!password && !user_password){
	  		return false;
	    } 
	    if (password == user_password){
	  		return true;
	    } 
	    return false;
	}
};