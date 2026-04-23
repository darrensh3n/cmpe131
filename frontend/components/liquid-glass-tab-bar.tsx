import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Spacing } from '@/constants/theme';

type Route = {
  key: string;
  name: string;
};

type Props = {
  state: {
    index: number;
    routes: Route[];
  };
  descriptors: Record<string, { options: { title?: string; tabBarIcon?: (args: { color: string; focused: boolean; size: number }) => React.ReactNode } }>;
  navigation: { navigate: (name: string) => void };
};

// Icon map — add entries here as new tabs are added
const ICONS: Record<string, { active: string; inactive: string }> = {
  index: { active: 'storefront', inactive: 'storefront-outline' },
  messages: { active: 'chatbubble', inactive: 'chatbubble-outline' },
  sell: { active: 'pricetag', inactive: 'pricetag-outline' },
  wishlist: { active: 'heart', inactive: 'heart-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

export function LiquidGlassTabBar({ state, descriptors, navigation }: Props) {
  return (
    <BlurView intensity={60} tint="light" style={styles.tabBar}>
      <View style={styles.tabBarInner}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const descriptor = descriptors[route.key];
          const label = descriptor?.options?.title ?? route.name;
          const icons = ICONS[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };

          return (
            <TabItem
              key={route.key}
              label={label}
              iconActive={icons.active as any}
              iconInactive={icons.inactive as any}
              focused={focused}
              onPress={() => {
                if (!focused) {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </BlurView>
  );
}

type TabItemProps = {
  label: string;
  iconActive: keyof typeof Ionicons.glyphMap;
  iconInactive: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  onPress: () => void;
};

function TabItem({ label, iconActive, iconInactive, focused, onPress }: TabItemProps) {
  const indicatorOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    if (focused) {
      indicatorOpacity.value = withSpring(1, { damping: 18, stiffness: 280 });
    } else {
      cancelAnimation(indicatorOpacity);
      indicatorOpacity.value = 0;
    }
  }, [focused]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
  }));

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.8}>
      {/* Thin blue line at the top of the tab bar for the active tab */}
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      <Ionicons
        name={focused ? iconActive : iconInactive}
        size={24}
        color={focused ? Colors.blue : Colors.textMuted}
      />
      <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  tabBarInner: {
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.sm,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: -Spacing.sm,   // sits flush against the top border of the tab bar
    left: Spacing.sm,
    right: Spacing.sm,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: Colors.blue,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: Colors.blue,
    fontWeight: '700',
  },
});
