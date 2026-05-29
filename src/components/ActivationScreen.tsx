import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { activateLicense, normalizeSerial } from '@/utils/license';
import { colors, spacing } from '@/theme';

export function ActivationScreen({ onActivated }: { onActivated: () => void }) {
  const [serial, setSerial] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);
      await activateLicense(serial);
      onActivated();
    } catch (err) {
      Alert.alert('Aktivasi gagal', err instanceof Error ? err.message : 'Serial number tidak valid');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.logo}>
        <MaterialCommunityIcons name="storefront-outline" size={42} color="#000" />
      </View>
      <Text style={styles.title}>Aktivasi Dagangi</Text>
      <Text style={styles.body}>Masukkan serial number untuk membuka aplikasi di perangkat ini.</Text>
      <TextInput
        autoCapitalize="characters"
        value={serial}
        onChangeText={(value) => setSerial(normalizeSerial(value))}
        placeholder="Serial Number"
        style={styles.input}
      />
      <AppButton title={loading ? 'Memeriksa...' : 'Aktivasi'} onPress={submit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.bg,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logo: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderColor: '#000',
    borderRadius: 24,
    borderWidth: 1.5,
    height: 84,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 84,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  body: {
    color: colors.muted,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.ink,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
    textAlign: 'center',
  },
});
