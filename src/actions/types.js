const actionTypes = ['BLE_START_SCANNING', 'BLE_STOP_SCANNING']

function buildActionTypes(kinds) {
  const result = {}
  kinds.forEach(type => {
    result[type] = type
  })
  return result
}

export default buildActionTypes(actionTypes)
