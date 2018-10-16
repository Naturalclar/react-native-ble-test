import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          React-Native BLE Test
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            Connect
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  button: {
    borderRadius: 5,
    backgroundColor: '#54a2ff',
    padding: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
