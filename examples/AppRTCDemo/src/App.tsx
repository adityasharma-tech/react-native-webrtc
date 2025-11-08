import React, { useState } from 'react';

import { View, StyleSheet } from 'react-native';
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
} from 'react-native-webrtc';
import dgram from 'react-native-udp';

import MyButton from './components/MyButton';
import CodeScanner from './components/CodeScanner';
import GenerateIpQRCode from './components/QRCode';
import { Socket } from 'node:dgram';
import UdpSocket from 'react-native-udp/lib/types/UdpSocket';

type MessageT<T> = {
  type: 'offer' | 'answer' | 'candidate';
  data: T;
};

let peerConstraints = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
};

export default function App() {
  const [showScanner, setShowScanner] = React.useState<
    null | 'media' | 'screen' | 'preview'
  >(null);
  const [previewStream, setPreviewStream] = React.useState<MediaStream>();

  //...
  const pC = React.useRef<RTCPeerConnection>(null);
  const destAddr = React.useRef('');
  const udpSocket = React.useRef<Socket>(null);
  const candidateQueue = React.useRef<any[]>([]);

  // registering events to log webrtc event logs
  function registerPeerConnectionListener(peerConnection: RTCPeerConnection) {
    (peerConnection as any).addEventListener(
      'connectionstatechange',
      (event: any) => {
        console.log('connectionstatechange', event);
      },
    );
    (peerConnection as any).addEventListener('icecandidate', (event: any) => {
      console.log('icecandidate', event);
    });
    (peerConnection as any).addEventListener(
      'icecandidateerror',
      (event: any) => {
        console.log('icecandidateerror', event);
      },
    );
    (peerConnection as any).addEventListener(
      'iceconnectionstatechange',
      (event: any) => {
        console.log('iceconnectionstatechange', event);
      },
    );
    (peerConnection as any).addEventListener(
      'icegatheringstatechange',
      (event: any) => {
        console.log('icegatheringstatechange', event);
      },
    );
    (peerConnection as any).addEventListener(
      'negotiationneeded',
      (event: any) => {
        console.log('negotiationneeded', event);
      },
    );
    (peerConnection as any).addEventListener(
      'signalingstatechange',
      (event: any) => {
        console.log('signalingstatechange', event);
      },
    );
  }

  async function handleSendMessage(
    message: MessageT<any>,
    host: string,
    port: number,
    socket?: Socket,
  ) {
    console.log(
      `sendingMessage: ${message.type} host ${host} port ${port} ${socket}`,
    );
    return new Promise((resolve, reject) => {
      if (!socket) return reject('failed to get socket');
      const msg = JSON.stringify(message);
      (socket as any as UdpSocket).send(
        msg,
        0,
        msg.length,
        port,
        host,
        error => {
          if (error) reject(error.message);
          resolve(void 0);
        },
      );
    });
  }

  async function handleOnOffer(offer: any, host: string, port: number) {
    const peerConnection = new RTCPeerConnection(peerConstraints);
    pC.current = peerConnection;

    registerPeerConnectionListener(peerConnection);

    (peerConnection as any).addEventListener('track', (event: any) => {
      const [stream] = event.streams;
      console.log('ontrack: ', event);
      setShowScanner('preview');
      setPreviewStream(stream);
    });

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    (peerConnection as any).onicecandidate = async (event: any) => {
      if (event.candidate)
        await handleSendMessage(
          {
            type: 'candidate',
            data: event.candidate,
          },
          host,
          port,
          udpSocket.current!,
        );
    };

    for (const candidate of candidateQueue.current) {
      console.log('Adding queued candidate:', candidate);
      await peerConnection.addIceCandidate(candidate);
    }
    candidateQueue.current = [];
    await handleSendMessage(
      {
        type: 'answer',
        data: answer,
      },
      host,
      port,
      udpSocket.current!,
    );
  }

  async function handleOnAnswer(answer: any) {
    if (!pC.current) {
      console.log('pC is not ready for answer: ', pC.current);
      return;
    }
    await pC.current.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async function handleOnCandidate(candidate: any) {
    if (!pC.current) {
      console.log('pC is not ready for candidate: ', pC.current);
      candidateQueue.current.push(candidate);
      return;
    }
    console.log(`Adding ICE Cadidate: `, candidate);
    await pC.current.addIceCandidate(new RTCIceCandidate(candidate));
  }

  async function handleStartUdpServer() {
    const socket = dgram.createSocket({
      type: 'udp4',
      debug: true,
    }) as any as Socket;
    socket.bind(5645);
    socket.on('message', async (msg, rinfo) => {
      const result = JSON.parse(msg.toString()) as MessageT<any>;
      console.log('data received: ', result.data);
      switch (result.type) {
        case 'offer':
          await handleOnOffer(result.data, rinfo.address, rinfo.port);
          break;
        case 'answer':
          await handleOnAnswer(result.data);
          break;
        case 'candidate':
          await handleOnCandidate(result.data);
          break;
      }
    });
    socket.on('listening', () => {
      console.log(`socket started listening...`);
    });
    udpSocket.current = socket;
  }

  function handleScanQrCode(type: 'media' | 'screen' | 'preview') {
    console.log(`[info] Running handleScanQrCode()`);
    setShowScanner(type);
  }

<<<<<<< HEAD
  async function handleWebRTCConnection(stream: MediaStream) {
    let peerConnection = new RTCPeerConnection(peerConstraints);
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

    registerPeerConnectionListener(peerConnection);

    (peerConnection as any).ontrack = (e: any) => {
      const [stream] = e.streams;
      console.log('ontrack: ', e);
      setShowScanner('preview');
      setPreviewStream(stream);
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    await handleSendMessage(
      {
        type: 'offer',
        data: offer,
      },
      destAddr.current.split(':')[0],
      +destAddr.current.split(':')[1],
      udpSocket.current!,
    );
    pC.current = peerConnection;

    (peerConnection as any).onicecandidate = async (event: any) => {
      if (event.candidate)
        await handleSendMessage(
          {
            type: 'candidate',
            data: event.candidate,
          },
          destAddr.current.split(':')[0],
          +destAddr.current.split(':')[1],
          udpSocket.current!,
        );
    };
    return peerConnection;
  }

  async function handleStartScreenShare() {
    console.log('handleStartScreenCapture: ', destAddr.current);
    const stream = await mediaDevices.getDisplayMedia();
    setPreviewStream(stream);
    await handleWebRTCConnection(stream);
  }

  async function handleStartMediaSharing() {
    console.log('handleStartMediaSharing: ', destAddr.current);
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setPreviewStream(stream);
    await handleWebRTCConnection(stream);
  }

  async function handleOnCodeScan(code: string) {
    setShowScanner('preview');
    destAddr.current = code;
    console.log('Addr', code);
    switch (showScanner) {
      case 'media':
        await handleStartMediaSharing();
        break;
      case 'screen':
        await handleStartScreenShare();
        break;
    }
  }

  React.useEffect(() => {
    handleStartUdpServer();
  }, []);

  return (
    <View style={appStyleSheet.containerStyle}>
      {showScanner == null ? (
        <GenerateIpQRCode />
      ) : showScanner == 'preview' ? (
        <View style={appStyleSheet.previewContainerStyle}>
          {previewStream && (
            <RTCView
              objectFit="cover"
              style={appStyleSheet.rtcViewStyle}
              streamURL={previewStream?.toURL()}
            />
          )}
        </View>
      ) : (
        <CodeScanner onCodeScanned={handleOnCodeScan} />
      )}
=======
  async function handleStartScreenShare() {}

  async function handleStartMediaSharing() {}

  return (
    <View style={appStyleSheet.containerStyle}>
      {showScanner == null ? <GenerateIpQRCode /> : <View>
        
        </View>}
>>>>>>> de7196c4516a85c62f640d504a43b939f9b6d6c6
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
<<<<<<< HEAD
  previewContainerStyle: {
    width: 240,
    height: 420,
    borderWidth: 1,
    borderColor: '#363636ff',
    borderRadius: 20,
    overflow: 'hidden',
  },
=======
>>>>>>> de7196c4516a85c62f640d504a43b939f9b6d6c6
  screenShareBtnStyle: {
    marginVertical: 20,
    backgroundColor: '#FFDF20',
  },
  shareMediaBtnStyle: {
    marginVertical: 20,
    backgroundColor: '#BBF451',
  },
<<<<<<< HEAD
  rtcViewStyle: {
    flex: 1,
  },
=======
>>>>>>> de7196c4516a85c62f640d504a43b939f9b6d6c6
});
