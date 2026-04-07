import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { Listing } from '@/services/listings';

type Props = {
  listing: Listing;
  onPress: (listing: Listing) => void;
  saved?: boolean;
  onToggleSave?: (listing: Listing) => void;
};

export function ListingCard({ listing, onPress, saved = false, onToggleSave }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(listing)}
      activeOpacity={0.85}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: listing.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Gradient overlay on image — bottom fade for depth */}
        <LinearGradient
          colors={['transparent', 'rgba(10,22,40,0.35)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0, y: 1 }}
          style={styles.imageOverlay}
          pointerEvents="none"
        />
        {/* Heart button */}
        {onToggleSave && (
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => onToggleSave(listing)}
            hitSlop={8}
            activeOpacity={0.7}
          >
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={20}
              color={saved ? Colors.error : Colors.white}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={styles.price}>${listing.price}</Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{listing.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderTopWidth: 2,
    borderTopColor: Colors.gold,
    ...Shadow.card,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 130,
    backgroundColor: Colors.offWhite,
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  heartBtn: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: Spacing.sm,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.gold,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.offWhite,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginTop: 2,
  },
  chipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
