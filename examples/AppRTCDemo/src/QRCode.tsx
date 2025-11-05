import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { NetworkInfo } from 'react-native-network-info';
import QRCode from 'react-native-qrcode-svg';

export default function GenerateIpQRCode() {
  const [myIpv4Addr, setMyIpv4Addr] = React.useState<string | null>(null);

  React.useEffect(() => {
    generateQRfromIpV4();
  }, [NetworkInfo]);

  async function generateQRfromIpV4() {
    NetworkInfo.getIPV4Address().then(ipv4Address => {
      if (!ipv4Address)
        return console.error('[error]: failed to get ipv4 address.');
      setMyIpv4Addr(ipv4Address);
    });
  }
  return (
    <View>
      <View>
        {myIpv4Addr && (
          <QRCode
            size={250}
            color="black"
            backgroundColor="white"
            value={myIpv4Addr}
          />
        )}
      </View>
      <Text style={qrCodeStylesheet.ipAddrTextStyle}>
        {myIpv4Addr && myIpv4Addr}
      </Text>
    </View>
  );
}

const qrCodeStylesheet = StyleSheet.create({
  ipAddrTextStyle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center'
  },
});
