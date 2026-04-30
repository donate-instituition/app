import { View, type ViewProps } from 'react-native';

import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { theme } from '@/src/theme';

import { styles } from './styles';

type DividerProps = ViewProps & {
  orientation?: 'horizontal' | 'vertical';
};

export function Divider({ orientation = 'horizontal', style, ...props }: DividerProps) {
  const scheme = useColorScheme() ?? 'light';

  return (
    <View
      style={[
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        { backgroundColor: theme.colors[scheme].border },
        style,
      ]}
      {...props}
    />
  );
}
