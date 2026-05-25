import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, spacing } from '@/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
};

export function FormField({ label, value, onChangeText, placeholder, keyboardType, multiline }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  label: { color: colors.ink, fontWeight: '700', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});
