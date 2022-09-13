import { TokenAmount, Pair, Currency } from '@uniswap/sdk'
import IUniswapV2PairABI from '@uniswap/v2-core/build/IUniswapV2Pair.json' assert {type: 'json'}
import { Interface } from '@ethersproject/abi'
import { RPC_ENDPOINT } from "./constant.mjs"
import Web3 from 'web3'
import { wrappedCurrency } from './wrappedCurrency.mjs'

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI.abi)

export const PairState = {
  LOADING: "LOADING",
  NOT_EXISTS: "NOT_EXISTS",
  EXISTS: "EXISTS",
  INVALID: "INVALID"
}

export function usePairs(currencies) {
  const { chainId } = 1

  const tokens = currencies.map(([currencyA, currencyB]) => [
    wrappedCurrency(currencyA, chainId),
    wrappedCurrency(currencyB, chainId)
  ])

  const pairAddresses = tokens.map(([tokenA, tokenB]) => {
    return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined
  })

  // const results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves')

  // return results.map((result, i) => {
  //   const { result: reserves, loading } = result
  //   const tokenA = tokens[i][0]
  //   const tokenB = tokens[i][1]

  //   if (loading) return [PairState.LOADING, null]
  //   if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
  //   if (!reserves) return [PairState.NOT_EXISTS, null]
  //   const { reserve0, reserve1 } = reserves
  //   const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
  //   return [
  //     PairState.EXISTS,
  //     new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString()))
  //   ]
  // })
}

function useMultipleContractSingleData(addresses, contractInterface, methodName) {
  const web3 = new Web3(RPC_ENDPOINT[chainId]);
}
