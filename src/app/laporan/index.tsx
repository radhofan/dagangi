import { Link } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';

const links = [
  ['Harian', '/laporan/harian'],
  ['Bulanan', '/laporan/bulanan'],
  ['Stok Menipis', '/laporan/stok-menipis'],
  ['Hutang', '/laporan/hutang'],
] as const;

export default function ReportsScreen() {
  return (
    <Screen>
      {links.map(([label, href]) => (
        <Link href={href} key={href} asChild>
          <Pressable><AppCard><Text style={{ fontWeight: '900', fontSize: 18 }}>{label}</Text></AppCard></Pressable>
        </Link>
      ))}
    </Screen>
  );
}
