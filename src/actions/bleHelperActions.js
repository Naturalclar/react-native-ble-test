/* eslint-disable import/prefer-default-export */
import {
  checkAndRequestPermission,
  enableDeviceBle,
  checkBleState,
  scan,
} from './bleActions'

import { BLE_NAME_FILTER } from '../libs/values'
import { calculateWeight } from '../libs/func'

export const bleHelperButtonAction = () => async (dispatch, getState) => {
  try {
    // For Android, check if Permission is granted
    await dispatch(checkAndRequestPermission())

    // Check BT state, it also sets the current BT state to redux
    await dispatch(checkBleState())
    // If Bluetooth is OFF, prompt user to turn Bluetooth On
    if (!getState().ble.on) {
      await dispatch(enableDeviceBle())
      await dispatch(checkBleState())
    }

    // Start Scanning
    await dispatch(scan(BLE_NAME_FILTER))
  } catch (e) {
    console.log(`bleHelperButtonAction: ${e}`)
    throw e
  }
}
