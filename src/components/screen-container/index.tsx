import { ScrollView, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles, type ScreenContainerPadding } from './styles';

type ScreenContainerProps = ViewProps & {
  padding?: ScreenContainerPadding;
  scrollable?: boolean;
  scrollViewProps?: ScrollViewProps;
};

const paddingStyles = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
} satisfies Record<ScreenContainerPadding, object>;

export function ScreenContainer({
  children,
  padding = 'md',
  scrollable,
  scrollViewProps,
  style,
  ...props
}: ScreenContainerProps) {
  const scheme = useColorScheme() ?? 'light';
  const backgroundColor = theme.colors[scheme].background;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor }, style]} {...props}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            paddingStyles[padding],
            scrollViewProps?.contentContainerStyle,
          ]}
          {...scrollViewProps}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, paddingStyles[padding]]}>{children}</View>
      )}
    </SafeAreaView>
  );
}
