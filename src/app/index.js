import React from 'react'
import { Provider } from 'react-redux'
import { BLEHelper } from '../components'
import { store } from './store'

const App = () => (
  <Provider store={store}>
    <BLEHelper />
  </Provider>
)

export default App
