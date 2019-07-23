const Validator = require('validator');
const isEmpty = require('is-empty');
const emptyOr = require('./emptyOr');
//we process login validation data here
module.exports = function validateAddTeamInput(data) {
  let errors = {};
  //if the data given is missing some fields, fill it with empty strings
  data.email = emptyOr(data.name);
  //name check
  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }
  //return the errors, if none we return the data is valid
  return {
    errors, isValid: isEmpty(errors)
  }

};
