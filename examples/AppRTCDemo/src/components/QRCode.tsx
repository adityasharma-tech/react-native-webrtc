import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { NetworkInfo } from 'react-native-network-info';
import QRCode from 'react-native-qrcode-styled';

export default function GenerateIpQRCode() {
  const [myIpv4Addr, setMyIpv4Addr] = React.useState<string | null>(null);

  React.useEffect(() => {
    generateQRfromIpV4();
  }, [NetworkInfo]);

  async function generateQRfromIpV4() {
    NetworkInfo.getIPV4Address().then(ipv4Address => {
      if (!ipv4Address)
        return console.error('[error]: failed to get ipv4 address.');
      setMyIpv4Addr('http://'+ipv4Address+':5645');
    });
  }
  return (
    <View>
      <View>
        {myIpv4Addr && (
          <QRCode
            color="white"
            size={250}
            pieceLiquidRadius={5}
            pieceBorderRadius={2}
            style={{ backgroundColor: 'black' }}
            data={myIpv4Addr}
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
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center'
  },
});
