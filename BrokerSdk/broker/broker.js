const Bot = require('./bot')

/**
 * Broker class manages Bots for users. (It acts as an automated securities broker for CryptoPros' algorithms).
 */
class Broker {
  constructor () {
    this.users = {} // map containing maps of bots, keyed by userids
  }
  
  /**
   * Creates a bot, loads an algorithm into it, specifies paramters
   * @param {string} userid ID of owner
   * @param {string} name Name of the bot
   * @param {string} algorithm Name of the algorithm to run
   * @param {object} parameters Object containing parameters to run algorithm with
   */
  createBot (userid, binanceOptions, name, algorithm, parameters) {
    const bot = new Bot(userid, binanceOptions, name, algorithm, parameters)
    this.users[userid] = this.users[userid] || {} // default to object
    this.users[userid][name] = bot
    return bot
  }

  async startBot (userid, name) {
    const bot = this.users[userid][name]
    if (!bot) throw new Error(`No bot ${name} for user ${userid}`)
    return bot.start()
  }
  
  /**
   * Destroys a bot by name and userid
   */
  destroyBot (userid, name) {
    const bot = this.users[userid][name]
    bot.destroy()
    delete this.users[userid][name]
  }
}

module.exports = Broker
