import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { FormField } from '@/components/FormField';
import { createCustomer, updateCustomer } from '@/services/customer.service';
import { Customer } from '@/types/debt';

type Props = {
  customer?: Customer;
};

export function CustomerForm({ customer }: Props) {
  const [name, setName] = useState(customer?.name ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [address, setAddress] = useState(customer?.address ?? '');
  const [note, setNote] = useState(customer?.note ?? '');

  async function save() {
    try {
      const input = { name, phone, address, note };
      if (customer) await updateCustomer(customer.id, input);
      else await createCustomer(input);
      router.replace('/hutang/customers');
    } catch (err) {
      Alert.alert('Gagal menyimpan', err instanceof Error ? err.message : 'Cek data pelanggan');
    }
  }

  return (
    <>
      <FormField label="Nama" value={name} onChangeText={setName} placeholder="Nama pelanggan" />
      <FormField label="Nomor HP" value={phone} onChangeText={setPhone} placeholder="08..." keyboardType="phone-pad" />
      <FormField label="Alamat" value={address} onChangeText={setAddress} multiline />
      <FormField label="Catatan" value={note} onChangeText={setNote} multiline />
      <AppButton title="Simpan" onPress={save} />
    </>
  );
}
