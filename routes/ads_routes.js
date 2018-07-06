const get_all_ads = require('../Postgres/Queries/AdsQueries').get_all_ads

exports.get_ads = (req, res, next) => {
  console.log(req)

  get_all_ads()
    .then((data) => {
      res.json(data.rows)
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send('Failed to get ads')
    })
}
