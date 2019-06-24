//contains auth details for any external services

//Mongo database auth details:
const MONGOURI = "mongodb+srv://admin:admin@cluster0-igocn.gcp.mongodb.net/test?retryWrites=true&w=majority";
const SECRETORKEY = "mongodb+srv://admin:admin@cluster0-igocn.gcp.mongodb.net/test?retryWrites=true&w=majority";
module.exports = {mongoURI: MONGOURI, secretOrKey: SECRETORKEY};
