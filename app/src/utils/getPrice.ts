export async function getPrice(asset: string) {
  fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${asset}&vs_currencies=usd&include_24hr_change=true`
  )
    .then((r) => {
      console.log(r)
      return r.json()
    })
    .catch((e) => {
      return e.json()
    })
}
