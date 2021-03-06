const axios = require('axios')
const crypto = require('crypto')
const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../../Postgres/db_connect')
const uuid = require('uuid')
const query = promisify(pool.query)
const moment = require('moment')

const Binance = require('node-binance-api')


exports.get_balance = function(req, res, next) {
  console.log('backhit')
  const info = req.body
  const value = [info.user_id]
  const queryString = 'SELECT * FROM binance WHERE user_id = $1'
  getApi(value[0])
    .then((data) => {

      if (data) {
        console.log(data.api_key)
        const binance = new Binance().options({
          APIKEY: data.api_key,
          APISECRET: data.api_secret,
          useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
          test: true
        })
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
              obj.usdValue = 0
        			if ( asset == 'BTC' ) obj.btcValue = obj.available
        			else if ( asset == 'USDT' ) obj.btcValue = obj.available / global.ticker.BTCUSDT
        			else obj.btcValue = obj.available * global.ticker[asset+'BTC']

        			if ( asset == 'BTC' ) obj.btcTotal = obj.available + obj.onOrder
        			else if ( asset == 'USDT' ) obj.btcTotal = (obj.available + obj.onOrder) / global.ticker.BTCUSDT
        			else obj.btcTotal = (obj.available + obj.onOrder) * global.ticker[asset+'BTC']

              if ( asset == 'BTC' ) obj.usdValue = obj.available * global.ticker.BTCUSDT
        			else if ( asset == 'USDT' ) obj.usdValue = obj.available
        			else obj.usdValue = obj.available * global.ticker[asset+'BTC'] * global.ticker.BTCUSDT

        			if ( isNaN(obj.btcValue) ) obj.btcValue = 0
        			if ( isNaN(obj.btcTotal) ) obj.btcTotal = 0
              if ( isNaN(obj.usdValue) ) obj.usdValue = 0
        			balance[asset] = obj
        		}
        		//fs.writeFile(global.path+"balance.json", JSON.stringify(balance, null, 4), (err)=>{})
        		console.log(balance)
            const holdings = Object.keys(balance).filter(bal => parseFloat(balance[bal].btcValue)).map(bal => [bal, balance[bal].usdValue, balance[bal].btcValue, balance[bal].available])
            console.log(holdings)
            res.json({
              message: 'success',
              balance: holdings
            })
        	})
        })
      }
      else {
        res.json({
          message: 'Api Keys DNE'
        })

      }
    })
}

exports.get_bal = function(req) {
  const p = new Promise((res, rej) => {
    console.log('backhit')
    const info = req.body
    const value = [info.user_id]
    console.log(info.user_id)
    const queryString = 'SELECT * FROM binance WHERE user_id = $1'
    getApi(value[0])
      .then((data) => {

        if (data == false) {
          res({
            message: 'Api Keys DNE'
          })
        }
        else {
          console.log(data.api_key)
          const binance = new Binance().options({
            APIKEY: data.api_key,
            APISECRET: data.api_secret,
            useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
            test: true
          })
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
                obj.usdValue = 0
          			if ( asset == 'BTC' ) obj.btcValue = obj.available
          			else if ( asset == 'USDT' ) obj.btcValue = obj.available / global.ticker.BTCUSDT
          			else obj.btcValue = obj.available * global.ticker[asset+'BTC']

          			if ( asset == 'BTC' ) obj.btcTotal = obj.available + obj.onOrder
          			else if ( asset == 'USDT' ) obj.btcTotal = (obj.available + obj.onOrder) / global.ticker.BTCUSDT
          			else obj.btcTotal = (obj.available + obj.onOrder) * global.ticker[asset+'BTC']

                if ( asset == 'BTC' ) obj.usdValue = obj.available * global.ticker.BTCUSDT
          			else if ( asset == 'USDT' ) obj.usdValue = obj.available
          			else obj.usdValue = obj.available * global.ticker[asset+'BTC'] * global.ticker.BTCUSDT

          			if ( isNaN(obj.btcValue) ) obj.btcValue = 0
          			if ( isNaN(obj.btcTotal) ) obj.btcTotal = 0
                if ( isNaN(obj.usdValue) ) obj.usdValue = 0
          			balance[asset] = obj
          		}
          		//fs.writeFile(global.path+"balance.json", JSON.stringify(balance, null, 4), (err)=>{})
          		console.log(balance)
              const holdings = Object.keys(balance).filter(bal => parseFloat(balance[bal].btcValue)).map(bal => [bal, balance[bal].available])
              console.log(holdings)
              res({
                message: 'success',
                balance: holdings
              })
          	})
          })
        }
      })
      .catch((err) => {
        res({
          message: 'Api Keys DNE'
        })
      })
  })
  return p
}

const getApi = (user_id) => {
  const p = new Promise((res, rej) => {
    const values = [user_id]
    const queryString = `SELECT * FROM binance
                            WHERE binance.user_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        rej(err)
      }
      if (results.rowCount == 1) {
        res(results.rows[0])
      }
      else {
        res(false)
      }
    })
  })
  return p
}

exports.save_binance = function(req, res, next) { //get all post info for list
  console.log('backhit')
  const info = req.body
  console.log(info)
  const time = 'timestamp=' + Date.now().toString()
  console.log(time)
  const sha = crypto.createHmac('sha256', info.API_SECRET).update(time).digest('hex')
  console.log(sha)
  axios.get(
    `https://api.binance.com/api/v3/account?${time}&signature=${sha}`,
    {
      headers: {'X-MBX-APIKEY': info.API_KEY}
    })
      .then((data) => {
        console.log('success')
        const binance_id = uuid()
        const values = [binance_id, info.user_id, info.API_KEY, info.API_SECRET]
        const query_string = `INSERT INTO binance (binance_id, user_id, api_key, api_secret)
                                VALUES ($1, $2, $3, $4)`

        console.log(query_string)
        query(query_string, values, (err, results) => {
          if (err) {
            console.log(err)
            res.status(500).send('Failed to get table posts')
          }
          res.json({
            message: 'Successfull retrieval',
            user_id: info.user_id,
          })
        })
      }).catch((err) => {
        console.log('fail')
        console.log(err.response.data)
        res.status(500).send(false)
      })
}

exports.get_candlesticks = function(req, res, next) { //get all post info for list
  console.log('backhit')
  const info = req.body
  console.log(req.body)
  console.log(info)
  const binance = new Binance().options({
    APIKEY: '<key>',
    APISECRET: '<secret>',
    // useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
    test: true
  })
  const newFunc = () => {
    const p = new Promise((res, rej) => {
      binance.candlesticks(info.ticker, info.timeframe, (error, ticks, symbol) => {
          if (error) {
            rej(error)
          }
         res(ticks)
      }, {limit: 3000})
    })
    return p
  }
  newFunc()
    .then((data) => {
      const close = data.map((day) => day[4])
      console.log(close)
      const date = data.map((day) => moment(day[0]).format('YYYY-MM-DD'))
      res.json({
        price: close,
        time: date
      })
    })
}

exports.get_min_order = () => {
  const p = new Promise((res, rej) => {
    const binance = new Binance().options({
      APIKEY: '<key>',
      APISECRET: '<secret>',
      // useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
      test: true
    })
    binance.exchangeInfo(function(error, data) {
    	let minimums = {}
    	for ( let obj of data.symbols ) {
    		let filters = {}
    		for ( let filter of obj.filters ) {
    			if ( filter.filterType == "LOT_SIZE" ) {
    				filters.minQty = parseFloat(filter.minQty)
    				filters.maxQty = parseFloat(filter.maxQty)
    			}
    		}
    		minimums[obj.symbol] = filters
    	}
    	global.filters = minimums
      res(minimums)
  	//fs.writeFile("minimums.json", JSON.stringify(minimums, null, 4), function(err){});
    })
  })
  return p
}


exports.market_buy = function(user_id, balance) { //get all post info for list
  console.log('buyhit')
  const prom = new Promise((res, rej) => {
    getApi(user_id)
      .then((data) => {
        if (data !== false) {
          console.log(data.api_key)
          const binance = new Binance().options({
            APIKEY: data.api_key,
            APISECRET: data.api_secret,
            useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
          })
          const buyit = balance.map((coin) => {
            console.log('buying')
            console.log(coin[0])
            console.log(coin[1])
            const p = new Promise((res, rej) => {
              binance.marketBuy(coin[0], coin[1], (error, response) => {
                console.log("Market buy response", response)
                console.log("order id: " + response.orderId)
                res()
              })
            })
            return p
          })
          res(Promise.all(buyit))
        }
        else {
          rej('broken')
        }
      })
  })
  return prom
}

exports.market_sell = function(user_id, balance) { //get all post info for list
  console.log('sellhit')
  const prom = new Promise((res, rej) => {
    getApi(user_id)
      .then((data) => {
        if (data !== false) {
          console.log(data.api_key)
          const binance = new Binance().options({
            APIKEY: data.api_key,
            APISECRET: data.api_secret,
            useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
          })
          const sellit = balance.map((coin) => {
            console.log('selling')
            console.log(coin[0])
            const p = new Promise((res, rej) => {
              binance.marketSell(`${coin[0]}BTC`, coin[1], (error, response) => {
                console.log("Market Sell response", response)
                console.log("order id: " + response.orderId)
                res()
              })
            })
            return p
          })
          res(Promise.all(sellit))
        }
        else {
          rej('broken')
        }
      })
  })
  return prom
}

exports.get_market_prices = function() { //get all post info for list
  const binance = new Binance().options({
    APIKEY: '<key>',
    APISECRET: '<secret>',
    // useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
    test: true
  })
  const p = new Promise((res, rej) => {
    binance.bookTickers((error, ticker) => {
      res(ticker)
    })
  })
  return p
}
