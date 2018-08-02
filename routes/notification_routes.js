const get_user_notifications = require('../Postgres/Queries/NotificationQueries').get_user_notifications
const false_user_notifications = require('../Postgres/Queries/NotificationQueries').false_user_notifications


exports.all_user_notifications = (req, res, next) => {

  get_user_notifications(req)
    .then((data) => {
      console.log(data)
      res.json({
        notifications: data.notifications
      })
    })
}

exports.mark_user_notifications = (req, res, next) => {

  false_user_notifications(req)
    .then((data) => {
      console.log(data)
      res.json({
        message: 'success'
      })
    })
}
