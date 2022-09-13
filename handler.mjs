import {aggregate} from "./aggregator.mjs"

export const hello = async (event) => {
  const inputTokenAdd = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' //UNI
  const outputTokenAdd = '0xdac17f958d2ee523a2206206994597c13d831ec7' //USDT
  const chainId = 1
  const outputAmount = 1000000 // 1 USDT
  aggregate(inputTokenAdd, outputTokenAdd, chainId, outputAmount)
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
