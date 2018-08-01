const moment = require('moment')
const get_bot_algos = require('../Postgres/Queries/BotQueries').get_bot_algos
const get_bot_times = require('../Postgres/Queries/BotQueries').get_bot_times
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

  // TO DO:


  //        Set prod envi

  //        limit input lengths

  //        'remove' buttons - Created: remove from every table, send notification to users

  //        test test test test test
  //        Loading visual glitchy
  //        refresh tokens
  //        Set this function to run every x mins
  //        Find solution: API keys in DB, but removed from Binance
  //        Encrypt all API data + find alternative solutions
  //        test rebalance with very small amount of cryptos in account (currently catches no balance, try if will work on tiny ballance)
  //        make mobile friendly
}

exports.get_rebalance_time = function (req, res, next) {
  get_bot_times(req)
    .then((data) => {
      console.log(data.bot)
      if (data.bot.length > 0) {
        const bot = data.bot[0]
        console.log(bot.active)
        if (bot.active && bot.algo_type.type == 'Rebalance' && bot.algo_type.reb_type == 'rank') {
          // console.log(bot.updated_at)
          // console.log(bot.algo_type.reb_day * 24)
          // console.log(moment().diff(moment(bot.updated_at), 'hours'))
          // console.log(moment(bot.updated_at).diff(moment(), 'hours'))
          const percent = ((bot.algo_type.reb_day * 1440 - moment(bot.updated_at).diff(moment(), 'minutes')) / (bot.algo_type.reb_day * 1440)) * 100
          const dateis = bot.algo_type.reb_day * 1440 - moment(bot.updated_at).diff(moment(), 'minutes')
          // console.log(percent)
          res.json({
            message: 'Success',
            percent: Math.round(percent),
            dateis: dateis
          })
        }
      } else {
        null
      }
    })
}
