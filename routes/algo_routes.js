const get_algo_follows = require('../Postgres/Queries/FollowQueries').get_algo_follows

exports.delete_algo = (req, res, next) => {
  console.log(req)

  get_algo_follows(req)
    .then((data) =>{
      console.log(data)
    })

  console.log('yeyeyes')
}
