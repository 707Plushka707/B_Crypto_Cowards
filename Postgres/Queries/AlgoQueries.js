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

const check_algo_name_exists = (user_id, algo_name) => {
  const p = new Promise((res, rej) => {
    const values = [user_id, algo_name]

    const queryString = `SELECT * FROM algos
                            WHERE algos.user_id = $1 AND algos.algo_name = $2`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      console.log('==========>')
      console.log(results.rowCount)
      if (results.rowCount == 1) {
        res(true)
      }
      else {
        res(false)
      }

    })
  })
  return p
}

exports.get_all_algos = (req, res, next) => {
  const queryString = `SELECT * FROM algos`
  query(queryString, (err, results) => {
    if (err) {
      console.log(err)
      res.status(500).send(err)
    }
    console.log('==========>')
    console.log(results)
    res.json({
      message: 'Success',
      all_algos: results.rows
    })
  })
}

exports.get_user_algos = (req, res, next) => {
    const info = req.body
    const values = [info.user_id]
    console.log(info.user_id)
    const queryString = `SELECT * FROM algos
                            WHERE algos.user_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      console.log('==========>')
      console.log(results)
      res.json({
        message: 'Success',
        user_algos: results.rows
      })
    })
}


exports.add_algo = (req, res, next) => {
  const info = req.body
  const algo_id = uuid()
  const values = [algo_id, info.user_id, info.algo_name, info.algo]
  const queryString = `INSERT INTO algos (algo_id, user_id, algo_name, algo) VALUES ($1, $2, $3, $4)`

  check_algo_name_exists(info.user_id, info.algo_name)
    .then((data) => {
      if (data == true) {
        res.json({
          message: 'Algo already exists',
          passed: false,
        })
      }
      else {
        query(queryString, values, (err, results) => {
          if (err) {
            console.log(err)
            res.status(500).send(err)
          }
          res.json({
            message: 'Algo is added',
            passed: true,
          })
        })

      }
    })
    .catch((err) => {
      console.log(err)
    })
}
