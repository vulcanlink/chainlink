import { Networks } from './networks'

const REACT_APP_ETH_EXPLORER = process.env.REACT_APP_ETH_EXPLORER

export function etherscanAddress(networkId: Networks, contractAddress: string) {
  if (REACT_APP_ETH_EXPLORER) return `${REACT_APP_ETH_EXPLORER}/address/${contractAddress}`
  switch (networkId) {
    case Networks.ROPSTEN:
      return `https://ropsten.etherscan.io/address/${contractAddress}`
    case Networks.KOVAN:
      return `https://kovan.etherscan.io/address/${contractAddress}`
    default:
      return `https://etherscan.io/address/${contractAddress}`
  }
}
