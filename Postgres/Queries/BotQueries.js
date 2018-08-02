const axios = require('axios')
const crypto = require('crypto')
const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')
const query = promisify(pool.query)
const moment = require('moment')

const Binance = require('node-binance-api')

const ApiQueries = require('./ApiQueries')

const binance = new Binance().options({
  APIKEY: '<key>',
  APISECRET: '<secret>',
  // useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  test: true
})

exports.save_bot = function (req, res, next) {
  const info = req.body
  const bot_id = uuid()
  const values = [bot_id, info.user_id, info.algo_id]

  check_bot_exists(info.user_id)
    .then((answer) => {
      if (answer == true) {
        console.log('delete it and add new one')
        delete_bot(info.user_id)
          .then((deleted) => {
            if (deleted) {
              const queryString = `INSERT INTO bots (bot_id, user_id, algo_id)
                                      VALUES ($1, $2, $3);`
              console.log('deleted to add the new one')
              query(queryString, values, (err, results) => {
                if (err) {
                  console.log(err)
                  res.status(500).send(err)
                }
                console.log('==========>')
                res.json({
                  message: 'Success',
                  user_id: info.user_id,
                  bot_id: bot_id
                })
              })
            }
          })
          .catch((err) => {
            console.log(err)
          })
      }
      else {
        const queryString = `INSERT INTO bots (bot_id, user_id, algo_id)
                                VALUES ($1, $2, $3);`
        console.log('add the new one')
        query(queryString, values, (err, results) => {
          if (err) {
            console.log(err)
            res.status(500).send(err)
          }
          console.log('==========>')
          res.json({
            message: 'Success',
            bot_id: bot_id
          })
        })
      }
    })
}

const delete_bot = (user_id) => {
  const p = new Promise((res, rej) => {
    const values = [user_id]
    const queryString = `DELETE FROM bots
                            WHERE bots.user_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        rej(err)
      }
      res(true)
    })
  })
  return p
}

exports.remove_user_bot = (user_id) => {
  const p = new Promise((res, rej) => {
    console.log(user_id)
    const values = [user_id]
    console.log('deactivate ^')
    const queryString = `DELETE FROM bots
                          WHERE user_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      console.log('==========>')
      console.log(results)
      res({
        message: 'Success'
      })
    })
  })
  return p
}

exports.delete_user_bot = (user_id) => {
  const p = new Promise((res, rej) => {
    console.log(user_id)
    const values = [user_id]
    console.log('deactivate ^')
    const queryString = `DELETE FROM bots
                          WHERE user_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      console.log('==========>')
      console.log(results)
      res({
        message: 'Success'
      })
    })
  })
  return p
}

const check_bot_exists = (user_id) => {
  const p = new Promise((res, rej) => {
    const values = [user_id]
    const queryString = `SELECT * FROM bots
                            WHERE bots.user_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        rej(err)
      }
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

exports.get_bot = function (req, res, next) { //redo later
  const info = req.body
  const values = [info.user_id]
  console.log('==<<<<===>>>>>=====>')
  console.log(info.user_id)
  const queryString = `SELECT a.bot_id, a.algo_id, a.user_id, b.algo_name, b.algo, b.algo_type, a.active
                          FROM bots a
                          LEFT OUTER JOIN algos b
                          ON a.algo_id = b.algo_id
                          WHERE a.user_id = $1`
  query(queryString, values, (err, results) => {
    if (err) {
      console.log(err)
      res.status(500).send(err)
    }
    console.log('==========>')
    console.log(results)
    res.json({
      message: 'Success',
      bot: results.rows.map(row => {
        return {
          bot_id: row.bot_id,
          algo_id: row.algo_id,
          user_id: row.user_id,
          algo_name: row.algo_name,
          algo: JSON.parse(row.algo),
          algo_type: JSON.parse(row.algo_type),
          active: row.active
        }
      })
    })
  })
}

exports.get_bott = function (req) { //redo later
  const p = new Promise((res, rej) => {
    const info = req.body
    const values = [info.user_id]
    console.log('==<<<<===>>>>>=====>')
    console.log(info.user_id)
    const queryString = `SELECT a.bot_id, a.algo_id, a.user_id, b.algo_name, b.algo, b.algo_type
                            FROM bots a
                            LEFT OUTER JOIN algos b
                            ON a.algo_id = b.algo_id
                            WHERE a.user_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      console.log('==========>')
      console.log(results)
      res({
        message: 'Success',
        bot: results.rows.map(row => {
          return {
            bot_id: row.bot_id,
            algo_id: row.algo_id,
            user_id: row.user_id,
            algo_name: row.algo_name,
            algo: JSON.parse(row.algo),
            algo_type: JSON.parse(row.algo_type)
          }
        })
      })
    })
  })
  return p
}

exports.get_bot_times = function (req) { //redo later
  const p = new Promise((res, rej) => {
    const info = req.body
    const values = [info.user_id]
    console.log('==<<<<===>>>>>=====>')
    console.log(info.user_id)
    const queryString = `SELECT a.updated_at, a.active, b.algo_name, b.algo_type
                            FROM bots a
                            LEFT OUTER JOIN algos b
                            ON a.algo_id = b.algo_id
                            WHERE a.user_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      console.log('==========>')
      console.log(results)
      res({
        message: 'Success',
        bot: results.rows.map(row => {
          return {
            updated_at: row.updated_at,
            active: row.active,
            algo_name: row.algo_name,
            algo_type: JSON.parse(row.algo_type)
          }
        })
      })
    })
  })
  return p
}

exports.get_bot_algos = () => {
  const p = new Promise((res, rej) => {
    const queryString = `SELECT a.algo, a.algo_type, b.bot_id, b.user_id, b.updated_at, b.active
                          FROM bots b
                          LEFT OUTER JOIN
                          algos a
                          ON a.algo_id = b.algo_id
                          WHERE a.algo_id IN (SELECT algo_id FROM bots)`
    query(queryString, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      console.log('==========>')
      console.log(results)
      res({
        message: 'Success',
        all_algos: results.rows.map(row => {
          return {
            user_id: row.user_id,
            algo: JSON.parse(row.algo),
            algo_type: JSON.parse(row.algo_type),
            bot_id: row.bot_id,
            updated_at: row.updated_at,
            active: row.active
          }
        })
      })
    })
  })
  return p
}

exports.get_users_by_algo = (req) => {
  const info = req.body
  const values = [info.algo_id]
  const p = new Promise((res, rej) => {
    const queryString = `SELECT bots.user_id FROM bots
                          WHERE algo_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      res({
        message: 'Success',
        all_bots: results.rows.map(row => {
          return (row.user_id)
        })
      })
    })
  })
  return p
}


exports.set_updated_at = (botId) => {
  const p = new Promise((res, rej) => {
    console.log(botId)
    const now = moment()
    const values = [botId, now]
    const queryString = `UPDATE bots
                          SET updated_at = $2
                          WHERE bot_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      console.log('==========>')
      console.log(results)
      res({
        message: 'Success'
      })
    })
  })
  return p
}

exports.set_active_bot = (botId) => {
  const p = new Promise((res, rej) => {
    console.log(botId)
    const values = [botId]
    const queryString = `UPDATE bots
                          SET active = TRUE
                          WHERE bot_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      console.log('==========>')
      console.log(results)
      res({
        message: 'Success'
      })
    })
  })
  return p
}

exports.set_deactive_bot = (botId) => {
  const p = new Promise((res, rej) => {
    console.log(botId)
    const values = [botId]
    console.log('deactivate ^')
    const queryString = `UPDATE bots
                          SET active = FALSE
                          WHERE bot_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      console.log('==========>')
      console.log(results)
      res({
        message: 'Success'
      })
    })
  })
  return p
}

exports.get_portfolio = function (req, res, next) {
  console.log('backhit')
  const info = req.body
  console.log(req.body)
  ApiQueries.get_user_api(req)
    .then((data) => {
      console.log(data)
    })
}
