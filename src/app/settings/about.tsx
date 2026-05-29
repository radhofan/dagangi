import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { confirmDialog } from '@/components/ConfirmDialog';
import { Screen } from '@/components/Screen';
import { formatActivatedAt, getLicenseInfo, maskSerial, resetLicenseForDev } from '@/utils/license';
import { useRefresh } from '@/hooks/useRefresh';

export default function AboutScreen() {
  const license = useRefresh(getLicenseInfo, []);
  const [resetting, setResetting] = useState(false);

  async function resetLicense() {
    try {
      setResetting(true);
      await resetLicenseForDev();
      await license.refresh();
      Alert.alert('License reset', 'Aktivasi di perangkat ini sudah dihapus.');
    } catch (err) {
      Alert.alert('Gagal reset', err instanceof Error ? err.message : 'Coba lagi');
    } finally {
      setResetting(false);
    }
  }

  return (
    <Screen>
      <AppCard title="Tentang Aplikasi">
        <View style={{ gap: 8 }}>
          <Text>License Status: <Text style={{ fontWeight: '900' }}>{license.data?.license_status ?? '-'}</Text></Text>
          <Text>Serial Number: <Text style={{ fontWeight: '900' }}>{maskSerial(license.data?.license_key ?? null)}</Text></Text>
          <Text>Activated At: <Text style={{ fontWeight: '900' }}>{formatActivatedAt(license.data?.activated_at ?? null)}</Text></Text>
        </View>
        {__DEV__ ? (
          <AppButton
            title={resetting ? 'Reset...' : 'Reset License Dev'}
            variant="danger"
            disabled={resetting}
            onPress={() => confirmDialog('Reset license?', 'Hanya untuk mode development. Data toko tidak akan dihapus.', resetLicense)}
          />
        ) : null}
      </AppCard>
    </Screen>
  );
}
