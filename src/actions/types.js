const actionTypes = [
  // Actions for BLE
  'BLE_SCAN',
  'BLE_SCAN_START',
  'BLE_SCAN_STOP',
  'BLE_SET_WEIGHT',
  'BLE_SET_PERIPHERALS',
  'BLE_INIT_MANAGER',
  'BLE_ENABLE_DEVICE_BLE',
  'BLE_CHECK_STATE',
  'BLE_REQUEST_PERMISSION',
  'BLE_CHECK_PERMISSION',
  'BLE_SET_STATE',
]

function buildActionTypes(kinds) {
  const result = {}
  kinds.forEach(type => {
    result[type] = type
  })
  return result
}

export default buildActionTypes(actionTypes)
