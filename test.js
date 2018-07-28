const Binance = require('node-binance-api')

const axios = require('axios')
const crypto = require('crypto')
const Promise = require('bluebird')
const { promisify } = Promise
const uuid = require('uuid')
const moment = require('moment')



const binance = new Binance().options({
  APIKEY: 'V5ZFsjOUJyvbDubkbqheqFwMf21XwfOg4Etk7STmIFO1Xq8jSDTf0jtQYGl276y2',
  APISECRET: 'AL2GfNdmKCxunVGDK6xtHuc7GSdNjnxJk2JMRvpe3TVfshOCeYMKoRCo0NDS2x9H',
  // useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  test: true
})

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

global.ticker = {}
binance.prices((error, ticker) => {
	//console.log("prices()", ticker)
	for ( let symbol in ticker ) {
		global.ticker[symbol] = parseFloat(ticker[symbol])
	}
	binance.balance((error, balances) => {
		let balance = {}
		for ( let asset in balances ) {
			let obj = balances[asset]
			obj.available = parseFloat(obj.available)
			//if ( !obj.available ) continue // only show items with balances
			obj.onOrder = parseFloat(obj.onOrder)
			obj.btcValue = 0
			obj.btcTotal = 0
			if ( asset == 'BTC' ) obj.btcValue = obj.available
			else if ( asset == 'USDT' ) obj.btcValue = obj.available / global.ticker.BTCUSDT
			else obj.btcValue = obj.available * global.ticker[asset+'BTC']
			if ( asset == 'BTC' ) obj.btcTotal = obj.available + obj.onOrder
			else if ( asset == 'USDT' ) obj.btcTotal = (obj.available + obj.onOrder) / global.ticker.BTCUSDT
			else obj.btcTotal = (obj.available + obj.onOrder) * global.ticker[asset+'BTC']
			if ( isNaN(obj.btcValue) ) obj.btcValue = 0
			if ( isNaN(obj.btcTotal) ) obj.btcTotal = 0
			balance[asset] = obj
		}
		//fs.writeFile(global.path+"balance.json", JSON.stringify(balance, null, 4), (err)=>{})
		console.log(balance)
	})
})
