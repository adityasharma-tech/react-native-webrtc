# Full WebRTC Demo for React Native

This example shows how to use `react-native-webrtc` for a complete peer-to-peer
connection demo with QR-based signaling over UDP.

## Features
- Camera + screen sharing
- ICE candidate exchange
- Peer connection event logging
- UDP signaling with QR connection setup

## Usage
1. Run on two devices.
2. One device displays its QR (IP:port).
3. The other scans it and starts sharing.

## Dependencies
- `react-native-webrtc`
- `react-native-udp`
- `react-native-qrcode-svg`
- `react-native-camera` or `expo-barcode-scanner`
