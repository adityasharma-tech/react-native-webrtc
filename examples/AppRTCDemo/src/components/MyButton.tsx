import React from 'react';
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

interface MyButtonProps {
  children: string;
  buttonStyle?: ViewStyle;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
}

export default function MyButton({
  children,
  buttonStyle,
  onPress,
}: MyButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[myButtonStylesheet.pressableStyle, buttonStyle]}
      activeOpacity={0.8}
    >
      <Text style={myButtonStylesheet.textStyle}>{children}</Text>
    </TouchableOpacity>
  );
}

const myButtonStylesheet = StyleSheet.create({
  textStyle: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pressableStyle: {
    paddingVertical: 15,
    backgroundColor: '#1a1a1aff',
    borderRadius: 14,
    paddingHorizontal: 50,
    fontWeight: '400',
  },
});
