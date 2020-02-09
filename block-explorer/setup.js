let web3, hash
if (typeof ethereum === 'undefined') {
  ReactDOM.render(
    <div>
      Please enable/install <a href="https://metamask.io/">MetaMask</a> and
      connect to either the Main or Rinkeby network.
    </div>,
    document.getElementById('app')
  )
} else {
  web3 = new Web3(ethereum)
  hash = web3.utils.sha3

  ;(async () => {
    const contractManager = await ContractManager.init({
      abiUrl: config.storageAbiUrl,
      version: config.protocolVersion,
      byNetwork: config.networks
    })
    ReactDOM.render(
      <App contractManager={contractManager} />,
      document.getElementById('app')
    )
  })()
}
