class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      events: [],
      start: 0,
      end: 50,
      filter: '',
      value: '',
      address: '',
      version: '',
      contracts: {},
      network: ''
    }
    this.changeStart = this.changeStart.bind(this)
    this.changeEnd = this.changeEnd.bind(this)
    this.changeFilter = this.changeFilter.bind(this)
    this.changeValue = this.changeValue.bind(this)
  }

  async componentDidMount() {

    this.subscriptionId = await this.props.contractManager.subscribeAll(
      events => {
        this.setState(state => ({
          events: [...events, ...state.events]
        }))
      }
    )
    this.setState({
      address: this.props.contractManager.address(),
      version: this.props.contractManager.version(),
      contracts: this.props.contractManager.contractAddresses(),
      network: await web3.eth.net.getNetworkType()
    })
  }

  componentWillUnmount() {
    this.props.contractManager.unsubscribe(this.subscriptionId)
  }

  changeStart(e) {
    this.setState({ start: e.target.value })
  }

  changeEnd(e) {
    this.setState({ end: e.target.value })
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
      end,
      filter,
      value,
      address,
      version,
      contracts,
      network
    } = this.state
    if (events.length === 0) return <div>Loading...</div>

    const headers = []
    const headerRow = []
    const rows = []
    let filteredResults = []
    const parts = filter.split('.')
    const countByType = {}
    for (const event of events) {
      countByType[event.event] = countByType[event.event] + 1 || 1
      if (filter) {
        let item = event
        for (const part of parts) item = item ? item[part] : item
        if (item == value) filteredResults.push(event)
      }
    }
    const tableEvents = (filteredResults.length > 0
      ? filteredResults
      : events
    ).slice(start, end)
    for (const header in events[0]) headers.push(header)
    for (const header of headers) headerRow.push(<th key={header}>{header}</th>)
    for (const event of tableEvents) {
      const tds = []
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
          <pre>
            {JSON.stringify(
              contracts,
              null,
              2
            )}
          </pre>
        </div>
        <div>Total Results: {events.length}</div>
        <div>Filtered Results: {filteredResults.length}</div>
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
            End Index:{' '}
            <input value={end} type="number" onChange={this.changeEnd} />
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
