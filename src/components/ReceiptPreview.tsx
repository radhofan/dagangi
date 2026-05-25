import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme';

export function ReceiptPreview({ text }: { text: string }) {
  return (
    <View style={styles.paper}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: '#fffdf7',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: spacing.md,
  },
  text: {
    color: colors.ink,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});
