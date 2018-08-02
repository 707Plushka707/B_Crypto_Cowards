const axios = require('axios')
const crypto = require('crypto')
const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')
const query = promisify(pool.query)
const moment = require('moment')

exports.get_user_notifications = (req, res, next) => {
    const info = req.body
    const values = [info.user_id]

    const p = new Promise((res,rej) => {
      const queryString = `SELECT * FROM notifications
                              WHERE user_id = $1`
      query(queryString, values, (err, results) => {
        if (err) {
          console.log(err)
          res.status(500).send(err)
        }
        console.log(info.user_id)
        res({
          message: 'Success',
          notifications: results.rows.map(row => {
            return {
              title: row.title,
              datetime: row.created_at,
              read: row.read,
              avatar: row.avatar,
            }
          })
        })
      })
    })
    return p
}

exports.add_notification = (req) => {
    const notification_id = uuid()
    const values = [notification_id, req.user_id, req.title]
    const p = new Promise((res,rej) => {
      const queryString = `INSERT INTO notifications (notification_id, user_id, title)
                              VALUES ($1, $2, $3)`
      query(queryString, values, (err, results) => {
        if (err) {
          console.log(err)
          res.status(500).send(err)
        }
        res({
          message: 'Success',
        })
      })
    })
    return p
}

exports.false_user_notifications = (req) => {
    const info = req.body
    const values = [info.user_id]
    const p = new Promise((res,rej) => {
      const queryString = `UPDATE notifications
                            SET read = TRUE
                            WHERE user_id = $1`
      query(queryString, values, (err, results) => {
        if (err) {
          console.log(err)
          res.status(500).send(err)
        }
        res({
          message: 'Success',
        })
      })
    })
    return p
}
