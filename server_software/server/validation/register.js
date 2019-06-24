//we process registration validation data here
const Validator = require('validator');
const isEmpty = require('is-empty');
const emptyOr = require('./emptyOr');
const passwordRestrictions = {min: 6, max: 30};
module.exports = function validateRegistrationInput(data) {
  let errors = {};
  //if the data given is missing some fields, fill it with empty strings
  data.name = emptyOr(data);
  data.email = emptyOr(data);
  data.password = emptyOr(data);
  data.passwordRetype = emptyOr(data);
  //name checks

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is required";

  }
  //password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }
  if (Validator.isEmpty(data.passwordRetype)) {
    errors.passwordRetype = "Confirm Password field is required";
  }

  if (!Validator.isLength(data.password, passwordRestrictions)) {
    errors.password = `Password must be between ${passwordRestrictions.min} and ${passwordRestrictions.max} characters long`;

  }
  if (!Validator.equals(data.passwordRetype, data.password)) {
    errors.passwordRetype = "Passwords must match";

  }
  //email check
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }
  //return the errors, if none we return the data is valid
  return {
    errors, isValid: isEmpty(errors)
  }


};


