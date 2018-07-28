const moment = require('moment')
const get_bot_algos = require('../Postgres/Queries/BotQueries').get_bot_algos
const set_updated_at = require('../Postgres/Queries/BotQueries').set_updated_at
const activate_bot = require('./bot_routes').activate_bot

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

  // EXTRA NOTES: (done) set active to true on rank bot activation ->  (done) only allowed to activate strategies if API keys are connected
  //              (done) Option to set active back to false
  //              (done) in filter, active needs to be true
  // TO DO: test rebalance with very small amount of cryptos in account (currently catches no balance, try if will work on tiny ballance)
  //        Set this function to run every x mins
  //        Encrypt all API data + find alternative solutions
  //        Automate 'test' buttons
  //        Render other stuff in settings when API keys submitted
  //        Enable 'edit' buttons to work on everything
  //        Set prod envi
  //        test test test test test
}
