import React, { useState } from 'react';

import { View, StyleSheet, Alert, Modal, Text } from 'react-native';
import {
  mediaDevices,
  MediaStream,
  MediaStreamTrack,
  RTCView,
} from 'react-native-webrtc';
import {} from 'react-native-udp';
import MyButton from './MyButton';
import GenerateIpQRCode from './QRCode';
import {
  Camera,
  CameraRuntimeError,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';

export default function App() {
  const [showScanner, setShowScanner] = React.useState<
    null | 'media' | 'screen' | 'preview'
  >(null);
  const [previewStream, setPreviewStream] = React.useState<MediaStream>();
  const [codeScanned, setCodeScanned] = useState('');

  const device = useCameraDevice('back');
  const camera = React.useRef<Camera>(null);
  const screenShareRequested = React.useRef(false);

  function handleScanQrCode(type: 'media' | 'screen' | 'preview') {
    console.log(`[info] Running handleScanQrCode()`);
    setShowScanner(type);
  }

  async function handleStartScreenShare() {
    console.log('handleStartScreenCapture');
    const stream = await mediaDevices.getDisplayMedia();
    setPreviewStream(stream);
    screenShareRequested.current = false;
  }

  async function handleStartMediaSharing() {}

  if (device == null) {
    Alert.alert('Error!', 'Camera could not be started');
  }

  const onError = (error: CameraRuntimeError) => {
    Alert.alert('Error!', error.message);
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0) {
        if (codes[0].value) {
          setTimeout(async () => {
            if (screenShareRequested.current) return;
            const data = codes[0]?.value?.toString();
            if (data && data.startsWith('http://')) {
              screenShareRequested.current = true;
              setCodeScanned(data);
              setShowScanner('preview');
              switch (showScanner) {
                case 'media':
                  await handleStartMediaSharing();
                  break;
                case 'screen':
                  await handleStartScreenShare();
                  break;
              }
            }
          }, 500);
        }
      }
      return;
    },
  });

  return (
    <View style={appStyleSheet.containerStyle}>
      {showScanner == null ? (
        <GenerateIpQRCode />
      ) : showScanner == 'preview' ? (
        <View
          style={{
            width: 240,
            height: 420,
            borderWidth: 1,
            borderColor: '#363636ff',
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          {previewStream && (
            <RTCView
              objectFit="cover"
              style={{
                flex: 1,
              }}
              streamURL={previewStream?.toURL()}
            />
          )}
        </View>
      ) : (
        <Modal presentationStyle="fullScreen" animationType="slide">
          {device && (
            <Camera
              isActive={true}
              ref={camera}
              onError={onError}
              photo={false}
              style={{
                flex: 1,
              }}
              device={device}
              codeScanner={codeScanner}
            />
          )}
        </Modal>
      )}
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
