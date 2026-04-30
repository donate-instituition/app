import { View, type ViewProps } from 'react-native';

import { ThemedText } from '@/src/components/themed-text';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { theme } from '@/src/theme';

import { getTagColors, styles, type TagVariant } from './styles';

type TagProps = ViewProps & {
  label: string;
  variant?: TagVariant;
};

export function Tag({ label, style, variant = 'neutral', ...props }: TagProps) {
  const scheme = useColorScheme() ?? 'light';
  const tagColors = getTagColors(theme.colors[scheme], variant);

  return (
    <View style={[styles.root, { backgroundColor: tagColors.backgroundColor }, style]} {...props}>
      <ThemedText variant="caption" color={tagColors.textColor}>
        {label}
      </ThemedText>
    </View>
  );
}
