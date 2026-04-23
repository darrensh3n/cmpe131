import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, userEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (userEmail) {
      router.replace("/(tabs)");
    }
  }, [userEmail]);

  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);

  const animatedButton = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
  }));

  function handlePressIn() {
    buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    buttonOpacity.value = withSpring(0.9);
  }

  function handlePressOut() {
    buttonScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    buttonOpacity.value = withSpring(1);
  }

  function handleLogin() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith("@sjsu.edu")) {
      setError("Please use your SJSU email address (@sjsu.edu).");
      return;
    }
    setError("");
    signIn(trimmed);
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Full-screen deep gradient background */}
      <LinearGradient
        colors={["#050D1A", "#091E3A", "#0A3060", "#0055A2"]}
        locations={[0, 0.3, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative depth circles */}
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      {/* Hero section */}
      <View style={styles.hero}>
        {/* Spartan OG logo in gold circle ring */}
        <View style={styles.logoRingOuter}>
          <View style={styles.logoRing}>
            <Image
              source={require("../../brand_assets/spartanOG.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text style={styles.titleTop}>Spartan</Text>
        <Text style={styles.titleBottom}>Marketplace</Text>

        {/* Gold divider */}
        <LinearGradient
          colors={["transparent", Colors.gold, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.divider}
        />

        <Text style={styles.university}>San José State University</Text>
      </View>

      {/* Bottom card */}
      <View style={styles.card}>
        {/* Card inner gradient for depth */}
        <LinearGradient
          colors={["#FFFFFF", "#F4F7FC"]}
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
        />

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSubtitle}>
            Use your SJSU email to get started
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>SJSU Email</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="yourname@sjsu.edu"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError("");
              }}
              onSubmitEditing={handleLogin}
              returnKeyType="go"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Animated gold gradient button */}
          <Pressable
            onPress={handleLogin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Animated.View style={[styles.buttonWrapper, animatedButton]}>
              <LinearGradient
                colors={[Colors.goldLight, Colors.gold, Colors.goldDark]}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Continue →</Text>
              </LinearGradient>
            </Animated.View>
          </Pressable>

          <Text style={styles.disclaimer}>
            Access restricted to SJSU students, faculty, and staff.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#050D1A",
  },

  // Decorative background circles for depth
  circleTopRight: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.blue,
    opacity: 0.15,
    top: -80,
    right: -80,
  },
  circleBottomLeft: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.gold,
    opacity: 0.06,
    bottom: 200,
    left: -60,
  },

  // Hero
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  logoRingOuter: {
    width: 136,
    height: 136,
    borderRadius: 44,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 20,
    marginBottom: Spacing.lg,
  },
  logoRing: {
    width: 136,
    height: 136,
    borderRadius: 44,
    backgroundColor: "#FFFFFF",
    borderWidth: 2.5,
    borderColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  logoImage: {
    width: 132,
    height: 132,
  },
  titleTop: {
    fontSize: 42,
    fontWeight: "700",
    color: Colors.white,
    letterSpacing: 1,
    textAlign: "center",
  },
  titleBottom: {
    fontSize: 28,
    fontWeight: "400",
    color: Colors.goldLight,
    letterSpacing: 0.5,
    textAlign: "center",
    marginTop: 2,
  },
  divider: {
    width: 160,
    height: 1.5,
    marginVertical: Spacing.md,
  },
  university: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.5,
    textAlign: "center",
    textTransform: "uppercase",
  },

  // Card
  card: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  cardContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },

  // Input
  inputWrapper: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.offWhite,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: Spacing.sm,
    lineHeight: 16,
  },

  // Button
  buttonWrapper: {
    marginTop: Spacing.lg,
    borderRadius: Radius.md,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  button: {
    borderRadius: Radius.md,
    paddingVertical: 17,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A0F00",
    letterSpacing: 0.5,
  },

  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: Spacing.lg,
    lineHeight: 16,
  },
});
