/* eslint-disable no-undef */
/* eslint-disable class-methods-use-this */
import React, { Component } from 'react'
import {
  Alert,
  ListView,
  Linking,
  NativeEventEmitter,
  NativeModules,
  Platform,
  PermissionsAndroid,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  ToastAndroid,
  View,
} from 'react-native'
import BleManager from 'react-native-ble-manager'
import {
  BLE_DEVICE_NAME,
  BLE_WEIGHT_CHARACTERISTIC_UUID,
  BLE_WEIGHT_SERVICE_UUID,
  BLE_SCAN_DURATION,
} from '../libs/const'
import { calculateWeight } from '../libs/func'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

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

class BLEHelper extends Component {
  constructor() {
    super()

    // TODO: move state to redux
    this.state = {
      scanning: false,
      peripherals: new Map(),
      weight: '--.-',
    }

    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(
      this,
    )
    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this)
    this.handleStopScan = this.handleStopScan.bind(this)
    this.handleButtonPress = this.handleButtonPress.bind(this)
  }

  componentDidMount() {
    BleManager.start({ showAlert: false })

    this.handlerDiscover = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral,
    )
    this.handlerStop = bleManagerEmitter.addListener(
      'BleManagerStopScan',
      this.handleStopScan,
    )
    this.handlerUpdate = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      this.handleUpdateValueForCharacteristic,
    )
  }

  getBluetoothState() {
    return new Promise(resolve => {
      const listener = bleManagerEmitter.addListener(
        'BleManagerDidUpdateState',
        ({ state }) => {
          listener.remove()
          resolve(state)
        },
      )
      BleManager.checkState()
    })
  }

  async requestPermission() {
    // For Android SDK 26+, you need to ask user for permission to use Bluetooth
    console.log('---Requesting Permission for Android---')
    const request = Platform.select({
      ios: async () => {},
      android: async () => {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        )
        console.log(granted)
        if (
          granted !== true &&
          granted !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          throw new Error('Not enough permissions')
        }
      },
    })
    await request()
  }

  async handleButtonPress() {
    // For Android, check if Permission is granted
    if (Platform.OS === 'android') {
      console.log('---Checking Permission for Android Devices---')
      const permission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      )
      console.log(permission)
      if (!permission) {
        try {
          await this.requestPermission()
        } catch (e) {
          console.log(e.message)
          ToastAndroid.show(
            'Bluetooth is required for scan',
            ToastAndroid.SHORT,
          )
          return
        }
      }
    }

    // Check Bluetooth State
    console.log('---Checking Bluetooth State---')
    this.getBluetoothState().then(result => {
      // if BT is off, ask user to turn BT on
      if (result === 'off') {
        Platform.select({
          ios: this.invokeBluetoothIos(),
          android: this.invokeBluetoothAndroid(),
        })
      } else {
        // if BT is on, start scanning for devices
        this.startScan()
      }
    })
  }

  invokeBluetoothIos() {
    if (Platform.OS !== 'ios') {
      return
    }
    Alert.alert(
      'Bluetooth Settings',
      'You must turn on bluetooth in order to pair device.',
      [
        { text: 'Cancel' },
        {
          text: 'Open Settings',
          onPress: async () => {
            await Linking.openURL('App-Prefs:root=Bluetooth')
          },
        },
      ],
    )
  }

  invokeBluetoothAndroid() {
    if (Platform.OS !== 'android') {
      return
    }
    BleManager.enableBluetooth()
      .then(() => {
        // Tell user that Bluetooth is on
        ToastAndroid.show(
          'Bluetooth is turned ON. Press Scan again!',
          ToastAndroid.SHORT,
        )
      })
      .catch(() => {
        ToastAndroid.show('Please turn Bluetooth ON', ToastAndroid.SHORT)
      })
  }

  startScan() {
    const { scanning } = this.state
    // if Device is not scanning, start scanning
    if (!scanning) {
      this.setState({ peripherals: new Map() })
      BleManager.scan([BLE_WEIGHT_SERVICE_UUID], BLE_SCAN_DURATION, false).then(
        () => {
          console.log('Scanning...')
          this.setState({ scanning: true })
        },
      )
      return
    }
    BleManager.stopScan().then(() => {
      this.setState({ scanning: false })
    })
  }

  handleDiscoverPeripheral(peripheral) {
    const { peripherals } = this.state
    const nameRegExp = new RegExp(`^${BLE_DEVICE_NAME}`)
    if (peripheral.name && peripheral.name.match(nameRegExp)) {
      console.log(peripheral)
      peripherals.set(peripheral.id, peripheral)
      this.setState({ peripherals })
    }
  }

  handleUpdateValueForCharacteristic(data) {
    const weight = calculateWeight(data.value)
    console.log(
      `Received data from ${data.peripheral} characteristic ${
        data.characteristic
      }`,
      weight,
    )
    this.setState({ weight })
  }

  connect(id) {
    BleManager.connect(id)
      .then(() => {
        console.log('connected, retrieving service...')
        return BleManager.retrieveServices(id)
      })
      .then(result => {
        console.log('service retrieved, starting action...')
        console.log(result)
        return BleManager.startNotification(
          id,
          BLE_WEIGHT_SERVICE_UUID,
          BLE_WEIGHT_CHARACTERISTIC_UUID,
        )
      })
      .then(() => {
        // Success code
        console.log('Notification Started')
      })
      .catch(error => {
        // Failure code
        console.log(error)
      })
  }

  handleStopScan() {
    console.log('Scan is stopped')
    this.setState({ scanning: false })
  }

  render() {
    const { scanning, weight, peripherals } = this.state
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

export default BLEHelper
