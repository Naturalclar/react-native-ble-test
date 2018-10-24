// __tests__/App.test.js
import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import App from '../src/app';

it('renders correctly', () => {
  const wrapper = shallow(<App />);
  const component = wrapper.dive();
  expect(toJson(component)).toMatchSnapshot();
});