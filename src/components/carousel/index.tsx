import { useState, type ReactNode } from 'react';
import { ScrollView, useWindowDimensions, View, type ViewProps } from 'react-native';

import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { theme } from '@/src/theme';

import { styles } from './styles';

type CarouselProps<TItem> = ViewProps & {
  data: TItem[];
  renderItem: (params: { item: TItem; index: number }) => ReactNode;
  itemWidth?: number;
  showDots?: boolean;
};

export function Carousel<TItem>({
  data,
  itemWidth,
  renderItem,
  showDots = true,
  style,
  ...props
}: CarouselProps<TItem>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { width } = useWindowDimensions();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const slideWidth = itemWidth ?? width - theme.spacing.xl * 2;

  return (
    <View style={[styles.root, style]} {...props}>
      <ScrollView
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideWidth}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
          setActiveIndex(nextIndex);
        }}>
        {data.map((item, index) => (
          <View key={index} style={[styles.item, { width: slideWidth }]}>
            {renderItem({ item, index })}
          </View>
        ))}
      </ScrollView>

      {showDots && data.length > 1 ? (
        <View style={styles.dots}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.activeDot : undefined,
                {
                  backgroundColor: index === activeIndex ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
