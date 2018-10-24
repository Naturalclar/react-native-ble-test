// @flow
import actionTypes from '../actions/types'

const {
  BLE_INIT_MANAGER,
  BLE_SCAN_START,
  BLE_SCAN_STOP,
  BLE_SET_PERIPHERALS,
  BLE_SET_WEIGHT,
  BLE_SET_STATE,
} = actionTypes

type BleState = {
  started: boolean,
  scanning: boolean,
  peripherals: Map,
  paired: Map,
  weight: string,
  on: boolean,
}

export const initialState: BleState = {
  started: false,
  scanning: false,
  peripherals: new Map(),
  paired: new Map(),
  weight: '--.-',
  on: false,
}

const bleReducer = (state: BleState = initialState, action) => {
  switch (action.type) {
    case BLE_INIT_MANAGER:
      return {
        ...state,
        started: true,
      }
    case BLE_SCAN_START:
      return {
        ...state,
        scanning: true,
        peripherals: new Map(),
      }
    case BLE_SCAN_STOP:
      return {
        ...state,
        scanning: false,
      }
    case BLE_SET_WEIGHT:
      return {
        ...state,
        weight: action.payload,
      }
    case BLE_SET_PERIPHERALS:
      return {
        ...state,
        peripherals: action.payload,
      }
    case BLE_SET_STATE:
      return {
        ...state,
        on: action.payload,
      }
    default:
      return state
  }
}

export default bleReducer
