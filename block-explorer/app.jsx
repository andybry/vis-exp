class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      events: [],
      start: 0,
      count: 50,
      filter: '',
      value: '',
      address: '',
      version: '',
      contracts: {},
      network: ''
    }
    this.changeStart = this.changeStart.bind(this)
    this.changeCount = this.changeCount.bind(this)
    this.changeFilter = this.changeFilter.bind(this)
    this.changeValue = this.changeValue.bind(this)
  }

  async componentDidMount() {
    this.setState({
      address: this.props.contractManager.address(),
      version: this.props.contractManager.version(),
      network: await web3.eth.net.getNetworkType()
    })
    this.subscriptionId = await this.props.contractManager.subscribeAll(
      events => {
        this.setState(state => ({
          events: [...events, ...state.events]
        }))
      }
    )
    this.setState({
      contracts: this.props.contractManager.contractAddresses()
    })
  }

  componentWillUnmount() {
    this.props.contractManager.unsubscribe(this.subscriptionId)
  }

  changeStart(e) {
    this.setState({ start: e.target.value })
  }

  changeCount(e) {
    this.setState({ count: e.target.value })
  }

  changeFilter(e) {
    this.setState({ filter: e.target.value })
  }

  changeValue(e) {
    this.setState({ value: e.target.value })
  }

  render() {
    const {
      events,
      start,
      count,
      filter,
      value,
      address,
      version,
      contracts,
      network,
    } = this.state

    const headers = []
    const headerRow = []
    const rows = []
    const parts = filter.split('.')
    const countByType = {}
    let displayCount = 0
    let index = 0
    let filteredCount = 0

    if (events[0]) headerRow.push(<th key="Row">Row</th>)
    for (const header in events[0]) {
      headers.push(header)
      headerRow.push(<th key={header}>{header}</th>)
    }
    for (const event of events) {
      countByType[event.event] = countByType[event.event] + 1 || 1
      if (filter) {
        let item = event
        for (const part of parts) item = item ? item[part] : item
        if (item != value) continue
        filteredCount++
      }
      if (index++ < start || ++displayCount > count) continue
      const tds = [<td key="Row">{index - 1}</td>]
      for (const header of headers)
        tds.push(
          <td key={header}>
            {typeof event[header] === 'object' ? (
              <pre>{JSON.stringify(event[header], null, 2)}</pre>
            ) : (
              event[header]
            )}
          </td>
        )
      rows.push(<tr key={event.id}>{tds}</tr>)
    }

    return (
      <div>
        <div>Network: {network}</div>
        <div>Storage address: {address}</div>
        <div>Version: {version}</div>
        <div>
          Contracts:
          <pre>{JSON.stringify(contracts, null, 2)}</pre>
        </div>
        <div>Total Results: {events.length}</div>
        <div>Filtered Results: {filteredCount}</div>
        <div>
          Summary:
          <pre>{JSON.stringify(countByType, null, 2)}</pre>
        </div>
        <div>
          <label>
            Start Index:{' '}
            <input value={start} type="number" onChange={this.changeStart} />
          </label>
          <label>
            Count:{' '}
            <input value={count} type="number" onChange={this.changeCount} />
          </label>
        </div>
        <div>
          <label>
            Filter (can be dot separated):{' '}
            <input value={filter} type="text" onChange={this.changeFilter} />
          </label>
          <label>
            Value:{' '}
            <input value={value} type="text" onChange={this.changeValue} />
          </label>
        </div>
        <div>Data:</div>
        <table>
          <thead>
            <tr>{headerRow}</tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    )
  }
}
