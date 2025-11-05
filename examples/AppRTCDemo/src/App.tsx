import React from 'react';

import { View, StyleSheet } from 'react-native';
import {} from 'react-native-webrtc';
import {} from 'react-native-udp';
import MyButton from './MyButton';
import GenerateIpQRCode from './QRCode';

export default function App() {
  const [showScanner, setShowScanner] = React.useState<
    null | 'media' | 'screen'
  >(null);

  async function handleScanQrCode(type: 'media' | 'screen') {
    console.log(`[info] Running handleScanQrCode()`);
    setShowScanner(type);
  }

  async function handleStartScreenShare() {}

  async function handleStartMediaSharing() {}

  return (
    <View style={appStyleSheet.containerStyle}>
      {showScanner == null ? <GenerateIpQRCode /> : <View>
        
        </View>}
      <MyButton
        onPress={() => handleScanQrCode('screen')}
        buttonStyle={appStyleSheet.screenShareBtnStyle}
      >
        Start Sharing Screen
      </MyButton>
      <MyButton
        onPress={() => handleScanQrCode('media')}
        buttonStyle={appStyleSheet.shareMediaBtnStyle}
      >
        Start Sharing Media
      </MyButton>
    </View>
  );
}

const appStyleSheet = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'black',
    height: '100%',
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenShareBtnStyle: {
    marginVertical: 20,
    backgroundColor: '#FFDF20',
  },
  shareMediaBtnStyle: {
    marginVertical: 20,
    backgroundColor: '#BBF451',
  },
});
