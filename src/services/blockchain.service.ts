import config from 'config'
import { Contract as EthersContract, ContractInterface as EthersContractInterface, providers } from 'ethers'
import { Service } from 'typedi'

const EXPECTED_PONG_BACK = 15000
const KEEP_ALIVE_CHECK_INTERVAL = 7500

export type ContractInterface = EthersContractInterface

export type Contract = EthersContract

export type ContractReconnectCallback = (contract: Contract) => void

export type WebSocketProviderReconnectCallback = (provider: providers.JsonRpcProvider) => void

@Service()
export class BlockchainService {
  private readonly endpoint: string

  constructor() {
    this.endpoint = config.get('node.endpoint')
  }

  contract(abi: ContractInterface, address: string, onReconnect: ContractReconnectCallback): Contract {
    let contract = new EthersContract(
      address,
      abi,
      this.createProvider(provider => {
        contract = contract.connect(provider)
        onReconnect(contract)
      }),
    )
    return contract
  }

  private createProvider(onReconnect: WebSocketProviderReconnectCallback): providers.JsonRpcProvider {
    if (this.endpoint.startsWith('ws')) {
      return this.createWebSocketProvider(onReconnect)
    }
    return new providers.JsonRpcProvider(this.endpoint)
  }

  private createWebSocketProvider(onReconnect: WebSocketProviderReconnectCallback) {
    let provider = new providers.WebSocketProvider(this.endpoint)

    let pingTimeout = null
    let keepAliveInterval = null

    provider._websocket.on('open', () => {
      keepAliveInterval = setInterval(() => {
        provider._websocket.ping()
        pingTimeout = setTimeout(() => {
          provider._websocket.terminate()
        }, EXPECTED_PONG_BACK)
      }, KEEP_ALIVE_CHECK_INTERVAL)
    })

    provider._websocket.on('close', () => {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval)
      }
      if (pingTimeout) {
        clearTimeout(pingTimeout)
      }
      provider = this.createWebSocketProvider(onReconnect)
      onReconnect(provider)
    })

    provider._websocket.on('pong', () => {
      clearInterval(pingTimeout)
    })

    return provider
  }
}
