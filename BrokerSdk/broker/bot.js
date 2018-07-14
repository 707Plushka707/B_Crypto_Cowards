const SDK = require('@cryptocowards/sdk')
const AWS = require('aws-sdk')
const safeEval = require('safe-eval')
const s3 = AWS.S3()

const ALGORITHMS_BUCKET = 'crypto-coward-algorithms'

class Bot {
  /**
   * Instantiate a bot
   * @param {string} userid
   * @param {object} binanceOptions
   * @param {string} name
   * @param {string} algorithm
   * @param {object} parameters
   */
  constructor (userid, binanceOptions, name, algorithm, parameters) {
    Object.assign(this, {
      userid,
      binanceOptions,
      name,
      algorithm,
      parameters,
      running: false
    })
  }

  async start ({ test = false } = {}) {
    const Key = `${this.userid}/${this.algorithm}.js`
    const code = await s3.getObject({ Key, Bucket: ALGORITHMS_BUCKET }).promise().then(({ Body }) => Body)
    this.sdk = new SDK()
    await this.sdk.initialize(binanceOptions)
    // we expect tradeOnInterval to be a function, accepting latest market data
    safeEval(code, { CryptoCowards: this.sdk })
    this.running = true
    return this
  }

  stop () {
    this.sdk.destroy()
    this.running = false
  }

  destroy () {
    this.stop()
    // cleanup any leftover listeners, etc. so this Bot instance can be cleaned during GC
  }
}

module.exports = Bot
