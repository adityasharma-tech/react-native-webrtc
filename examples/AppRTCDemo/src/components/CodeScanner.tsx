import { View, Text, Modal, Alert } from 'react-native';
import React from 'react';
import {
  Camera,
  CameraRuntimeError,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';

interface CodeScannerProps {
  onCodeScanned: (code: string) => void;
}

export default function CodeScanner({ onCodeScanned }: CodeScannerProps) {
  const device = useCameraDevice('back');
  const camera = React.useRef<Camera>(null);
  const screenShareRequested = React.useRef(false);

  if (device == null) {
    Alert.alert('Error!', 'Camera could not be started');
  }

  const onError = (error: CameraRuntimeError) => {
    Alert.alert('Error!', error.message);
  };

  function whenCodeScanned(code: string){
    onCodeScanned(code.replace('http://', ''));
    setTimeout(()=>screenShareRequested.current = false, 1000);
  }

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: async codes => {
      new Promise<void>(resolve => {
        if (codes.length > 0) {
          if (codes[0].value) {
            setTimeout(async () => {
              if (screenShareRequested.current) return;
              const data = codes[0]?.value?.toString();
              if (data && data.startsWith('http://')) {
                whenCodeScanned(data);
                screenShareRequested.current = true;
              }
              resolve();
            }, 500);
          }
        }
      })
      return;
    },
  });

  return (
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
  );
}
