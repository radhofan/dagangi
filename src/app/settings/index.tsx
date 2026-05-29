import { Link } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';

const links = [
  ['Data Toko', '/settings/toko'],
  ['Backup Data Toko', '/settings/backup'],
  // ['Printer', '/settings/printer'],
  // ['Import Produk CSV', '/settings/import-products'],
  // ['Developer Tools', '/settings/developer'],
] as const;

export default function SettingsScreen() {
  return (
    <Screen>
      {links.map(([label, href]) => (
        <Link href={href} asChild key={href}>
          <Pressable><AppCard><Text style={{ fontWeight: '900', fontSize: 18 }}>{label}</Text></AppCard></Pressable>
        </Link>
      ))}
    </Screen>
  );
}
