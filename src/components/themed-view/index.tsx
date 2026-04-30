import { View, type ViewProps } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from './styles';

type ThemedViewProps = ViewProps & {
  backgroundColor?: string;
};

export function ThemedView({ backgroundColor, style, ...props }: ThemedViewProps) {
  const scheme = useColorScheme() ?? 'light';

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: backgroundColor ?? theme.colors[scheme].background },
        style,
      ]}
      {...props}
    />
  );
}
