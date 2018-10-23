import BleManager from 'react-native-ble-manager'
import {
  Platform,
  NativeModules,
  NativeEventEmitter,
  Alert,
  Linking,
  ToastAndroid,
  PermissionsAndroid,
} from 'react-native'

import { BLE_SCAN_DURATION } from './values'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

/**
 * Initialize BleManager (Run once only)
 */
export const initBleManager = () => {
  // @TODO: check if BleManager has already started, so it won't run the second time
  console.log('---Running Ble Manager Start---')
  BleManager.start({ showAlert: false })
}

/**
 * (Android Only) Request user for Coarse Location Access
 */
export const requestPermissionAndroid = async () => {
  // For Android SDK 26+, you need to ask user for permission to use Bluetooth
  console.log('---Requesting Permission for Android---')
  const request = Platform.select({
    ios: async () => {},
    android: async () => {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      )
      if (granted !== true && granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error('Not enough permissions')
      }
    },
  })
  await request()
}

/**
 * (Android Only) Check if Coarse Location Access is granted by the user
 * If permission is not granted, ask user for permission
 */
export const checkAndRequestPermission = async () => {
  // Permission is only required for android devices
  if (Platform.OS !== 'android') {
    return true
  }

  const permission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  )
  if (!permission) {
    try {
      await requestPermissionAndroid()
    } catch (e) {
      if (e.message === 'Not enough permissions') {
        ToastAndroid.show('Bluetooth is required for scan', ToastAndroid.SHORT)
      } else {
        // TODO: Handle error properly
        throw e
      }
      return false
    }
  }
  return true
}

/**
 * checkBleState: Promise<Boolean>
 * Check is BT is on or off
 * Resolves with true or false
 */
export const checkBleState = () =>
  new Promise(resolve => {
    const listener = bleManagerEmitter.addListener(
      'BleManagerDidUpdateState',
      ({ state }) => {
        listener.remove()
        console.log(`---Bluetooth is ${state}---`)
        resolve(state === 'on')
      },
    )
    BleManager.checkState()
  })

/**
 * (iOS only) Ask user to open Settings app to turn on Bluetooth
 */
export const invokeBleIos = () => {
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

/**
 * (Android only) Ask user for permission to turn Bluetooth On
 */
export const invokeBleAndroid = async () => {
  if (Platform.OS !== 'android') {
    return
  }
  try {
    await BleManager.enableBluetooth()
    ToastAndroid.show(
      'Bluetooth is turned ON. Press Scan again!',
      ToastAndroid.SHORT,
    )
  } catch (e) {
    // @TODO: check if the error is bluetooth not being ON
    console.log(e.message)
    if (e.message === '') {
      ToastAndroid.show('Please turn Bluetooth ON', ToastAndroid.SHORT)
    } else {
      // TODO: Handle Error Propertly
      console.log(e)
      throw e
    }
  }
}

/**
 * Get the first id and name of peripheral that matches condition
 * @param {RegExp} nameRegExp - RegExp to match the name of the device
 */
export const discoverPeripheral = nameRegExp =>
  new Promise((resolve, reject) => {
    // If device is not discovered after a set time, reject with timeout
    const tid = setTimeout(async () => {
      await BleManager.stopScan()
      console.log('---Discover Peripheral Time out---')
      reject(new Error('Discover Peripheral Timeout'))
    }, BLE_SCAN_DURATION * 1000)
    let peripheral = null
    const discoverListener = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      async ({ id, name }) => {
        // Preventing event from running multiple times
        if (peripheral != null) {
          return
        }
        peripheral = { id, name }
        console.log(name)
        if (name.match(nameRegExp)) {
          console.log('---Discovered Peripheral---')
          clearTimeout(tid)
          discoverListener.remove()
          await BleManager.stopScan()
          resolve(peripheral)
        }
      },
    )
  })

/**
 * Watch for change in characteristic data
 * @param {String} peripheralId - PeripheralID of the device
 * @param {String} serviceId - ServiceID of the BT service
 * @param {String} characteristicId - CharacteristicID of the BT characteritics
 */
export const receiveNotifications = (
  peripheralId,
  serviceId,
  characteristicId,
) =>
  new Promise(resolve => {
    const notificationListener = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      ({ value }) => {
        notificationListener.remove()
        resolve(value)
      },
    )
    BleManager.startNotification(peripheralId, serviceId, characteristicId)
  })

/**
 * connect and retrieve service and characteristics
 * @param {String} peripheralId - peripheral id of the device
 * @param {String} serviceId - ServiceID of the BT service
 * @param {String} characteristicId - CharacteristicID of the BT characteritics
 */
export const connect = async (peripheralId, serviceId, characteristicId) => {
  try {
    await BleManager.connect(peripheralId)
    await BleManager.retrieveServices(peripheralId)
    await receiveNotifications(peripheralId, serviceId, characteristicId)
  } catch (e) {
    console.warn(e)
  }
}
