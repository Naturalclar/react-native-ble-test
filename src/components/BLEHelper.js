// @flow
/* eslint-disable no-undef */
/* eslint-disable class-methods-use-this */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  ListView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native'
import createActions from '../actions'

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    width: window.width,
    height: window.height,
  },
  center: {
    textAlign: 'center',
  },
  button: {
    marginTop: 40,
    backgroundColor: '#54a2ff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  noPeripheral: {
    flex: 1,
    justifyContent: 'center',
  },
  displayWeight: {
    flex: 2,
    justifyContent: 'center',
  },
  weightText: {
    fontSize: 64,
    textAlign: 'center',
  },
  unitText: {
    fontSize: 16,
    paddingLeft: '40%',
    textAlign: 'center',
  },
})

type Props = {
  started: Boolean,
  scanning: Boolean,
  peripherals: Map,
  weight: String,
  actions: any,
}

class BLEHelper extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleButtonPress = this.handleButtonPress.bind(this)
  }

  componentDidMount() {
    const {
      started,
      actions: { initBleManager },
    } = this.props
    if (!started) {
      initBleManager()
    }
  }

  async handleButtonPress() {
    const {
      actions: { bleHelperButtonAction },
    } = this.props

    bleHelperButtonAction()
  }

  render() {
    const { scanning, weight, peripherals } = this.props
    const list = Array.from(peripherals.values())
    const dataSource = ds.cloneWithRows(list)

    return (
      <View style={styles.container}>
        <TouchableHighlight
          style={styles.button}
          onPress={this.handleButtonPress}
        >
          <Text style={styles.buttonText}>Scan</Text>
        </TouchableHighlight>
        <Text style={styles.center}>
          Scan is currently
          {scanning ? ' ' : ' not '}
          running.
        </Text>
        <ScrollView style={styles.scroll}>
          {list.length === 0 && (
            <View style={styles.noPeripheral}>
              <Text style={styles.center}>No peripherals</Text>
            </View>
          )}
          <ListView
            enableEmptySections
            dataSource={dataSource}
            renderRow={item => {
              const color = item.connected ? 'green' : '#fff'
              return (
                <TouchableHighlight
                  onPress={() => {
                    this.connect(item.id)
                  }}
                >
                  <View style={[styles.row, { backgroundColor: color }]}>
                    <Text
                      style={{
                        fontSize: 12,
                        textAlign: 'center',
                        color: '#333333',
                        padding: 10,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 8,
                        textAlign: 'center',
                        color: '#333333',
                        padding: 10,
                      }}
                    >
                      {item.id}
                    </Text>
                  </View>
                </TouchableHighlight>
              )
            }}
          />
        </ScrollView>
        <View style={styles.displayWeight}>
          <Text style={styles.weightText}>{weight}</Text>
          <Text style={styles.unitText}>kg</Text>
        </View>
      </View>
    )
  }
}

const mapStateToProps = state => {
  const {
    ble: { started, scanning, peripherals, weight },
  } = state
  return { started, scanning, peripherals, weight }
}

const mapDispatchToProps = dispatch => ({
  actions: createActions(dispatch),
  dispatch,
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(BLEHelper)
