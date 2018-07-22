const bodyParser = require('body-parser')

// security
const Google_JWT_Check = require('./auth/googleJWTCheck').Google_JWT_Check
const originCheck = require('./auth/originCheck').originCheck

// routes
const Test = require('./routes/test_routes')
const AdsRoutes = require('./routes/ads_routes')
// const GoogleRoutes = require('./routes/google_routes')
// const UserRoutes = require('./routes/user_routes')
// const EmailRoutes = require('./routes/email_routes')
const UserQueries = require('./Postgres/Queries/UserQueries')
const Binance = require('./api/Binance/binance_api')
const AlgoQueries = require('./Postgres/Queries/AlgoQueries')
const RoleQueries = require('./Postgres/Queries/RoleQueries')
const FollowQueries = require('./Postgres/Queries/FollowQueries')
const Bot = require ('./Postgres/Queries/BotQueries')
const Bots = require('./routes/bot_routes')
// bodyParser attempts to parse any request into JSON format
const json_encoding = bodyParser.json({type:'*/*'})
// bodyParser attempts to parse any request into GraphQL format
// const graphql_encoding = bodyParser.text({ type: 'application/graphql' })

module.exports = function(app){

	// tests
	app.get('/test', json_encoding, Test.test)

	// ads routes
	app.post('/get_ads', [json_encoding, originCheck, Google_JWT_Check], AdsRoutes.get_ads)

	// app.post('/auth_test', [json_encoding, originCheck, Google_JWT_Check], Test.auth_test)
	//

	// // auth
	// app.post('/initial_google_auth', [json_encoding, originCheck, Google_JWT_Check], GoogleRoutes.initial_google_auth)
	app.post('/retrieve_user_profile', [json_encoding, originCheck, Google_JWT_Check], UserQueries.retrieve_user_profile)
	// app.post('/watch_route', [json_encoding, originCheck], EmailRoutes.watch_route)

	// Binance
	app.post('/save_binance', [json_encoding, originCheck, Google_JWT_Check], Binance.save_binance)

	app.post('/get_candlesticks', [json_encoding, originCheck, Google_JWT_Check], Binance.get_candlesticks)

	app.post('/get_balance', [json_encoding, originCheck, Google_JWT_Check], Binance.get_balance)
	//check if user is a coward
	//app.post('/check_coward_exists', [json_encoding, originCheck, Google_JWT_Check], UserQueries.check_coward_exists)

	//check if user is a pro
	app.post('/check_account_role', [json_encoding, originCheck, Google_JWT_Check], RoleQueries.check_account_role)
	// email

	app.post('/add_coward', [json_encoding, originCheck, Google_JWT_Check], RoleQueries.add_coward)

	app.post('/add_pro', [json_encoding, originCheck, Google_JWT_Check], RoleQueries.add_pro)

	app.post('/add_algo', [json_encoding, originCheck, Google_JWT_Check], AlgoQueries.add_algo)

	app.post('/get_user_algos', [json_encoding, originCheck, Google_JWT_Check], AlgoQueries.get_user_algos)

	app.get('/get_all_algos', [json_encoding, originCheck, Google_JWT_Check], AlgoQueries.get_all_algos)

	app.post('/add_follows', [json_encoding, originCheck, Google_JWT_Check], FollowQueries.add_follows)

	app.post('/get_user_follows', [json_encoding, originCheck, Google_JWT_Check], FollowQueries.get_user_follows)

	app.post('/delete_follows', [json_encoding, originCheck, Google_JWT_Check], FollowQueries.delete_follows)

	app.post('/get_portfolio', [json_encoding, originCheck, Google_JWT_Check], Bot.get_portfolio)

	app.post('/save_bot', [json_encoding, originCheck, Google_JWT_Check], Bot.save_bot)

	app.post('/get_bot', [json_encoding, originCheck, Google_JWT_Check], Bot.get_bot)

	app.post('/activate_bot', [json_encoding, originCheck, Google_JWT_Check], Bots.activate_bot)
	// app.post('/activate_bot', [json_encoding, originCheck, Google_JWT_Check], Bot.activate_bot)


	// app.post('/pull_changes', [json_encoding, originCheck], EmailRoutes.pull_changes)
	// app.post('/get_email', [json_encoding, originCheck], EmailRoutes.get_email)
	// app.post('/get_threads', [json_encoding, originCheck], EmailRoutes.get_threads)
	// app.post('/get_thread', [json_encoding, originCheck], EmailRoutes.get_thread)
}
