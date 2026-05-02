import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { getListingById, Listing } from '@/services/listings';

type Stage = 'form' | 'processing' | 'success' | 'meetup';

const MEETUP_SPOTS = [
  { name: 'Student Union', icon: 'business-outline' as const },
  { name: 'Clark Hall Lobby', icon: 'school-outline' as const },
  { name: 'MLK Library Entrance', icon: 'library-outline' as const },
  { name: 'Spartan Recreation', icon: 'fitness-outline' as const },
];

const TIME_SLOTS = [
  'Today, 3:00 PM',
  'Today, 5:30 PM',
  'Tomorrow, 10:00 AM',
  'Tomorrow, 2:00 PM',
];

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userEmail } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [stage, setStage] = useState<Stage>('form');
  const [payMethod, setPayMethod] = useState<'card' | 'in-person'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getListingById(id).then(setListing);
    }
  }, [id]);

  const handlePay = () => {
    if (!listing) return;
    setStage('processing');
    setTimeout(() => setStage('success'), payMethod === 'card' ? 1800 : 800);
  };

  if (!listing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      </SafeAreaView>
    );
  }

  if (userEmail === listing.sellerEmail) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.ownListingTitle}>You can't buy your own listing</Text>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.ownListingBack}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Meetup scheduling ──
  if (stage === 'meetup') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerTitle}>Schedule Meetup</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.body} contentContainerStyle={{ gap: Spacing.md, paddingBottom: Spacing.xl }}>
          {/* Item reminder */}
          <View style={styles.card}>
            <View style={styles.itemRow}>
              <Image source={{ uri: listing.imageUrls[0] }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>{listing.title}</Text>
                <View style={styles.meetupSellerRow}>
                  <Ionicons name="person-circle-outline" size={16} color={Colors.textMuted} />
                  <Text style={styles.meetupSellerText}>Meet with {listing.sellerName}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Location picker */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Meetup Location</Text>
            <Text style={styles.sectionHint}>Choose a safe, public spot on campus</Text>
            <View style={styles.optionsGrid}>
              {MEETUP_SPOTS.map((spot) => (
                <TouchableOpacity
                  key={spot.name}
                  style={[
                    styles.optionChip,
                    selectedSpot === spot.name && styles.optionChipActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedSpot(spot.name)}
                >
                  <Ionicons
                    name={spot.icon}
                    size={18}
                    color={selectedSpot === spot.name ? Colors.white : Colors.blue}
                  />
                  <Text
                    style={[
                      styles.optionChipText,
                      selectedSpot === spot.name && styles.optionChipTextActive,
                    ]}
                  >
                    {spot.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time picker */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Preferred Time</Text>
            <View style={styles.timeList}>
              {TIME_SLOTS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.timeSlotActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedTime(time)}
                >
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={selectedTime === time ? Colors.white : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedTime === time && styles.timeSlotTextActive,
                    ]}
                  >
                    {time}
                  </Text>
                  {selectedTime === time && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.white} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Confirm button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              (!selectedSpot || !selectedTime) && styles.confirmBtnDisabled,
            ]}
            activeOpacity={0.8}
            disabled={!selectedSpot || !selectedTime}
            onPress={() => {
              router.replace('/(tabs)' as any);
            }}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.white} />
            <Text style={styles.confirmBtnText}>Confirm Meetup</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Success state ──
  if (stage === 'success') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={48} color={Colors.white} />
          </View>
          <Text style={styles.successTitle}>
            {payMethod === 'card' ? 'Payment Successful!' : 'Item Reserved!'}
          </Text>
          <Text style={styles.successSub}>
            {payMethod === 'card'
              ? `You purchased ${listing.title} for $${listing.price.toFixed(2)}`
              : `You reserved ${listing.title} — pay $${listing.price.toFixed(2)} at meetup`}
          </Text>
          <Text style={styles.successHint}>
            Now schedule a campus meetup to {payMethod === 'card' ? 'pick up' : 'exchange'} your item.
          </Text>
          <TouchableOpacity
            style={styles.meetupBtn}
            activeOpacity={0.8}
            onPress={() => setStage('meetup')}
          >
            <Ionicons name="location-outline" size={18} color={Colors.white} />
            <Text style={styles.meetupBtnText}>Schedule Meetup</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Processing state ──
  if (stage === 'processing') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.blue} />
          <Text style={styles.processingText}>
            {payMethod === 'card' ? 'Processing payment...' : 'Reserving item...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Checkout form ──
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ gap: Spacing.md, paddingBottom: Spacing.xl }}>
        {/* Order summary */}
        <View style={styles.card}>
          <View style={styles.itemRow}>
            <Image source={{ uri: listing.imageUrls[0] }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={2}>{listing.title}</Text>
              <Text style={styles.itemCategory}>{listing.category}</Text>
              <Text style={styles.itemPrice}>${listing.price.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment method */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Payment Method</Text>
          <View style={styles.methodRow}>
            <TouchableOpacity
              style={[styles.methodOption, payMethod === 'card' && styles.methodOptionActive]}
              activeOpacity={0.7}
              onPress={() => setPayMethod('card')}
            >
              <Ionicons
                name="card-outline"
                size={22}
                color={payMethod === 'card' ? Colors.white : Colors.blue}
              />
              <Text style={[styles.methodText, payMethod === 'card' && styles.methodTextActive]}>
                Pay with Card
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodOption, payMethod === 'in-person' && styles.methodOptionActive]}
              activeOpacity={0.7}
              onPress={() => setPayMethod('in-person')}
            >
              <Ionicons
                name="cash-outline"
                size={22}
                color={payMethod === 'in-person' ? Colors.white : Colors.blue}
              />
              <Text style={[styles.methodText, payMethod === 'in-person' && styles.methodTextActive]}>
                Pay in Person
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card details (only for card payment) */}
        {payMethod === 'card' && (
          <View style={styles.card}>
            <View style={styles.cardLabelRow}>
              <Text style={styles.sectionLabel}>Card Details</Text>
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>BETA</Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Card Number</Text>
            <View style={styles.inputRow}>
              <Ionicons name="card-outline" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={(t) => {
                  const digits = t.replace(/\D/g, '').slice(0, 16);
                  setCardNumber(digits.replace(/(.{4})/g, '$1 ').trim());
                }}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>

            <View style={styles.rowSplit}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Expiry</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={expiry}
                    onChangeText={(t) => {
                      const digits = t.replace(/\D/g, '').slice(0, 4);
                      setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                    }}
                    placeholder="MM/YY"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>CVC</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={cvc}
                    onChangeText={(t) => setCvc(t.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* In-person note */}
        {payMethod === 'in-person' && (
          <View style={styles.card}>
            <View style={styles.inPersonNote}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.blue} />
              <Text style={styles.inPersonNoteText}>
                You pay the seller directly when you meet up. Cash, Venmo, and Zelle accepted.
              </Text>
            </View>
          </View>
        )}

        {/* Total */}
        <View style={styles.card}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>${listing.price.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pay button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.payBtn} activeOpacity={0.8} onPress={handlePay}>
          <LinearGradient
            colors={[Colors.gold, Colors.goldDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.payBtnGradient}
          >
            <Ionicons name={payMethod === 'card' ? 'lock-closed' : 'checkmark-circle'} size={16} color={Colors.white} />
            <Text style={styles.payBtnText}>
              {payMethod === 'card' ? `Pay $${listing.price.toFixed(2)}` : 'Reserve Item'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  body: {
    flex: 1,
    padding: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.card,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionHint: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: Radius.sm,
    backgroundColor: Colors.border,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  itemCategory: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gold,
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
    marginTop: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    height: 44,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  rowSplit: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  methodRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  methodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 4,
    borderRadius: Radius.md,
    backgroundColor: Colors.offWhite,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  methodOptionActive: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  methodTextActive: {
    color: Colors.white,
  },
  inPersonNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  inPersonNoteText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.gold,
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  payBtn: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadow.button,
  },
  payBtnGradient: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  payBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  // Success
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  successSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  successHint: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  meetupBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.blue,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.button,
  },
  meetupBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  processingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  demoBadge: {
    backgroundColor: Colors.goldLight,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.8,
  },
  ownListingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  ownListingBack: {
    fontSize: 15,
    color: Colors.blue,
    fontWeight: '600',
  },
  // Meetup
  meetupSellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  meetupSellerText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.offWhite,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  optionChipActive: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  optionChipTextActive: {
    color: Colors.white,
  },
  timeList: {
    gap: Spacing.sm,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: Radius.md,
    backgroundColor: Colors.offWhite,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  timeSlotActive: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  timeSlotTextActive: {
    color: Colors.white,
  },
  confirmBtn: {
    backgroundColor: Colors.success,
    borderRadius: Radius.md,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadow.button,
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
