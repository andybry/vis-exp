/**
 * Represents a Ethereum Block Chain log event
 */
class EthEvent {
  /** id for the event on the block chain */
  id = ''
  /** the name of the event */
  event = ''
  /** the hash of the event name with its parameter types */
  signature = ''
  /** address of the contract that created the event */
  address = ''
  /** the block number in which the event was created */
  blockNumber = 0
  /** the hash of the transaction in which the event was created */
  transactionHash = ''
  /** the unique fields of this particular type of event */
  dynamic = {}

  /**
   * Creates the Event object from the Ethereum log data
   *
   * @param {object} data
   */
  constructor(data) {
    this.id = data.id
    this.event = data.event
    this.signature = data.signature
    this.address = data.address
    this.blockNumber = data.blockNumber
    this.transactionHash = data.transactionHash
    for (const key in data.returnValues) {
      if (!key.match(/\d+/g)) this.dynamic[key] = data.returnValues[key]
    }
  }
}
