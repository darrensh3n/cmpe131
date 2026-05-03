import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ListingCard } from '@/components/listing-card';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useWishlist } from '@/context/wishlist';
import { CATEGORIES, Listing, getListings } from '@/services/listings';

export default function MarketplaceScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { isSaved, toggleSave } = useWishlist();

  const searchInputRef = useRef<TextInput>(null);

  const searchOpacity = useSharedValue(0);
  const searchTranslateY = useSharedValue(-8);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getListings().then((data) => {
        setListings(data);
        setLoading(false);
      });
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getListings().then((data) => {
      setListings(data);
      setRefreshing(false);
    });
  }, []);

  const toggleSearch = () => {
    const next = !searchVisible;
    setSearchVisible(next);
    searchOpacity.value = withTiming(next ? 1 : 0, { duration: 180 });
    searchTranslateY.value = withSpring(next ? 0 : -8, { damping: 18, stiffness: 300 });
    if (next) {
      setTimeout(() => searchInputRef.current?.focus(), 200);
    } else {
      setSearchQuery('');
    }
  };

  const searchBarStyle = useAnimatedStyle(() => ({
    opacity: searchOpacity.value,
    transform: [{ translateY: searchTranslateY.value }],
  }));

  const filteredListings = listings.filter((l) => {
    const matchesCategory = activeCategory === 'All' || l.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderHeader = () => (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChipWrapper, isActive && styles.categoryChipWrapperActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.75}
            >
              {isActive ? (
                <LinearGradient
                  colors={[Colors.blueLight, Colors.blue, Colors.blueDark]}
                  locations={[0, 0.55, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.categoryChipGradient}
                >
                  <Text style={[styles.categoryChipText, styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryChipText}>{cat}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filteredListings.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Ionicons name="storefront-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyText}>No listings found</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* SJSU branded gradient header — blueLight → blue → blueDark diagonal */}
      <LinearGradient
        colors={[Colors.blueLight, Colors.blue, Colors.blueDark]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoRingOuter}>
              <View style={styles.logoRing}>
                <Image
                  source={require('@/brand_assets/spartanOG.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <View>
              <Text style={styles.headerTitle}>
                Spartan <Text style={styles.headerTitleAccent}>Marketplace</Text>
              </Text>
              <Text style={styles.headerSubtitle}>San José State University</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={toggleSearch}
            style={styles.searchBtn}
            hitSlop={12}
            activeOpacity={0.7}
          >
            <Ionicons
              name={searchVisible ? 'close' : 'search'}
              size={22}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Search bar slot — always in layout, animated via opacity + translateY */}
        <View style={[styles.searchBarSlot, searchVisible ? styles.searchBarSlotOpen : styles.searchBarSlotClosed]} pointerEvents={searchVisible ? 'auto' : 'none'}>
          <Animated.View style={[styles.searchBarInner, searchBarStyle]}>
            <Ionicons name="search" size={15} color={Colors.textMuted} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search listings..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </LinearGradient>

      {/* Listings grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item.id}
          numColumns={2}
          style={styles.flatList}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ListingCard
                listing={item}
                onPress={(l) => router.push(`/listing/${l.id}` as any)}
                saved={isSaved(item.id)}
                onToggleSave={(l) => toggleSave(l.id)}
              />
            </View>
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} />
          }
        />
      )}
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
  logoRingOuter: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  logoRing: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 36,
    height: 36,
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
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.whiteAlpha60,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  searchBtn: {
    padding: 4,
  },
  searchBarSlot: {
    paddingHorizontal: Spacing.md,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  searchBarSlotOpen: {
    height: 52,
    paddingBottom: Spacing.sm,
  },
  searchBarSlotClosed: {
    height: 0,
    paddingBottom: 0,
  },
  searchBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    height: 40,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textPrimary,
    paddingVertical: 0,
    lineHeight: 20,
  },
  listContent: {
    backgroundColor: Colors.offWhite,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  categoriesContainer: {
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  categoryChipWrapper: {
    borderRadius: Radius.full,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryChipWrapperActive: {
    shadowColor: Colors.blueDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 6,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipGradient: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  cardWrapper: {
    flex: 1,
  },
  flatList: {
    backgroundColor: Colors.offWhite,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textMuted,
    lineHeight: 22,
  },
});
