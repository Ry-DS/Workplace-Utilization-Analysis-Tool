const isEmpty = require('is-empty');
module.exports = function emptyOr(data) {//if data is empty, returns empty string, otherwise the given data.
  return !isEmpty(data) ? data : "";
};
