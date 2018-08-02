const get_algo_follows = require('../Postgres/Queries/FollowQueries').get_algo_follows
const delete_follow_algo = require('../Postgres/Queries/FollowQueries').delete_follow_algo
const get_users_by_algo = require('../Postgres/Queries/BotQueries').get_users_by_algo
const delete_user_bot = require('../Postgres/Queries/BotQueries').delete_user_bot
const add_notification = require('../Postgres/Queries/NotificationQueries').add_notification
const delete_algo = require('../Postgres/Queries/AlgoQueries').delete_algo

exports.delete_algo = (req, res, next) => {
  console.log(req)
  const algoName = req.body.algo_name
  const algoId = req.body.algo_id
  const followers = get_algo_follows(req)
    .then((data) =>{
      console.log(data.followers) //send the followers a notification (list of user_id)
      console.log('^All follows')
      data.followers.map((user) => add_notification({user_id: user, title: `Strategy '${algoName}' has been deleted. It has been removed from your following` }))
      data.followers.map((user) => delete_follow_algo(user, algoId))
      // send notification to all these users that their follow is rekt
      // delete all follows with this algo
    })

  const botters = get_users_by_algo(req)
    .then((data) => {
      console.log(data.all_bots) //list of users_id
      console.log('^All bots')
      console.log(algoName)
      // send notification to all these users that their bot is rekt
      data.all_bots.map((user) => add_notification({user_id: user, title: `Strategy '${algoName}' has been deleted. It has been removed from your selected` }))
      data.all_bots.map((user) => delete_user_bot(user))
      // delete all bots with this algo
    })

  Promise.all([followers, botters])
    .then(() => {
      console.log('did it all')
      console.log(algoId)
      return delete_algo(algoId)
    })
    .then(() => {
      res.json({
        message: 'Successfull af'
      })
    })
    .catch((err) => {
      console.log(err)
    })
}
