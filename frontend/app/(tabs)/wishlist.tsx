import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ListingCard } from '@/components/listing-card';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useWishlist } from '@/context/wishlist';
import { Listing, getListings } from '@/services/listings';

export default function WishlistScreen() {
  const { savedIds, isSaved, toggleSave } = useWishlist();
  const [allListings, setAllListings] = useState<Listing[]>([]);

  useEffect(() => {
    getListings().then(setAllListings);
  }, []);

  const savedListings = allListings.filter((l) => savedIds.has(l.id));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.blueLight, Colors.blue, Colors.blueDark]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="heart" size={22} color={Colors.goldLight} />
            <Text style={styles.headerTitle}>
              Spartan <Text style={styles.headerTitleAccent}>Wishlist</Text>
            </Text>
          </View>
          {savedListings.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{savedListings.length}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Grid */}
      <FlatList
        data={savedListings}
        keyExtractor={(item) => item.id}
        numColumns={2}
        style={styles.list}
        contentContainerStyle={savedListings.length === 0 ? styles.emptyContainer : styles.listContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={savedListings.length > 0 ? styles.columnWrapper : undefined}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ListingCard
              listing={item}
              onPress={(l) => router.push(`/listing/${l.id}`)}
              saved={isSaved(item.id)}
              onToggleSave={(l) => toggleSave(l.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={52} color={Colors.border} />
            <Text style={styles.emptyTitle}>No saved listings yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the heart icon on any listing to save it here
            </Text>
          </View>
        }
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
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  headerTitleAccent: {
    color: Colors.goldLight,
  },
  countBadge: {
    backgroundColor: Colors.error,
    borderRadius: Radius.full,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  list: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  cardWrapper: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
