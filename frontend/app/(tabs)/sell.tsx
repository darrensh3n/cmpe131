import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ListingCard } from '@/components/listing-card';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { Listing, getMyListings } from '@/services/listings';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function SellScreen() {
  const { userEmail } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  // Refresh listings every time the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!userEmail) return;
      setLoading(true);
      getMyListings(userEmail).then((data) => {
        setListings(data);
        setLoading(false);
      });
    }, [userEmail])
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons name="pricetag-outline" size={56} color={Colors.border} />
        <Text style={styles.emptyTitle}>No listings yet</Text>
        <Text style={styles.emptySubtitle}>Tap "List Item" to start selling</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* SJSU branded gradient header */}
      <LinearGradient
        colors={[Colors.blueLight, Colors.blue, Colors.blueDark]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              My <Text style={styles.headerTitleAccent}>Listings</Text>
            </Text>
            <Text style={styles.headerSubtitle}>Items you're selling</Text>
          </View>

          {/* List Item button */}
          <AnimatedTouchable
            style={[styles.listItemBtn, btnStyle]}
            activeOpacity={1}
            onPressIn={() => {
              btnScale.value = withSpring(0.94, { damping: 15, stiffness: 300 });
            }}
            onPressOut={() => {
              btnScale.value = withSpring(1, { damping: 12, stiffness: 200 });
            }}
            onPress={() => router.push('/sell/create')}
          >
            <LinearGradient
              colors={[Colors.goldDark, Colors.gold, Colors.goldLight]}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.listItemBtnGradient}
            >
              <Ionicons name="add" size={18} color={Colors.blueDark} />
              <Text style={styles.listItemBtnText}>List Item</Text>
            </LinearGradient>
          </AnimatedTouchable>
        </View>
      </LinearGradient>

      {/* Listings */}
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ListingCard
              listing={item}
              onPress={(l) => router.push(`/listing/${l.id}`)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.blueDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'android' ? Spacing.lg : Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  headerTitleAccent: {
    color: Colors.goldLight,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.whiteAlpha60,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  listItemBtn: {
    borderRadius: Radius.md,
    ...Shadow.button,
  },
  listItemBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  listItemBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.blueDark,
    letterSpacing: 0.2,
  },
  flatList: {
    backgroundColor: Colors.offWhite,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  cardWrapper: {
    marginBottom: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
});
