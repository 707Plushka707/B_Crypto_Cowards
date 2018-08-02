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
const add_notification = require('./NotificationQueries').add_notification

exports.retrieve_user_profile = (req, res, next) => {
  const info = req.body
  const user_id = info.user_id
  const profile = info.profile
  // console.log(profile)
  // res.json({
  //   message: 'hello'
  // })
  get_user_profile(user_id)
  .then((userData) => {
    // console.log(userData)
    if (userData.rowCount === 0) {
      console.log('0')
      return insert_user_profile(user_id, profile)
      .then((data) => {
        add_notification({user_id: user_id, title: 'Welcome to CryptoCowards! To begin please submit your Binance API keys on the Settings page.'})
        return get_user_profile(user_id)
      })
      .then((data) => {
        res.json({
          new_entry: true,
          profile: data.rows[0],
        })
      })
      .catch((err) => {
        console.log(err)
        res.status(500).send(err)
      })
    } else {
      console.log('1')
      get_user_profile(user_id)
      .then((data) => {
        res.json({
          new_entry: false,
          profile: data.rows[0],
        })
      })
      .catch((err) => {
        res.status(500).send(err)
      })
    }
  })
}



const get_user_profile = (user_id) => {
  const p = new Promise((res, rej) => {
    const values = [user_id]

    const queryString = `SELECT user_id, first_name, last_name, email, pro
                           FROM users
                           WHERE users.user_id = $1`
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        rej(err)
      }
      res(results)
    })
  })
  return p
}



exports.updateHistoryIdForuser = function(user_id, historyId) {
  const p = new Promise((res, rej) => {
    const values = [user_id, historyId]
    let update_history_id = `UPDATE google_refresh_tokens SET history_id = $2 WHERE aws_identity_id = $1 `

    return query(update_history_id, values)
      .then((data) => {
        console.log(data)
        res('success')
      })
      .catch((err) => {
        console.log(err)
        rej(err)
      })
  })
  return p
}

exports.grab_refresh_token = function(user_id) {
  const p = new Promise((res, rej) => {
    const values = [user_id]
    const grab_token = `SELECT a.aws_identity_id, a.google_identity_id, a.google_access_token, a.google_refresh_token, a.created_at, a.expires_at, a.history_id,
                               b.user_id, b.first_name, b.last_name, b.email, b.phone
                          FROM google_refresh_tokens a
                          INNER JOIN user b ON a.aws_identity_id = b.user_id
                          WHERE a.aws_identity_id = $1 ORDER BY a.created_at DESC LIMIT 1`
    return query(grab_token, values)
    .then((data) => {
      res(data.rows[0])
    })
    .catch((err) => {
      console.log(err)
      rej(err)
    })
  })
  return p
}

const insert_user_profile = (user_id, profile) => {
  const p = new Promise((res, rej) => {
    const values = [user_id, profile.first_name, profile.last_name, profile.email]
    let insert_profile = `INSERT INTO users (user_id, first_name, last_name, email) VALUES ($1, $2, $3, $4)`
    query(insert_profile, values, (err, results) => {
      if (err) {
        console.log(err)
        rej(err)
      }
      res('success')
    })
  })
  return p
}

exports.update_refresh_token = function(data, user_id) {
  console.log('========== update_refresh_token ===========')
  console.log('user_id: ', user_id)
  console.log(data)
  const p = new Promise((res, rej) => {
    const expires_at = new Date().getTime() + (data.expires_in*1000)
    const values = [user_id, data.access_token, expires_at]

    let insert_profile = `UPDATE google_refresh_tokens SET google_access_token = $2, expires_at = $3 WHERE aws_identity_id = $1`

    return query(insert_profile, values)
    .then((data) => {
      res('success')
    })
    .catch((err) => {
      console.log(err)
      rej(err)
    })
  })
  return p
}

exports.save_refresh_token_to_database = (access_token, refresh_token, identityId, googleId, expires_at) => {
  const p = new Promise((res, rej) => {
    const values = [refresh_token, identityId, googleId, expires_at, access_token]

    let insert_tokens = `INSERT INTO google_refresh_tokens (aws_identity_id, google_identity_id, google_refresh_token, expires_at, google_access_token)
                              VALUES ($2, $3, $1, $4, $5)
                              ON CONFLICT (aws_identity_id) DO UPDATE SET google_refresh_token = $1, expires_at = $4, google_access_token = $5
                        `

    query(insert_tokens, values)
      .then((data) => {
        console.log('INSERTED')
        res('INSERTED')
      })
      .catch((error) => {
        console.log(error)
        rej('bad boi bad boi')
      })
  })
  return p
}
