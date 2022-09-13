import { Currency, Fetcher, CurrencyAmount, Pair, Token, Trade } from '@uniswap/sdk'
import { BASES_TO_CHECK_TRADES_AGAINST, CUSTOM_BASES, RPC_ENDPOINT } from "./constant.mjs"
import lodash from 'lodash'
import { wrappedCurrency } from './utils/wrappedCurrency.mjs'
import ethers from 'ethers'
import { batch, contract } from '@pooltogether/etherplex'
import IUniswapV2PairABI from '@uniswap/v2-core/build/IUniswapV2Pair.json' assert {type: 'json'}

const PairState = {
  LOADING: "LOADING",
  NOT_EXISTS: "NOT_EXISTS",
  EXISTS: "EXISTS",
  INVALID: "INVALID"
}

export const getRates = (inputTokenAdd, outputTokenAdd, chainId, outputAmount) => {
  getBestTradeExactOut(inputTokenAdd, outputTokenAdd, chainId, outputAmount)
}

async function getBestTradeExactOut(inputTokenAdd, outputTokenAdd, chainId, outputAmount) {
  const inputToken = await Fetcher.fetchTokenData(chainId, inputTokenAdd)
  const outputToken = await Fetcher.fetchTokenData(chainId, outputTokenAdd)
  useAllCommonPairs(inputToken, outputToken, chainId)
}

function useAllCommonPairs(inputToken, outputToken, chainId) {
  const bases = chainId ? BASES_TO_CHECK_TRADES_AGAINST[chainId] : []
  const [tokenA, tokenB] = chainId
    ? [wrappedCurrency(inputToken, chainId), wrappedCurrency(outputToken, chainId)]
    : [undefined, undefined]
  
  const basePairs = lodash.flatMap(bases, (base) => bases.map(otherBase => [base, otherBase])).filter(
    ([t0, t1]) => t0.address !== t1.address
  )
  
  const allPairCombinations = tokenA && tokenB ? 
    [
      // the direct pair
      [tokenA, tokenB],
      // token A against all bases
      ...bases.map((base) => [tokenA, base]),
      // token B against all bases
      ...bases.map((base) => [tokenB, base]),
      // each base against all bases
      ...basePairs
    ]
      .filter((tokens) => Boolean(tokens[0] && tokens[1]))
      .filter(([t0, t1]) => t0.address !== t1.address)
      .filter(([tokenA, tokenB]) => {
        if (!chainId) return true
        const customBases = CUSTOM_BASES[chainId]
        if (!customBases) return true

        const customBasesA = customBases[tokenA.address]
        const customBasesB = customBases[tokenB.address]

        if (!customBasesA && !customBasesB) return true

        if (customBasesA && !customBasesA.find(base => tokenB.equals(base))) return false
        if (customBasesB && !customBasesB.find(base => tokenA.equals(base))) return false

        return true
      })
    : []
  
  const allPairs = usePairs(allPairCombinations, chainId)
}

function usePairs(currencies, chainId) {

  const tokens = currencies.map(([currencyA, currencyB]) => [
    wrappedCurrency(currencyA, chainId),
    wrappedCurrency(currencyB, chainId)
  ])

  const pairAddresses = tokens.map(([tokenA, tokenB]) => {
    return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined
  })

  const results = getReserves(pairAddresses, chainId)

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

async function getReserves(addresses, chainId) {
  const provider = new ethers.providers.JsonRpcProvider({
    url: RPC_ENDPOINT[chainId]
  });
  const calls = addresses.map((address) =>
    contract(address,IUniswapV2PairABI.abi, address).getReserves(),
  );
  const abc = await batch.apply(null, [provider, ...calls])
    .then((results) => {
      const output = {};
      console.log(results)
      return output;
    })
}