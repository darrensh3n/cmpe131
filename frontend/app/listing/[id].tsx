import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
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

import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { Listing, getListingById } from '@/services/listings';
import { getOrCreateConversation } from '@/services/messages';
import { useAuth } from '@/context/auth';
import { useWishlist } from '@/context/wishlist';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 280;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userEmail } = useAuth();
  const { isSaved, toggleSave } = useWishlist();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Button press animation
  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  useEffect(() => {
    if (id) {
      getListingById(id).then((data) => {
        setListing(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.notFoundText}>Listing not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink} activeOpacity={0.7}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(listing.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const images = listing.imageUrls ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Back + heart buttons overlaid on slideshow */}
      <View style={styles.imageControls}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.imageControlBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => listing && toggleSave(listing.id)}
          style={styles.imageControlBtn}
          activeOpacity={0.8}
        >
          <Ionicons
            name={listing && isSaved(listing.id) ? 'heart' : 'heart-outline'}
            size={20}
            color={listing && isSaved(listing.id) ? Colors.error : Colors.white}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image slideshow */}
        <View style={styles.slideshowContainer}>
          <FlatList
            data={images}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                <Image
                  source={{ uri: item }}
                  style={styles.slideImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(10,22,40,0.40)']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.slideOverlay}
                  pointerEvents="none"
                />
              </View>
            )}
          />

          {/* Dot indicators — only show when more than 1 image */}
          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content card */}
        <View style={styles.contentCard}>
          {/* Category + date row */}
          <View style={styles.metaRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{listing.category}</Text>
            </View>
            <Text style={styles.dateText}>Listed {formattedDate}</Text>
          </View>

          {/* Title + price */}
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.price}>${listing.price}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{listing.description}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Seller info */}
          <Text style={styles.sectionLabel}>Seller</Text>
          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarText}>
                {listing.sellerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.sellerName}>{listing.sellerName}</Text>
              <Text style={styles.sellerEmail}>{listing.sellerEmail}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer buttons */}
      <View style={styles.footer}>
        {userEmail === listing.sellerEmail ? (
          <View style={styles.ownerBanner}>
            <Ionicons name="person-circle-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.ownerBannerText}>You posted this listing</Text>
          </View>
        ) : (
          <View style={styles.footerRow}>
            <AnimatedTouchable
              style={[styles.contactBtn, styles.contactBtnHalf, btnStyle]}
              activeOpacity={1}
              onPressIn={() => {
                btnScale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
              }}
              onPressOut={() => {
                btnScale.value = withSpring(1, { damping: 12, stiffness: 200 });
              }}
              onPress={async () => {
                if (!userEmail || !listing) return;
                try {
                  const convo = await getOrCreateConversation(
                    listing.id,
                    userEmail,
                    userEmail.split('@')[0],
                    listing.sellerEmail,
                    listing.sellerName,
                    listing.title,
                    listing.imageUrls[0] ?? ''
                  );
                  router.push(`/conversation/${convo.id}` as any);
                } catch {
                  Alert.alert('Could not open conversation', 'Please try again.');
                }
              }}
            >
              <Ionicons name="mail-outline" size={18} color={Colors.white} />
              <Text style={styles.contactBtnText}>Contact</Text>
            </AnimatedTouchable>

            <TouchableOpacity
              style={styles.buyBtn}
              activeOpacity={0.8}
              onPress={() => {
                if (!listing) return;
                router.push(`/checkout/${listing.id}` as any);
              }}
            >
              <Ionicons name="card-outline" size={18} color={Colors.white} />
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  imageControls: {
    position: 'absolute',
    top: 54,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageControlBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  slideshowContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: Colors.border,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  slideImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  slideOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  dotsRow: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    borderRadius: Radius.full,
  },
  dotActive: {
    width: 20,
    height: 6,
    backgroundColor: Colors.white,
  },
  dotInactive: {
    width: 6,
    height: 6,
    backgroundColor: Colors.whiteAlpha60,
  },
  contentCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: -Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.card,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.offWhite,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  price: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.gold,
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sellerEmail: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 1,
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  contactBtn: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.md,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadow.button,
  },
  contactBtnHalf: {
    flex: 1,
  },
  contactBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  buyBtn: {
    flex: 1,
    backgroundColor: Colors.gold,
    borderRadius: Radius.md,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadow.button,
  },
  buyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  backLink: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backLinkText: {
    fontSize: 15,
    color: Colors.blue,
    fontWeight: '600',
  },
  ownerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 52,
  },
  ownerBannerText: {
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
