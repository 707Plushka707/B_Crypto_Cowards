const AWS = require('aws-sdk')
const uuid = require('uuid').v4
const express = require('express')

const Broker = require('./broker')

const broker = new Broker()

const s3 = AWS.S3()

const PORT = process.env.PORT || 8000
const ALGORITHMS_BUCKET = 'crypto-coward-algorithms'

const app = express()

// Use some sort of session middleware which provides `req.user` to express middleware
// app.use(session())

// Algorithm API
// CryptoPros can save their algorithms here. These algorithms are available for Bots to use to trade.

// save algorithm (can overwrite with same name)
app.put('/algorithm', async (res, req) => {
  const { name, code: Body } = JSON.parse(res.body)
  const Key = `${req.user.id}/${name}.js`
  await s3.upload({ Key, Bucket: ALGORITHMS_BUCKET, Body }).promise()
  res.send('saved!')
})

// delete algorithm with name
app.delete('/algorithm', (res, req) => {
  // deletes algorithm from s3
})

// Bot API
// CryptoPros can spin up new Bots which run a particular algorithm with specific parameters.
// Bots can be created, destroyed, started, and stopped

// create bot with name
app.put('/bot', (res, req) => {
  const { name, algorithm, parameters } = JSON.parse(res.body)
  const { id: userid, binanceKey, binanceSecret } = req.user

  const bot = broker.createBot(userid, { binanceKey, binanceSecret, test: true }, name, algorithm, parameters)
  res.json(bot) // => { name, algorithm, running: false, ... }
})

// start bot with name
app.post('/bot/:botid/start', async (res, req) => {
  const { name } = JSON.parse(res.body)
  const { id: userid } = req.user
  const bot = await broker.startBot(userid, name)
  res.json(bot) // => { name, algorithm, running: true, ... }
})

// stop bot with name
app.post('/bot/:botid/stop', (res, req) => {})

// destroy bot with name
app.delete('/bot', (res, req) => {})

app.listen(PORT, () => console.log(`> listening on port ${PORT}`))
