import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
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
import { getMyListings } from '@/services/listings';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ProfileScreen() {
  const { userEmail, profilePicture, signOut, updateEmail, updateProfilePicture } = useAuth();
  const [listingCount, setListingCount] = useState(0);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [draftEmail, setDraftEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const signOutScale = useSharedValue(1);
  const signOutStyle = useAnimatedStyle(() => ({
    transform: [{ scale: signOutScale.value }],
  }));

  useFocusEffect(
    useCallback(() => {
      if (!userEmail) return;
      getMyListings(userEmail).then((listings) => setListingCount(listings.length));
    }, [userEmail])
  );

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to change your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      updateProfilePicture(result.assets[0].uri);
    }
  }

  function openEmailModal() {
    setDraftEmail(userEmail ?? '');
    setEmailError('');
    setEmailModalVisible(true);
  }

  async function handleSaveEmail() {
    if (!draftEmail.endsWith('@sjsu.edu')) {
      setEmailError('Email must end with @sjsu.edu');
      return;
    }
    const success = await updateEmail(draftEmail.trim().toLowerCase());
    if (success) setEmailModalVisible(false);
  }

  function handleSignOut() {
    signOut();
    router.replace('/(auth)/login' as any);
  }

  const avatarLetter = userEmail ? userEmail[0].toUpperCase() : '?';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Gradient header */}
      <LinearGradient
        colors={[Colors.blueLight, Colors.blue, Colors.blueDark]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              My <Text style={styles.headerTitleAccent}>Profile</Text>
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {userEmail}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Avatar card */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickImage} activeOpacity={0.85}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetter}>{avatarLetter}</Text>
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={14} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.7}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Account info card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Account Info</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="mail-outline" size={18} color={Colors.blue} />
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoRowLabel}>Email</Text>
                <Text style={styles.infoRowValue} numberOfLines={1}>{userEmail}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={openEmailModal} activeOpacity={0.7} style={styles.editBtn}>
              <Ionicons name="create-outline" size={20} color={Colors.blue} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Activity</Text>
          <View style={styles.statRow}>
            <Ionicons name="pricetag-outline" size={22} color={Colors.blue} />
            <Text style={styles.statLabel}>Active Listings</Text>
            <Text style={styles.statValue}>{listingCount}</Text>
          </View>
        </View>

        {/* Sign out */}
        <AnimatedTouchable
          style={[styles.signOutBtn, signOutStyle]}
          activeOpacity={1}
          onPressIn={() => { signOutScale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); }}
          onPressOut={() => { signOutScale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.white} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </AnimatedTouchable>
      </View>

      {/* Email edit modal */}
      <Modal
        visible={emailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEmailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Email</Text>
            <Text style={styles.modalSubtitle}>Must be an @sjsu.edu address</Text>

            <TextInput
              style={[styles.modalInput, emailError ? styles.modalInputError : null]}
              value={draftEmail}
              onChangeText={(t) => { setDraftEmail(t); setEmailError(''); }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@sjsu.edu"
              placeholderTextColor={Colors.textMuted}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEmailModalVisible(false)}
                activeOpacity={0.75}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveEmail}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[Colors.blue, Colors.blueDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveBtnGradient}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.blueDark,
  },
  header: {
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
  content: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.card,
  },
  cardLabel: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    borderColor: Colors.gold,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.blue,
    borderWidth: 2.5,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -1,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.blue,
    letterSpacing: 0.2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoRowLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  infoRowValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  editBtn: {
    padding: Spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: Spacing.sm,
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.gold,
    letterSpacing: -0.5,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.error,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    ...Shadow.button,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 40, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  modalInputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadow.button,
  },
  saveBtnGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
  },
});
