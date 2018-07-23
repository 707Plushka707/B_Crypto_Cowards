const axios = require('axios')
const crypto = require('crypto')
const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../../Postgres/db_connect')
const uuid = require('uuid')
const query = promisify(pool.query)
const moment = require('moment')


exports.get_top_ranks = function() {
  console.log('hit api call')
  const p = new Promise((res, rej) => {
    axios.get(
      `https://api.coinmarketcap.com/v2/ticker/?limit=100&sort=rank`
    ).then((data) => {
      console.log(data)
      const toArray = Object.keys(data.data.data).map(i => { return [data.data.data[i].rank, data.data.data[i].symbol] }).sort((a,b) => a[0] - b[0])
      res(toArray)
    }).catch((err) => {
      console.log(err.response.data)
      rej(err)
    })

  })
  return p
}
