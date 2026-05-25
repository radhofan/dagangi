import { Alert } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { FormField } from '@/components/FormField';
import { Screen } from '@/components/Screen';
import { useSettingsStore } from '@/stores/settings.store';
import { useState } from 'react';

export default function ShopSettingsScreen() {
  const { settings, save } = useSettingsStore();
  const [shopName, setShopName] = useState(settings.shop_name ?? '');
  const [shopAddress, setShopAddress] = useState(settings.shop_address ?? '');
  const [shopPhone, setShopPhone] = useState(settings.shop_phone ?? '');
  const [footer, setFooter] = useState(settings.receipt_footer ?? '');
  const [negative, setNegative] = useState(settings.allow_negative_stock ?? 'false');

  async function submit() {
    await save({
      shop_name: shopName,
      shop_address: shopAddress,
      shop_phone: shopPhone,
      receipt_footer: footer,
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
        <FormField label="Izinkan stok minus? (true/false)" value={negative} onChangeText={setNegative} />
        <AppButton title="Simpan" onPress={submit} />
      </AppCard>
    </Screen>
  );
}
