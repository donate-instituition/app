import { useEffect, useRef, useState } from 'react';
import { Animated, type LayoutChangeEvent, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from './styles';

export type SegmentedToggleOption<T extends string> = {
  key: T;
  label: string;
};

type SegmentedToggleProps<T extends string> = {
  onChange: (value: T) => void;
  options: SegmentedToggleOption<T>[];
  value: T;
};

export function SegmentedToggle<T extends string>({ onChange, options, value }: SegmentedToggleProps<T>) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const selectedIndex = Math.max(
    options.findIndex((option) => option.key === value),
    0
  );
  const segmentWidth = containerWidth / options.length;

  useEffect(() => {
    if (!containerWidth) return;

    Animated.spring(translateX, {
      toValue: selectedIndex * segmentWidth,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [containerWidth, segmentWidth, selectedIndex, translateX]);

  function handleLayout(event: LayoutChangeEvent) {
    setContainerWidth(event.nativeEvent.layout.width);
  }

  return (
    <View onLayout={handleLayout} style={[styles.container, { backgroundColor: colors.surfaceMuted }]}>
      {containerWidth > 0 ? (
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: colors.surface,
              shadowColor: colors.primaryStrong,
              width: segmentWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      ) : null}
      {options.map((option) => {
        const selected = option.key === value;

        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            style={styles.segment}
            onPress={() => onChange(option.key)}>
            <ThemedText
              variant="body"
              numberOfLines={1}
              color={selected ? colors.primary : colors.textMuted}
              style={styles.label}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
