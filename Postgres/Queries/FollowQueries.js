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

exports.get_user_follows = (req, res, next) => {
    const info = req.body
    const values = [info.user_id]
    console.log(info.user_id)
    const queryString = `SELECT * FROM follows
                            WHERE follows.user_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      console.log('==========>')
      console.log(results)
      res.json({
        message: 'Success',
        user_follows: results.rows
      })
    })
}

exports.delete_follows = (req, res, next) => {
  const info = req.body
  console.log('=========>==========')
  console.log(info)
  const arrayOfPromises = info.follow_ids.map((follow_id) => {
    const p = new Promise((resolve, reject) => {
      const values = [follow_id]
      let queryString = `DELETE FROM follows WHERE follow_id = $1`
      return query(queryString, values, (err, results) => {
        if (err) {
          console.log(err)
          // res.status(500).send(err)
          reject(err)
        }
        resolve('success')
      })
    })
    return p
  })
  Promise.all(arrayOfPromises)
  .then((data) => {
    console.log('we out')
    res.json({
      message: 'success',
      passed: true,
    })
  })
}

exports.add_follows = (req, res, next) => {
  const info = req.body
  console.log('=========>==========')
  console.log(info)
  const arrayOfPromises = info.algo_ids.map((algo_id) => {
    const p = new Promise((resolve, reject) => {
      const follow_id = uuid()
      const values = [follow_id, info.user_id, algo_id]
      let queryString = `INSERT INTO follows (follow_id, user_id, algo_id) VALUES ($1, $2, $3)`
      return query(queryString, values, (err, results) => {
        if (err) {
          console.log(err)
          // res.status(500).send(err)
          reject(err)
        }
        resolve('success')
      })
    })
    return p
  })
  Promise.all(arrayOfPromises)
  .then((data) => {
    console.log('we out')
    res.json({
      message: 'success',
      passed: true,
    })
  })
}
