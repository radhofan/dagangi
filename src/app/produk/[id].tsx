import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';
import { ProductForm } from '@/app/produk/ProductForm';
import { Screen } from '@/components/Screen';
import { getProduct } from '@/services/product.service';
import { useRefresh } from '@/hooks/useRefresh';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useRefresh(() => getProduct(id), [id]);
  if (loading) return <Screen><ActivityIndicator /></Screen>;
  if (!data) return <Screen><Text>Produk tidak ditemukan.</Text></Screen>;
  return <Screen><ProductForm product={data} /></Screen>;
}
