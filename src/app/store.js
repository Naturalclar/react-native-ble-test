import { createStore, applyMiddleware } from 'redux'
import { persistStore } from 'redux-persist'
import thunk from 'redux-thunk'
import logger from 'redux-logger' // eslint-disable-line import/no-extraneous-dependencies
import storage from 'redux-persist/lib/storage' // = Asyncstorage for react-native
import reducer from '../reducers'
import { bleMiddleware } from '../middleware'

export const store = createStore(
  reducer,
  applyMiddleware(logger, thunk, bleMiddleware),
)
export const persistor = persistStore(store)
