/* global sdk */

let lastPrice = CryptoCowards.getPrice('BTC-USD')
const priceWentUp = markets => {
  const price = markets['PIVXBTC'].open
  return price > lastPrice
}

const thenBuy = quantity => () => CryptoCowards.buy('PIVXBTC', quantity)

CryptoCowards.addTrigger(
  priceWentUp,
  thenBuy(0.001)
)
