import actionTypes from './types'

export const initBleManager = () => ({
  type: actionTypes.BLE_INIT_MANAGER,
})

export const setWeight = weight => ({
  type: actionTypes.BLE_SET_WEIGHT,
  payload: weight,
})

export const setPeripherals = peripherals => ({
  type: actionTypes.BLE_SET_PERIPHERALS,
  payload: peripherals,
})

export const checkBleState = () => ({
  type: actionTypes.BLE_CHECK_STATE,
})

export const enableDeviceBle = () => ({
  type: actionTypes.BLE_ENABLE_DEVICE_BLE,
})

export const checkAndRequestPermission = () => ({
  type: actionTypes.BLE_CHECK_PERMISSION,
})

export const scan = nameRegExp => ({
  type: actionTypes.BLE_SCAN,
  payload: nameRegExp,
})
