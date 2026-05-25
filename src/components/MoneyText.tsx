import { Text, TextProps } from 'react-native';
import { toRupiah } from '@/utils/money';

type Props = TextProps & {
  value: number;
};

export function MoneyText({ value, ...props }: Props) {
  return <Text {...props}>{toRupiah(value)}</Text>;
}
