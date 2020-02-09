const CONTRACTS_BY_NAME = {
  events: 'IEventsManager',
  avt: 'IAVTManager',
  validators: 'IValidatorsManager',
  merkleRoots: 'IMerkleRootsManager'
}

class ContractManagerConfig {
  /** URL from which to retrieve the ABI for the storage contract */
  abiUrl = ''
  /** version of the protocol to use */
  version = ''
  /** map of storage contract addresses by network */
  byNetwork = {}
}

class ContractManager {
  storage = null
  contracts = {}
  subscriptions = []

  constructor(storage) {
    this.storage = storage
  }
  
  address() {
    return this.storage.contract._address
  }

  version() {
    return this.storage.version
  }

  contractAddresses() {
    const ret = {}
    for (const name in this.contracts) ret[CONTRACTS_BY_NAME[name]] = this.contracts[name]._address
    return ret
  }

  async contract(name) {
    let contract = this.contracts[name]
    if (contract) return contract
    contract = await this.storage.getContract(CONTRACTS_BY_NAME[name])
    this.contracts[name] = contract
    return contract
  }

  async subscribe(name, f) {
    const contract = await this.contract(name)
    const subscription = contract.events.allEvents({ fromBlock: 5700000 })
    let buffer = []
    subscription.on('data', data => {
      buffer.unshift(new EthEvent(data))
      setTimeout(() => {
        f(buffer)
        buffer = []
      })
    })
    return this.subscriptions.push(subscription) - 1
  }

  async subscribeAll(f) {
    const subscriptions = []
    for (const name in CONTRACTS_BY_NAME)
      subscriptions.push(await this.subscribe(name, f))
    return this.subscriptions.push(subscriptions)
  }

  unsubscribe(id) {
    ;[].concat(this.subscriptions[id]).forEach(sub => sub.unsubscribe())
  }

  /**
   *
   * @param {ContractManagerConfig} config
   */
  static async init(config) {
    const network = await web3.eth.net.getNetworkType()
    const address = config.byNetwork[network]
    const storage = await Storage.init(config.abiUrl, address, config.version)
    return new ContractManager(storage, config)
  }
}
