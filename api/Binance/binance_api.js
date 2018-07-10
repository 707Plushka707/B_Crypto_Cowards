const axios = require('axios')
const crypto = require('crypto')
const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../../Postgres/db_connect')
const uuid = require('uuid')
const query = promisify(pool.query)

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
