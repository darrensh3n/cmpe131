import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
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
} from 'react-native-reanimated';

import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { SELL_CATEGORIES, createListing } from '@/services/listings';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const MAX_IMAGES = 5;

export default function CreateListingScreen() {
  const { userEmail } = useAuth();

  const [imageUris, setImageUris] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(SELL_CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; price?: string; images?: string }>({});

  const submitScale = useSharedValue(1);
  const submitStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitScale.value }],
  }));

  const pickImage = async () => {
    if (imageUris.length >= MAX_IMAGES) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUris((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0)
      newErrors.price = 'Enter a valid price';
    if (imageUris.length === 0) newErrors.images = 'Add at least one photo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !userEmail) return;
    createListing({
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      imageUrls: imageUris,
      sellerName: userEmail.split('@')[0],
      sellerEmail: userEmail,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.blueLight, Colors.blue, Colors.blueDark]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={12}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Listing</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Photos ── */}
          <View style={styles.section}>
            <Text style={styles.label}>Photos</Text>
            <Text style={styles.labelHint}>Up to {MAX_IMAGES} photos</Text>
            {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesRow}
            >
              {imageUris.map((uri, i) => (
                <View key={i} style={styles.imageTile}>
                  <Image source={{ uri }} style={styles.imageTileImg} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.removeBadge}
                    onPress={() => removeImage(i)}
                    hitSlop={6}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={12} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {imageUris.length < MAX_IMAGES && (
                <TouchableOpacity
                  style={styles.addImageTile}
                  onPress={pickImage}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-outline" size={28} color={Colors.textMuted} />
                  <Text style={styles.addImageLabel}>Add</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* ── Title ── */}
          <View style={styles.section}>
            <Text style={styles.label}>Title</Text>
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            <TextInput
              style={[styles.input, errors.title ? styles.inputError : null]}
              placeholder="e.g. TI-84 Calculator"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
              }}
              maxLength={80}
              returnKeyType="next"
            />
          </View>

          {/* ── Category ── */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {SELL_CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.75}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    {active ? (
                      <LinearGradient
                        colors={[Colors.blueLight, Colors.blue, Colors.blueDark]}
                        locations={[0, 0.55, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.chipGradient}
                      >
                        <Text style={[styles.chipText, styles.chipTextActive]}>{cat}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.chipInner}>
                        <Text style={styles.chipText}>{cat}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Price ── */}
          <View style={styles.section}>
            <Text style={styles.label}>Price</Text>
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
            <View style={[styles.priceRow, errors.price ? styles.inputError : null]}>
              <Text style={styles.priceDollar}>$</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
                value={price}
                onChangeText={(t) => {
                  setPrice(t);
                  if (errors.price) setErrors((e) => ({ ...e, price: undefined }));
                }}
                keyboardType="decimal-pad"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* ── Description ── */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Describe the condition, size, any defects…"
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Submit button */}
        <View style={styles.footer}>
          <AnimatedTouchable
            style={[styles.submitBtn, submitStyle]}
            activeOpacity={1}
            onPressIn={() => {
              submitScale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
            }}
            onPressOut={() => {
              submitScale.value = withSpring(1, { damping: 12, stiffness: 200 });
            }}
            onPress={handleSubmit}
          >
            <Ionicons name="pricetag-outline" size={18} color={Colors.white} />
            <Text style={styles.submitBtnText}>List Item</Text>
          </AnimatedTouchable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'android' ? Spacing.lg : Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.whiteAlpha15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  labelHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    marginTop: -2,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  imagesRow: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  imageTile: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  imageTileImg: {
    width: 80,
    height: 80,
  },
  removeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageTile: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addImageLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    ...Shadow.card,
  },
  inputError: {
    borderColor: Colors.error,
  },
  descriptionInput: {
    height: 100,
    paddingTop: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    ...Shadow.card,
  },
  priceDollar: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gold,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  chipsRow: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  chip: {
    borderRadius: Radius.full,
    ...Shadow.card,
  },
  chipActive: {
    shadowColor: Colors.blueDark,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  chipInner: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipGradient: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitBtn: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.md,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadow.button,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
