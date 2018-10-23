import { Platform } from 'react-native'
import {
  initBleManager,
  invokeBleIos,
  invokeBleAndroid,
  checkAndRequestPermission,
  discoverPeripheral,
  checkBleState,
} from '../libs/bleModules'
import actionTypes from '../actions/types'

const {
  BLE_INIT_MANAGER,
  BLE_CHECK_PERMISSION,
  BLE_SCAN,
  BLE_SCAN_START,
  BLE_SCAN_STOP,
  BLE_ENABLE_DEVICE_BLE,
  BLE_SET_STATE,
  BLE_CHECK_STATE,
} = actionTypes

const bleMiddleware = store => next => async action => {
  const result = next(action)
  const dispatch = store.dispatch.bind(store)

  switch (action.type) {
    case BLE_INIT_MANAGER:
      console.log('---Initializing Ble Manager---')
      initBleManager()
      break
    case BLE_CHECK_PERMISSION:
      console.log('---Checking Bluetooth Permission---')
      await checkAndRequestPermission()
      break
    case BLE_SCAN:
      // TODO: Check if device is already scanning

      // Start Scanning, initialize peripheral list
      console.log('---Initializing Ble Scan---')
      dispatch({ type: BLE_SCAN_START })

      // Scan for peripheral with given name
      await discoverPeripheral(action.payload).catch(e => {
        if (e.message === 'Discover Peripheral Timeout') {
          dispatch({ type: BLE_SCAN_STOP })
        }
      })

      dispatch({ type: BLE_SCAN_STOP })
      break
    case BLE_CHECK_STATE:
      console.log('---Checking Bluetooth State---')
      try {
        const bleState = await checkBleState()
        dispatch({ type: BLE_SET_STATE, payload: bleState })
      } catch (e) {
        console.error(e)
      }
      break
    case BLE_ENABLE_DEVICE_BLE:
      console.log('---Enabling Bluetooth---')
      try {
        await Platform.select({
          ios: invokeBleIos(),
          android: invokeBleAndroid(),
        })
      } catch (e) {
        if (e === 'No bluetooth support') {
          // TODO: Notify user that device does not support bluetooth
          console.warn('No bluetooth support')
          break
        }
        console.error(`BLE_ENABLE_DEVICE_BLE: ${e}`)
      }
      break
    default:
      break
  }
  return result
}

export default bleMiddleware
