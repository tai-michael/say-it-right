export default async function (fn, maxRetries = 3, initialDelay = 2000) {
  let retryCount = 0
  let delay = initialDelay
  while (retryCount < maxRetries) {
    try {
      return await fn()
    } catch (err) {
      console.log(err)
      if (err.response.status === 500) {
        await new Promise((resolve) => setTimeout(resolve, delay))
        console.log('Bad response error (500). Retrying function...')
        delay *= 2
        retryCount++
      } else {
        throw err
      }
    }
  }
  throw new Error(`Function failed after ${maxRetries} retries`)
}
