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

## Mazor Dependencies
- `react-native-webrtc`
- `react-native-udp`
- `react-native-qrcode-svg`
- `react-native-vision-camera`

## App Flow (Simplified)

### App Initialization
- App start  
  → `handleStartUdpServer()`  
  → create UDP socket and bind to port **5645**  
  → listen for incoming messages (`offer`, `answer`, `candidate`)  
  → display local **IP:PORT** as a QR code  

---

### Starting a Session
- User presses **“Start Sharing Media”** or **“Start Sharing Screen”**  
  → `handleScanQrCode(type)`  
  → show QR scanner  

---

### QR Code Scanned
- `handleOnCodeScan(code)`  
  → save `destAddr = scanned IP:PORT`  
  → call `handleStartMediaSharing()` **or** `handleStartScreenShare()`  

---

### Start Media or Screen Sharing
- `handleStartMediaSharing()` / `handleStartScreenShare()`  
  → capture local stream using `getUserMedia()` / `getDisplayMedia()`  
  → call `handleWebRTCConnection(stream)`  

---

### Creating WebRTC Offer (Sender)
- `handleWebRTCConnection(stream)`  
  → create `RTCPeerConnection(peerConstraints)`  
  → add local tracks to connection  
  → `registerPeerConnectionListener()` for event logs  
  → `createOffer()` → `setLocalDescription()`  
  → send **offer** via UDP to `destAddr`  

---

### Receiving Offer (Receiver)
- UDP socket receives offer  
  → `handleOnOffer(offer, host, port)`  
  → create `RTCPeerConnection(peerConstraints)`  
  → `registerPeerConnectionListener()`  
  → `setRemoteDescription(offer)`  
  → `createAnswer()` → `setLocalDescription()`  
  → send **answer** via UDP back to sender  

---

### Receiving Answer (Sender)
- UDP socket receives answer  
  → `handleOnAnswer(answer)`  
  → `setRemoteDescription(answer)`  

---

### ICE Candidate Exchange
- Both sides:  
  → `onicecandidate` event fires  
  → `handleSendMessage({ type: 'candidate' })` via UDP  
  → `handleOnCandidate(candidate)` → `addIceCandidate()`  

---

### Connection Established
- ICE gathering completes  
  → Peer connection established  
  → Remote stream received  
  → `setPreviewStream(stream)`  
  → display in `<RTCView>` with remote video preview  

---