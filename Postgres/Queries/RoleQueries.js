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

exports.check_account_role = (req, res, next) => {
  const info = req.body
  const values = [info.user_id]
  const queryString = `SELECT cowards.coward_id, pros.pro_id
                         FROM cowards
                         FULL OUTER JOIN pros
                         ON cowards.user_id = pros.user_id
                         WHERE cowards.user_id = $1
                          AND cowards.active = true
                          OR pros.user_id = $1
                          AND pros.active = true`
  query(queryString, values, (err, results) => {
    if (err) {
      console.log(err)
      res.status(500).send(err)
    }
    console.log(results)
    console.log('=====================')
    res.json(results)
  })
}

const check_coward_exists = (user_id) => {
  const p = new Promise((res, rej) => {
    const values = [user_id]

    const queryString = `SELECT * FROM cowards
                            WHERE cowards.user_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        rej(err)
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

const check_pro_exists = (user_id) => {
  const p = new Promise((res, rej) => {
    const values = [user_id]

    const queryString = `SELECT * FROM pros
                            WHERE pros.user_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        rej(err)
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

exports.add_coward = (req, res, next) => {
  const info = req.body
  const coward_id = uuid()
  const values = [info.user_id, coward_id]
  const valu = [info.user_id]
  const queryString = `INSERT INTO cowards (user_id, coward_id) VALUES ($1, $2)`
  const newQuery = 'DELETE FROM pros WHERE pros.user_id = $1'
  const listOfPromises = [check_coward_exists(info.user_id), check_pro_exists(info.user_id)]
  Promise.all(listOfPromises)
    .then((results) => {
      const cowardRes = results[0]
      const proRes = results[1]
      console.log('===================>>>>')
      console.log(cowardRes)
      console.log(proRes)
      console.log('===================>>>>')
      if (cowardRes == false && proRes == false) {
        query(queryString, values, (err, results) => {
          if (err) {
            console.log(err)
            res.status(500).send(err)
          }
          console.log(results)
          console.log('=====================')
          res.json(coward_id)
        })
      }
      else if (cowardRes == false && proRes == true){
        query(newQuery, valu, (err, results) => {
          if (err) {
            console.log(err)
          }
          console.log('deleted pro')
        })
        query(queryString, values, (err, results) => {
          if (err) {
            console.log(err)
            res.status(500).send(err)
          }
          console.log(results)
          console.log('=====================')
          res.json(coward_id)
        })
      }
      else {
        res.json('Denied: already exists')
      }
    })
    .catch((err) => {

    })
}

exports.add_pro = (req, res, next) => {
  const info = req.body
  const pro_id = uuid()
  const values = [info.user_id, pro_id]
  const valu = [info.user_id]
  const queryString = `INSERT INTO pros (user_id, pro_id) VALUES ($1, $2)`
  const newQuery = `DELETE FROM cowards WHERE cowards.user_id = $1`
  const listOfPromises = [check_coward_exists(info.user_id), check_pro_exists(info.user_id)]
  Promise.all(listOfPromises)
    .then((results) => {
      const cowardRes = results[0]
      const proRes = results[1]
      if (cowardRes == false && proRes == false){
        query(queryString, values, (err, results) => {
          if (err) {
            console.log(err)
            res.status(500).send(err)
          }
          console.log(results)
          console.log('=====================')
          res.json(pro_id)
        })
      }
      else if (cowardRes == true && proRes == false) {
        query(newQuery, valu, (err, results) => {
          if (err) {
            console.log(err)
          }
          console.log('deleted')
        })
        query(queryString, values, (err, results) => {
          if (err) {
            console.log(err)
            res.status(500).send(err)
          }
          console.log(results)
          console.log('=====================')
          res.json(pro_id)
        })
      }
      else {
        res.json('Denied: already exists')
      }
    })
    .catch((err) => {

    })
}
