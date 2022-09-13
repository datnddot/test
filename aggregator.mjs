import { getRates } from "./web3.mjs"

export const aggregate = (inputTokenAdd, outputTokenAdd, chainId, outputAmount) => {
  getRates(inputTokenAdd, outputTokenAdd, chainId, outputAmount)
}
