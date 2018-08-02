const moment = require('moment')
const get_bot_algos = require('../Postgres/Queries/BotQueries').get_bot_algos
const activate_bot = require('../routes/bot_routes').activate_bot

exports.check_rebalancing = function(req, res, next){ //run every 30 mins

  get_bot_algos() // get all algos that exist in bots
    .then((botAlgos) => { // filter out rebalancing types -> we want rank rebalancing algos where days > 0
      const filtered = botAlgos.all_algos.filter(algo => algo.algo_type.type == 'Rebalance' && algo.algo_type.reb_type == 'rank' && algo.algo_type.reb_day > 0 && algo.active)
      console.log(filtered)
      filtered.forEach(algo => {
        console.log(algo.user_id)
        console.log(algo.bot_id)
        if (moment().diff(moment(algo.updated_at), 'days') >= algo.algo_type.reb_day ) {
          console.log(algo.user_id)
          console.log(algo.bot_id)
          activate_bot({ body: {user_id: algo.user_id}}) //run this algo for the user
        }
      })
    })

  // TO DO:

  //        Refresh tokens
  //        Set prod envi
  //        moment issues
  //        limit input lengths
  //        test test test test test
  //        Loading visual glitchy
  //        refresh tokens
  //        Set this function to run every x mins
  //        Find solution: API keys in DB, but removed from Binance
  //        Encrypt all API data + find alternative solutions
  //        test rebalance with very small amount of cryptos in account (currently catches no balance, try if will work on tiny ballance)
  //        make mobile friendly
}
