// this package would be named @cryptocowards/sdk in npm (for example)

const { Observable, Subject } = require('rxjs') // use RxJS v5
const BinanceAPI = require('node-binance-api')

class SDK {
  constructor () {
    this.binance = null // instantiated binance API client
    this.triggers = [] // array of arrays, containing pairs of conditionCallback and thenCallback

    this.tickers = new Subject()
    this.tickers.subscribe(markets => {
      this.triggers
        .filter(([conditionCallback, thenCallback]) => conditionCallback(markets)) // take triggers whose conditions are satisfied
        .forEach(([conditionCallback, thenCallback]) => thenCallback()) // call thenCallback
    })
  }

  async initialize ({ binanceKey, binanceSecret, test = true }) {
    // initialize SDK instance with user-specific, portfolio-specific data
    this.binance = BinanceAPI.options({ APIKEY: binanceKey, APISECRET: binanceSecret, test })
    await this.checkValidCredentials(binanceKey, binanceSecret)
    this.miniTicker = binance.websockets.miniTicker(markets => this.tickers.onNext(markets))
    this.tickers = Observable.create(observer => this.miniTicker(observer.onNext))
  }

  destroy () {
    this.tickers.onComplete()
    this.miniTicker.close()
    // TODO: convert all methods in noops
  }

  /**
   * Checks Binance credentials to see if they are valid. Resolves true if valid.
   * @param {string} binanceKey
   * @param {string} binanceSecret
   * @returns Promise<Boolean>
   */
  checkValidCredentials (binanceKey, binanceSecret) {
    const isValid = await Promise.resolve(true) // check with Binance if credentials are valid
    if (!isValid) throw new Error('Invalid Binance API key pair')
  }

  getPrice (security) {
    // return Promise<Number>
  }

  buy (security, quantity) {}
  
  /**
   * On each trading cycle, run `thenCallback` if `conditionCallback` returns true
   * @param {*} conditionCallback 
   * @param {*} thenCallback 
   */
  addTrigger (conditionCallback, thenCallback) {
    this.triggers.push([conditionCallback, thenCallback])
  }
}

module.exports = SDK

