const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

exports.get_all_ads = () => {
  const p = new Promise((res, rej) => {
    const getAds = `SELECT a.ad_id, a.ad_title, a.ad_unit, a.created_at,
                            b.formatted_address, b.gps_x, b.gps_y, b.place_id
                       FROM advertisements a
                      INNER JOIN address b
                        ON a.address_id = b.address_id`

    query(getAds, (err, results) => {
      if (err) {
        console.log(err)
        rej(err)
      }
      res(results)
    })
  })
  return p
}
