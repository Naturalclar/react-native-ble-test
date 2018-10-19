import actionTypes from '../actions/types'

const initialState = {
  scanning: false,
  peripherals: new Map(),
  weight: '--.-',
}

const bleReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.BLE_START_SCANNING:
      return {
        ...state,
        scanning: true,
      }
    case actionTypes.BLE_STOP_SCANNING:
      return {
        ...state,
        scanning: false,
      }
    default:
      return state
  }
}

export default bleReducer
