/**
 * Manages interactions with the Aventus Storage Contract.
 * This contract stores global values including contract addresses
 * and interfaces, i.e. ABI, of the Aventus Protocol. As such,
 * it is the entry point for the protocol
 */
class Storage {
  /** underlying contract */
  contract = null
  /** methods from the underlying contract */
  methods = null
  /** protocol version */
  version = ''

  /**
   * Create the Storage contract
   *
   * @param {string} url url of the ABI for the storage contract
   * @param {string} address address of the storage contract
   * @param {string} version version of the protocol to use (e.g. '0.14')
   */
  static async init(url, address, version) {
    const res = await fetch(url)
    const { abi } = await res.json()
    const contract = new web3.eth.Contract(abi, address)
    return new Storage(contract, version)
  }

  /**
   * @private
   *
   * @param {string} contract
   * @param {string} version
   */
  constructor(contract, version) {
    this.contract = contract
    this.methods = contract.methods
    this.version = version
  }

  /**
   * Appends the version info to the contract
   *
   * @param {string} name contract name
   */
  withVersion(name) {
    return `${name}-${this.version}`
  }

  /**
   * Utility to make calling a method on the contract
   * easier
   *
   * @param {string} method name of the method to call
   * @param  {...any} args arguments to pass to the method call
   */
  call(method, ...args) {
    return this.methods[method](...args).call()
  }

  /**
   * Retrieve an address value stored in the storage contract
   * by key
   *
   * @param {string} key
   */
  async address(key) {
    return this.call('getAddress', hash(key))
  }

  /**
   * Retreive an unsigned int value from the storage contract
   * by key
   *
   * @param {string} key
   */
  async uint(key) {
    return this.call('getUInt', hash(key))
  }

  /**
   * Retrieve a string value from the storage contract by key
   * @param {string} key
   */
  async string(key) {
    return this.call('getString', hash(key))
  }

  /**
   * Retrieve an initialise a Web3 contract from the protocol
   * by name
   *
   * @param {string} name
   */
  async getContract(name) {
    const withVersion = this.withVersion(name)
    const address = await this.address(`${withVersion}_Address`)
    const n = await this.uint(`${withVersion}_Abi_NumParts`)
    const ps = []
    for (let i = 0; i < n; i++)
      ps.push(this.string(`${withVersion}_Abi_Part_${i}`))
    const parts = await Promise.all(ps)
    const abi = JSON.parse(parts.join(''))
    return new web3.eth.Contract(abi, address)
  }
}
