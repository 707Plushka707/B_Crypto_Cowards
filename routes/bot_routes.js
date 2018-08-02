const get_bott = require('../Postgres/Queries/BotQueries').get_bott
const get_bal = require('../api/Binance/binance_api').get_bal
const market_sell = require('../api/Binance/binance_api').market_sell
const market_buy = require('../api/Binance/binance_api').market_buy
const get_min_order = require('../api/Binance/binance_api').get_min_order
const get_market_prices = require('../api/Binance/binance_api').get_market_prices
const get_top_ranks = require('../api/Cmc/cmc').get_top_ranks
const set_active_bot = require('../Postgres/Queries/BotQueries').set_active_bot
const set_deactive_bot = require('../Postgres/Queries/BotQueries').set_deactive_bot
const set_updated_at = require('../Postgres/Queries/BotQueries').set_updated_at
const remove_user_bot = require('../Postgres/Queries/BotQueries').remove_user_bot

exports.deactivate_bot = (req, res, next) => {
  const info = req.body
  console.log('hit')
  set_deactive_bot(info.bot_id)
    .then(() => {
      res.json('deactivated')
    })
}

exports.delete_user_bot = (req, res, next) => {
  const info = req.body
  console.log('hit')
  remove_user_bot(info.user_id)
    .then(() => {
      res.json('deleted')
    })
}


exports.activate_bot = (req, res, next) => {
  console.log(req)

  // const binance = new Binance().options({
  //   APIKEY: data.api_key,
  //   APISECRET: data.api_secret,
  //   useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  // })
  const binanceSymbols = ['BTC', 'ADA', 'ADX', 'AE', 'AGI', 'AION', 'AMB', 'APPC', 'ARK', 'ARN', 'AST', 'BAT',
                  'BCC', 'BCD', 'BCN', 'BCPT', 'BLZ', 'BNB', 'BNT', 'BQX', 'BRD', 'BTG', 'BTS', 'CDT',
                  'CHAT', 'CLOAK', 'CMT', 'CND', 'CVC', 'DASH', 'DATA', 'ARDR', 'HOT', 'DOCK', 'POLY', 'DENT', 'DGD', 'DLT', 'DNT', 'EDO', 'ELF',
                  'ENG', 'ENJ', 'EOS', 'ETC', 'ETH', 'EVX', 'FUEL', 'FUN', 'GAS', 'GNT', 'GRS', 'GTO', 'GVT', 'GXS', 'HSR', 'ICN', 'ICX', 'INS',
                  'IOST', 'IOTA', 'IOTX', 'KEY', 'KMD', 'KNC', 'LEND', 'LINK', 'LOOM', 'LRC', 'LSK', 'LTC', 'LUN', 'MANA', 'MCO', 'MDA', 'MFT',
                  'MOD', 'MTH', 'MTL', 'NANO', 'NAS', 'NAV', 'NCASH', 'NEBL', 'NEO', 'NPXS', 'NULS', 'NXS', 'OAX', 'OMG', 'ONT', 'OST', 'PIVX',
                  'POA', 'POE', 'POWR', 'PPT', 'QKC', 'QLC', 'QSP', 'QTUM', 'RCN', 'REP', 'REQ', 'RLC', 'RPX', 'SALT', 'SC', 'SKY', 'SNGLS', 'SNM',
                  'SNT', 'STEEM', 'STORJ', 'STORM', 'STRAT', 'SUB', 'SYS', 'THETA', 'TNB', 'TNT', 'TRIG', 'TRX', 'TUSD', 'VEN', 'VIA', 'VIB', 'VIBE',
                  'WABI', 'WAN', 'WAVES', 'WINGS', 'WPR', 'WTC', 'XEM', 'XLM', 'XMR', 'XRP', 'XVG', 'XZC', 'YOYO', 'ZEC', 'ZEN', 'ZIL', 'ZRX']

  get_bott(req)
    .then((data) => {
      console.log('<<<<<<<<<data>>>>>>>>>>>')
      console.log(data)
      const rebal = data.bot[0].algo
      const botId = data.bot[0].bot_id
      console.log(rebal)
      console.log('<<<<=<=<<<<data>>>=>>>=>>>>>')
      get_bal(req)
        .then((balance) => {
          console.log(balance)
          console.log('<<<<<<<<<data>>>>>>>>>')
          if (balance.message == 'Api Keys DNE') {
            rej('Api Keys DNE')
          }
          else if (balance.message == 'success'){
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
          }
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
          if (newb.balance.length == 0) {
            res.json('Insufficent funds')
          }
          else {
            const rebData = data.bot[0]
            console.log('newb')
            console.log(newb) //new balance
            console.log(data) //rebalancing % data
            const totalBtc = newb.balance[0][1] //MAKE SURE ALWAYS BTC
            const order = rebData.algo.filter(pair => pair.value !== 0 && pair.symbol !== 1 && pair.symbol !== 'BTC')
            let calculatedOrder = order.map(pair => { return [pair.symbol + 'BTC', pair.value * 0.01 * totalBtc]})
            console.log(rebData.algo_type)
            console.log(rebData.algo_type)
            if (rebData.algo_type.type == 'Rebalance') {
              if (rebData.algo_type.reb_type == 'rank') { //get current ranks, pass in as coins by rank
                get_top_ranks()
                  .then(ranked => {
                    console.log(ranked)
                    const binancedIt = ranked.filter(coin => binanceSymbols.includes(coin[1]))
                    console.log(order)
                    const ranksOrder = order.map(coin => {return { symbol: binancedIt[coin.symbol - 1][1], value: coin.value }})
                    console.log(ranksOrder)
                    console.log('ranked^')
                    calculatedOrder = ranksOrder.map(pair => { return [pair.symbol + 'BTC', pair.value * 0.01 * totalBtc]})
                    const symbolsInclude = ranksOrder.map(pair => pair.symbol + 'BTC')
                    console.log(symbolsInclude)
                    return symbolsInclude
                  })
                  .then((symbolsInclude) => {
                    get_market_prices()
                     .then(prices => {
                       const stuff = prices.filter(coins => symbolsInclude.includes(coins.symbol)).map(coin => [coin.symbol, coin.askPrice])
                       const ans = stuff.map(coin => {
                         const n = new Promise((res, rej) => {
                           calculatedOrder.some((coins) => {
                             console.log('hit')
                             console.log(coin[0])
                             console.log(coins[0])
                             if (coin[0] == coins[0]) {
                               console.log(coin[0])
                               console.log(coins[0])
                               res([coin[0], coins[1]/coin[1]])
                             }
                           })
                         })
                         return n
                       })

                       return Promise.all(ans)
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
                             console.log(ans)
                             return Promise.all(ans)
                           })
                       )
                     })
                     .then(fixedBuys => {
                       console.log(fixedBuys)
                       console.log('yeyeye')
                       market_buy(req.body.user_id, fixedBuys)
                       set_updated_at(botId)
                       return set_active_bot(botId)
                     })
                     .then(() => {
                       res.json('success')
                     })
                  })

              }
              else if (rebData.algo_type.reb_type == 'coin') { //pass straight in
                 const symbolsInclude = order.map(pair => pair.symbol + 'BTC')
                 console.log(order)
                 console.log('order^')
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
                    set_updated_at(botId)
                    res.json('success')
                  })
              }
            }
          }
        })
        .catch((err) => {
          res.json('Api Keys DNE')
        })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send('Failed to get ads')
    })
}
