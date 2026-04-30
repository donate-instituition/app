import { View, type ViewProps } from 'react-native';

import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { theme } from '@/src/theme';

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
