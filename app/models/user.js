var mongoose = require('mongoose'); // Import Mongoose Package
var Schema   = mongoose.Schema; // Assign Mongoose Schema to variable
var bcrypt 	 = require('bcrypt-nodejs'); // Import Bcrypt Package
var titlize  = require('mongoose-title-case');
var validate = require('mongoose-validator');

// Name Validator
var nameValidator = [
  	validate({
	  validator: 'matches',
	  arguments: /^(([a-zA-Z]{3,20})+[ ]+([a-zA-Z]{2,20})+)+$/,
	  message: 'Name Must be atleast 3 characters, max 30, no special characters or numbers, must have space in between name.'
	}),

	validate({
	  validator: 'isLength',
	  arguments: [3, 20],
	  message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
	})
];

// User E-mail Validator
var emailValidator = [
  	validate({
	  validator: 'isEmail',
	  message: 'Is not a valid e-mail'
	}),

	validate({
	  validator: 'isLength',
	  arguments: [3, 25],
	  message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
	})
];

// username Validator
var usernameValidator = [
	validate({
		validator: 'isLength',
		arguments: [3,25],
		message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
	}),

	validate({
		validator: 'isAlphanumeric',
		message: 'Username must contain letters and numbers Only'
	})
];

// Password Validator
var passwordValidator = [
	validate({
	  validator: 'matches',
	  arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,25}$/,
	  message: 'Password needs to have at least one lower case, one upper case, one number, one special character and must be at least 8 characters but no more then 25.'
	}),

	validate({
	  validator: 'isLength',
	  arguments: [6, 25],
	  message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
	})
];

// User Mongoose Schema
var UserSchema = new Schema({
	name: { type: String, required: false, validate: nameValidator },
	username: { type: String, lowercase: true, required: true, unique: true, validate: usernameValidator },
	password: {type: String, required: true, validate:passwordValidator, select: false },
	email: { type: String, required: true, lowercase: true, unique: true, validate: emailValidator },
	active: { type: Boolean, required: true, default: false },
	temporarytoken: { type: String, required: true },
	resettoken: { type: String, required: false },
	permission: { type: String, required: true, default: 'user'}
});

// Middleware to ensure password is encrypted before saving user to database
UserSchema.pre('save', function(next){
	var user = this;

	if (!user.isModified('password')) return next(); // If password was not changed or is new, ignore Middleware

	// Function to encrypt password
	bcrypt.hash(user.password, null, null, function(err, hash){
		if (err) return next(err); // Exit if error is found
		user.password = hash; // Assign the hash to the user's password so it is saved in database encrypted
		next(); // Exit Bcrypt function
	});	
});

UserSchema.plugin(titlize, {
  paths: [ 'name' ]
});

// Method to compage password in API (When user logs in)
UserSchema.methods.comparePassword = function (password){
	return bcrypt.compareSync(password, this.password); // Returns true if password matches, false if doesn't
};

module.exports = mongoose.model('User', UserSchema); // Export User Model for us in API
