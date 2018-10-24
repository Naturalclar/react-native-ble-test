// __tests__/BLEHelper.test.js
import 'react-native'
import React from 'react'
import { shallow } from 'enzyme'
import toJson from 'enzyme-to-json'
import configureStore from 'redux-mock-store'
import { BLEHelper } from '../src/components'
import { initialState } from '../src/reducers/bleReducer'

const createMockStore = configureStore()

const store = createMockStore({ble:initialState})

it('renders correctly', () => {
  const wrapper = shallow(<BLEHelper store={store}/>);
  const component = wrapper.dive();
  expect(toJson(component)).toMatchSnapshot();
});