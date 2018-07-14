const axios = require('axios')
const crypto = require('crypto')
const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../../Postgres/db_connect')
const uuid = require('uuid')
const query = promisify(pool.query)
const moment = require('moment')

const Binance = require('node-binance-api')

const binance = new Binance().options({
  APIKEY: '<key>',
  APISECRET: '<secret>',
  // useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  test: true
})

exports.get_balance = function(req, res, next) {
  console.log('backhit')
  const info = req.body
  const value = [info.user_id]
  const queryString = 'SELECT * FROM binance WHERE user_id = $1'
  getApi(value[0])
    .then((data) => {
      if (data) {
        console.log(data.api_key)
        const bin = new Binance().options({
          APIKEY: data.api_key,
          APISECRET: data.api_secret,
          useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
          test: true
        })
        bin.balance((error, balances) => {
          console.log("balances()", balances)
        })
      }
      else {
        res.json({
          message: 'Api Keys DNE'
        })
      }
    })

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
