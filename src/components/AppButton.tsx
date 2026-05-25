import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
};

export function AppButton({ title, onPress, variant = 'primary', disabled, style }: Props) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.text, variant === 'ghost' && styles.ghostText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 14,
    marginVertical: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.accent },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: colors.soft },
  disabled: { opacity: 0.45 },
  pressed: { transform: [{ scale: 0.98 }] },
  text: { color: '#fff', fontWeight: '700' },
  ghostText: { color: colors.primaryDark },
});
