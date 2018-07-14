const Binance = require('node-binance-api')

const binance = new Binance().options({
  APIKEY: '<key>',
  APISECRET: '<secret>',
  // useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  test: true
})

// Intervals: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M

const newFunc = () => {
  const p = new Promise((res, rej) => {
    binance.candlesticks("ETHUSDT", "5m", (error, ticks, symbol) => {
        if (error) {
          rej(error)
        }
       res(ticks)
    }, {limit: 3, endTime: 1514764800000})
  })
    return p
}


let newStuff = []

newFunc()
  .then((data) => {
    console.log(data)
  })
