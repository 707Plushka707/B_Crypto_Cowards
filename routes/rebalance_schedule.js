const moment = require('moment')
const get_bot_times = require('../Postgres/Queries/BotQueries').get_bot_times

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
