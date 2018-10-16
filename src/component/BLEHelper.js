import React, { Component } from 'react';
import {
  ListView,
  NativeEventEmitter,
  NativeModules,
  Platform,
  PermissionsAndroid,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { 
  BLE_DEVICE_NAME,
  BLE_WEIGHT_CHARACTERISTIC_UUID,
  BLE_WEIGHT_SERVICE_UUID
} from '../libs/const'

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class BLEHelper extends Component {
  constructor() {
    super();

    this.state = {
      scanning: false,
      devices: new Map(),
      appState: '',
    }

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
  }
  componentDidMount() {
    BleManager.start({showAlert: false});

    this.handlerDiscover = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral
      );
    this.handlerStop = bleManagerEmitter.addListener(
      'BleManagerStopScan',
      this.handleStopScan
      );
  }

  startScan() {
    if (!this.state.scanning) {
      this.setState({devices: new Map()});
      BleManager.scan([], 20, true)
        .then(() => {
          console.log('Scanning...');
          this.setState({scanning: true});
        })
    }
  }

  handleDiscoverPeripheral(data) {
    let devices = this.state.devices;
    const nameRegExp = new RegExp(`^${BLE_DEVICE_NAME}`);
    if (data.name && data.name.match(nameRegExp)) {
      console.log(data);
      BleManager.connect(data.id)
        .then(() => {
          return BleManager.retrieveServices(data.id)
        })
        .then((result) => {
          console.log(result);
          devices.set(data.id, data);
          this.setState({devices})
          return BleManager.startNotification(data.id, BLE_WEIGHT_SERVICE_UUID, BLE_WEIGHT_CHARACTERISTIC_UUID)
          // Success code
          console.log('Notification started');
        })
        .then((result) => {
          console.log('Notify Started');
        })
        .catch((error) => {
          // Failure code
          console.log(error);
        });
    }
  }

  handleStopScan() {
    console.log('Scan is stopped');
    this.setState({ scanning: false});
  }

  render() {
    const list = Array.from(this.state.devices.values());
    const dataSource = ds.cloneWithRows(list);

    return (
      <View style={styles.container}>
        <TouchableHighlight
          style = {styles.button}
          onPress = {()=> {this.startScan()}}
        >
          <Text style = {styles.buttonText}>
            Scan
          </Text>
        </TouchableHighlight>
        <Text style = {styles.center}>
            Scan is currently {this.state.scanning? '':'not '}running.
        </Text>
        <ScrollView style={styles.scroll}>
          {(list.length == 0) &&
            <View style={styles.noPeripheral}>
              <Text style={styles.center}>
                No peripherals
              </Text>            
            </View>
          }
          <ListView
            enableEmptySections={true}
            dataSource={dataSource}
            renderRow={(item) => {
              const color = item.connected ? 'green' : '#fff';
              return (
                <TouchableHighlight>
                  <View style={[styles.row, {backgroundColor: color}]}>
                    <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{item.name}</Text>
                    <Text style={{fontSize: 8, textAlign: 'center', color: '#333333', padding: 10}}>{item.id}</Text>
                  </View>
                </TouchableHighlight>
              )
            }}/>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    width: window.width,
    height: window.height
  },
  center: {
    textAlign: 'center',
  },
  button: {
    marginTop: 40,
    backgroundColor: '#54a2ff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  noPeripheral: {
    flex: 1,
    justifyContent: 'center',
  }
})

export default BLEHelper;
