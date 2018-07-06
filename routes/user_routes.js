const insert_user_profile = require('../Postgres/Queries/UserQueries').insert_user_profile
const retrieve_user_profile = require('../Postgres/Queries/UserQueries').retrieve_user_profile

// POST /get_user_profile
exports.get_user_profile = function(req, res, next){
  // check if user already exists
  // if not, then save to db with user account and return the user
  // if yes, then return user
}
