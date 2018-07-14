const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

// stringify_rows: Convert each row into a string
const stringify_rows = res => res.rows.map(row => JSON.stringify(row))

const json_rows = res => res.map(row => JSON.parse(row))
//log_through: log each row
const log_through = data => {
  // console.log(data)
  return data
}

exports.get_user_api = (req, res, next) => {
    const info = req.body
    const values = [info.user_id]
    console.log(info.user_id)
    const queryString = `SELECT * FROM binance
                            WHERE binance.user_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      console.log('==========>')
      console.log(results)
      res.json({
        message: 'Success',
        api_data: results.rows
      })
    })
}
