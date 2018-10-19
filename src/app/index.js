import React from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist'
import { BLEHelper } from '../components'
import { store, persistor } from './store'

const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BLEHelper />
    </PersistGate>
  </Provider>
)

export default App
