import { Alert } from 'react-native';

export function confirmDialog(title: string, message: string, onConfirm: () => void) {
  Alert.alert(title, message, [
    { text: 'Batal', style: 'cancel' },
    { text: 'Ya', style: 'destructive', onPress: onConfirm },
  ]);
}
