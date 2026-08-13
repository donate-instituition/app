import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ScrollViewProps,
  type ViewProps,
} from 'react-native';
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={styles.root}>
        {scrollable ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={[
              styles.content,
              paddingStyles[padding],
              styles.keyboardPadding,
              scrollViewProps?.contentContainerStyle,
            ]}
            {...scrollViewProps}>
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.root, paddingStyles[padding]]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
