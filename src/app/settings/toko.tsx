import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { FormField } from '@/components/FormField';
import { Screen } from '@/components/Screen';
import { useSettingsStore } from '@/stores/settings.store';
import { useState } from 'react';
import { colors, spacing } from '@/theme';

export default function ShopSettingsScreen() {
  const { settings, save } = useSettingsStore();
  const [shopName, setShopName] = useState(settings.shop_name ?? '');
  const [shopAddress, setShopAddress] = useState(settings.shop_address ?? '');
  const [shopPhone, setShopPhone] = useState(settings.shop_phone ?? '');
  const [footer, setFooter] = useState(settings.receipt_footer ?? '');
  const [logoUri, setLogoUri] = useState(settings.receipt_logo_uri ?? '');
  const [negative, setNegative] = useState(settings.allow_negative_stock ?? 'false');

  async function pickLogo() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: 'image/*',
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const ext = asset.name?.split('.').pop()?.toLowerCase() || 'png';
    const destination = `${FileSystem.documentDirectory}receipt-logo.${ext}`;
    const existing = await FileSystem.getInfoAsync(destination);
    if (existing.exists) {
      await FileSystem.deleteAsync(destination);
    }
    await FileSystem.copyAsync({ from: asset.uri, to: destination });
    setLogoUri(destination);
  }

  async function submit() {
    await save({
      shop_name: shopName,
      shop_address: shopAddress,
      shop_phone: shopPhone,
      receipt_footer: footer,
      receipt_logo_uri: logoUri,
      allow_negative_stock: negative,
    });
    Alert.alert('Tersimpan', 'Pengaturan toko diperbarui');
  }

  return (
    <Screen>
      <AppCard title="Identitas Toko">
        <FormField label="Nama Toko" value={shopName} onChangeText={setShopName} />
        <FormField label="Alamat" value={shopAddress} onChangeText={setShopAddress} multiline />
        <FormField label="Nomor HP" value={shopPhone} onChangeText={setShopPhone} />
        <FormField label="Footer Struk" value={footer} onChangeText={setFooter} />
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Logo Struk</Text>
          <View style={styles.logoBox}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logoPreview} resizeMode="contain" />
            ) : (
              <View style={styles.defaultLogoPreview}>
                <MaterialCommunityIcons name="storefront-outline" size={42} color="#000" />
              </View>
            )}
          </View>
          <View style={styles.logoActions}>
            <AppButton title="Upload Logo" variant="secondary" onPress={() => pickLogo().catch((err) => Alert.alert('Gagal pilih logo', err.message))} style={styles.logoButton} />
            <AppButton title="Template Default" variant="ghost" onPress={() => setLogoUri('')} style={styles.logoButton} />
          </View>
        </View>
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Izinkan stok minus?</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={negative} onValueChange={setNegative}>
              <Picker.Item label="Tidak" value="false" />
              <Picker.Item label="Iya" value="true" />
            </Picker>
          </View>
        </View>
        <AppButton title="Simpan" onPress={submit} />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: spacing.sm },
  label: { color: colors.ink, fontWeight: '700', marginBottom: 6 },
  logoActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  logoBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    minHeight: 110,
    padding: spacing.md,
  },
  logoButton: {
    flex: 1,
  },
  defaultLogoPreview: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#000',
    borderRadius: 24,
    borderWidth: 1.5,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  logoPreview: {
    height: 90,
    width: '100%',
  },
  pickerWrap: {
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
