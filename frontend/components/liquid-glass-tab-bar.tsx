import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Radius, Spacing } from '@/constants/theme';

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
  wishlist: { active: 'heart', inactive: 'heart-outline' },
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
  const pillOpacity = useSharedValue(focused ? 1 : 0);
  const pillScale = useSharedValue(focused ? 1 : 0.8);

  useEffect(() => {
    pillOpacity.value = withSpring(focused ? 1 : 0, { damping: 18, stiffness: 280 });
    pillScale.value = withSpring(focused ? 1 : 0.8, { damping: 16, stiffness: 260 });
  }, [focused]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ scale: pillScale.value }],
  }));

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.8}>
      {/* Pill wraps icon + label together */}
      <View style={styles.pillContent}>
        {/* Glass pill fills the content wrapper */}
        <Animated.View style={[styles.pillWrapper, pillStyle]}>
          <BlurView intensity={80} tint="light" style={styles.pill} />
        </Animated.View>

        <Ionicons
          name={focused ? iconActive : iconInactive}
          size={26}
          color={focused ? Colors.blue : Colors.textMuted}
        />
        <Text style={[styles.label, focused && styles.labelActive]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    // Layered shadow for depth
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
  },
  pillContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    position: 'relative',
  },
  pillWrapper: {
    // Fills the pillContent container exactly
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    // Layered shadow for glass depth
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  pill: {
    flex: 1,
    backgroundColor: Colors.glassBlue,
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
