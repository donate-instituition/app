import { Image, View, type ImageSourcePropType, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { avatarSizes, styles, type AvatarSize } from './styles';

type AvatarProps = ViewProps & {
  source?: ImageSourcePropType;
  name?: string;
  size?: AvatarSize;
};

function getInitials(name?: string) {
  if (!name) {
    return '?';
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

const textSizeStyles = {
  sm: styles.smText,
  md: styles.mdText,
  lg: styles.lgText,
} satisfies Record<AvatarSize, object>;

export function Avatar({ name, size = 'md', source, style, ...props }: AvatarProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const dimension = avatarSizes[size];

  return (
    <View
      accessibilityLabel={name}
      style={[
        styles.root,
        {
          backgroundColor: colors.primarySoft,
          borderRadius: dimension / 2,
          height: dimension,
          width: dimension,
        },
        style,
      ]}
      {...props}>
      {source ? (
        <Image source={source} style={styles.image} />
      ) : (
        <ThemedText variant="body" color={colors.primaryStrong} style={textSizeStyles[size]}>
          {getInitials(name)}
        </ThemedText>
      )}
    </View>
  );
}
