const get_bott = require('../Postgres/Queries/BotQueries').get_bott
const get_bal = require('../api/Binance/binance_api').get_bal
const market_sell = require('../api/Binance/binance_api').market_sell
const market_buy = require('../api/Binance/binance_api').market_buy
const get_min_order = require('../api/Binance/binance_api').get_min_order
const get_market_prices = require('../api/Binance/binance_api').get_market_prices

exports.activate_bot = (req, res, next) => {
  console.log(req)

  // const binance = new Binance().options({
  //   APIKEY: data.api_key,
  //   APISECRET: data.api_secret,
  //   useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  // })

  get_bott(req)
    .then((data) => {
      console.log('<<<<<<<<<data>>>>>>>>>>>')
      console.log(data)
      const rebal = data.bot[0].algo
      console.log(rebal)
      console.log('<<<<=<=<<<<data>>>=>>>=>>>>>')
      get_bal(req)
        .then((balance) => {
          console.log(balance)
          console.log('<<<<<<<<<data>>>>>>>>>')
          const newbal = balance.balance.filter(coin => coin[0] !== 'BTC')
          return (
            get_min_order()
              .then((mini) => {
                const mins = newbal.map(coin => {return  [coin[0], mini[coin[0] + 'BTC'].minQty]})
                console.log(mins)
                console.log('disismini')
                console.log(newbal)
                const ans = mins.map(coin => {
                  const d = new Promise((res, rej) => {
                    newbal.some((coinz) => {
                      if (coin[0] == coinz[0]) {
                        const filter = ((coinz[1] * 1000000000000000) % (coin[1] * 1000000000000000))/1000000000000000
                        const filtered = coinz[1] - filter
                        console.log([coin[0], filtered])
                        res([coin[0], filtered])
                      }
                    })
                  })
                  return d
                })
                return Promise.all(ans)
              })
          )
        })
        .then((rez) => {
          console.log('rezed')
          console.log(rez)
          return market_sell(req.body.user_id, rez)
        })
        .then(() => {
          console.log('sold')
          return get_bal(req)
        })
        .then((newb) => {
          // new balance calculate rebalance
          const rebData = data.bot[0]

          console.log(newb) //new balance
          console.log(data) //rebalancing % data
          const totalBtc = newb.balance[0][1] //MAKE SURE ALWAYS BTC
          const order = rebData.algo.filter(pair => pair.value !== 0 && pair.symbol !== 1 && pair.symbol !== 'BTC')
          const calculatedOrder = order.map(pair => { return [pair.symbol + 'BTC', pair.value * 0.01 * totalBtc]})

          console.log(rebData.algo_type)
          console.log(rebData.algo_type)
          if (rebData.algo_type.type == 'Rebalance') {
            if (rebData.algo_type.reb_type == 'rank') { //get current ranks, pass in as coins by rank


              console.log(order)
              console.log('yeeyeyeyeemyan')
            }
            else if (rebData.algo_type.reb_type == 'coin') { //pass straight in
               const symbolsInclude = order.map(pair => pair.symbol + 'BTC')
               console.log(order)
               console.log('order^')
               console.log(totalBtc)
               console.log("totalBtc^")
               console.log(calculatedOrder)
               console.log('calculatedorder^') //symbol orders by btc allocation
               get_market_prices()
                .then(prices => {
                  const symbolsPrices = prices.filter(coins => symbolsInclude.includes(coins.symbol)).map(coin => [coin.symbol, coin.askPrice]) //prices in btc
                  console.log(symbolsPrices)
                  console.log('symbolsPrices^')
                  const newArray = []
                  symbolsPrices.forEach(coin => { calculatedOrder.forEach(coins => { if (coin[0] == coins[0]) { newArray.push([coin[0], coins[1]/coin[1]])} }) } )

                  return newArray
                })
                .then(newData => {
                  return (
                    get_min_order()
                      .then((mini) => {
                        const mins = symbolsInclude.map(coin => {return  [coin, mini[coin].minQty]})
                        console.log(mins)
                        console.log('mini stuff')
                        console.log(newData)
                        const ans = mins.map(coin => {
                          const d = new Promise((res, rej) => {
                            newData.some((coinz) => {
                              if (coin[0] == coinz[0]) {
                                const filter = ((coinz[1] * 1000000000000000) % (coin[1] * 1000000000000000))/1000000000000000
                                const filtered = coinz[1] - filter
                                console.log([coin[0], filtered])
                                res([coin[0], filtered])
                              }
                            })
                          })
                          return d
                        })
                        return Promise.all(ans)
                      })
                  )
                })
                .then(fixedBuys => {
                  console.log(fixedBuys)
                  market_buy(req.body.user_id, fixedBuys)
                  res.json('success')
                })
            }
          }
        })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send('Failed to get ads')
    })
}
