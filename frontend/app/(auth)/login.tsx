import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, userEmail } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [highlightField, setHighlightField] = useState<
    "email" | "password" | "confirmPassword" | null
  >(null);

  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (userEmail) {
      router.replace("/(tabs)");
    }
  }, [router, userEmail]);

  // Button press animation
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

  // Mode-switch transition
  const formOpacity = useSharedValue(1);
  const formTranslateY = useSharedValue(0);
  const animatedForm = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  function switchMode() {
    setIsSignUp((v) => !v);
    setError("");
    setResetSent(false);
    setHighlightField(null);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  function handleToggleMode() {
    formOpacity.value = withTiming(0, { duration: 150 });
    formTranslateY.value = withTiming(-10, { duration: 150 });
    setTimeout(() => {
      switchMode();
      formTranslateY.value = 10;
      formOpacity.value = withTiming(1, { duration: 200 });
      formTranslateY.value = withSpring(0, { damping: 14, stiffness: 180 });
    }, 150);
  }

  async function handleLogin() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith("@sjsu.edu")) {
      setHighlightField("email");
      setError("Please use your SJSU email address (@sjsu.edu).");
      return;
    }
    if (!password.trim()) {
      setHighlightField("password");
      setError("Please enter your password.");
      return;
    }
    if (isSignUp && password.length < 6) {
      setHighlightField("password");
      setError("Password must be at least 6 characters.");
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setHighlightField("confirmPassword");
      setError("Passwords do not match.");
      return;
    }
    setHighlightField(null);
    setError("");
    setIsLoading(true);
    const errorMsg = isSignUp
      ? await signUp(trimmed, password)
      : await signIn(trimmed, password);
    setIsLoading(false);
    if (errorMsg) setError(errorMsg);
  }

  async function handleForgotPassword() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith("@sjsu.edu")) {
      setHighlightField("email");
      setError("Enter your @sjsu.edu email above first.");
      return;
    }
    setIsResetLoading(true);
    setError("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      trimmed,
      {
        redirectTo: Linking.createURL("reset-password"),
      },
    );
    setIsResetLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setResetSent(true);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setError("");
    try {
      const redirectTo = Linking.createURL("auth/callback");

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: { hd: "sjsu.edu" },
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        return;
      }
      if (!data.url) {
        setError("Could not initiate Google sign-in.");
        return;
      }

      Alert.alert(
        "Debug",
        `redirectTo: ${redirectTo}\n\nOAuth URL: ${data.url.slice(0, 120)}…`,
      );
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (result.type === "cancel") return;
      if (result.type !== "success") {
        setError("Google sign-in failed. Please try again.");
        return;
      }

      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(result.url);
      if (exchangeError) {
        setError(exchangeError.message);
        return;
      }

      // Enforce @sjsu.edu domain
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email?.endsWith("@sjsu.edu")) {
        await supabase.auth.signOut();
        setError("Only @sjsu.edu Google accounts are permitted.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#050D1A", "#091E3A", "#0A3060", "#0055A2"]}
        locations={[0, 0.3, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      {/* Hero section */}
      <View style={styles.hero}>
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
        <LinearGradient
          colors={["#FFFFFF", "#F4F7FC"]}
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
        />

        <View style={styles.cardContent}>
          {/* Animated form area */}
          <Animated.View style={animatedForm}>
            <Text style={styles.cardTitle}>
              {isSignUp ? "Create Account" : "Sign In"}
            </Text>
            <Text style={styles.cardSubtitle}>
              {isSignUp
                ? "Sign up with your SJSU email to join the marketplace"
                : "Use your SJSU email and password to get started"}
            </Text>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>SJSU Email</Text>
              <TextInput
                style={[
                  styles.input,
                  highlightField === "email" ? styles.inputError : null,
                ]}
                placeholder="yourname@sjsu.edu"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) {
                    setError("");
                    setHighlightField(null);
                  }
                }}
                onSubmitEditing={() => passwordRef.current?.focus()}
                returnKeyType="next"
                textContentType="username"
              />
            </View>

            {/* Password */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputRow,
                  highlightField === "password" ? styles.inputError : null,
                ]}
              >
                <TextInput
                  ref={passwordRef}
                  style={styles.inputInner}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) {
                      setError("");
                      setHighlightField(null);
                    }
                  }}
                  onSubmitEditing={() =>
                    isSignUp
                      ? confirmPasswordRef.current?.focus()
                      : handleLogin()
                  }
                  returnKeyType={isSignUp ? "next" : "go"}
                  textContentType="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot password — sign-in only */}
            {!isSignUp && (
              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
                style={styles.forgotWrapper}
                disabled={isResetLoading}
              >
                <Text style={styles.forgotText}>
                  {isResetLoading ? "Sending…" : "Forgot password?"}
                </Text>
              </TouchableOpacity>
            )}

            {resetSent && !isSignUp && (
              <View style={styles.resetSuccessBox}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color="#1A7A4A"
                />
                <Text style={styles.resetSuccessText}>
                  Reset link sent — check your SJSU email.
                </Text>
              </View>
            )}

            {/* Confirm Password — sign-up only */}
            {isSignUp && (
              <View style={styles.fieldWrapper}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputRow,
                    highlightField === "confirmPassword"
                      ? styles.inputError
                      : null,
                  ]}
                >
                  <TextInput
                    ref={confirmPasswordRef}
                    style={styles.inputInner}
                    placeholder="Re-enter your password"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (error) {
                        setError("");
                        setHighlightField(null);
                      }
                    }}
                    onSubmitEditing={handleLogin}
                    returnKeyType="go"
                    textContentType="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword((v) => !v)}
                    style={styles.eyeBtn}
                    activeOpacity={0.7}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color={Colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </Animated.View>

          {/* Submit button */}
          <Pressable
            onPress={handleLogin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isLoading || isGoogleLoading}
          >
            <Animated.View style={[styles.buttonWrapper, animatedButton]}>
              <LinearGradient
                colors={[Colors.goldLight, Colors.gold, Colors.goldDark]}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                {isLoading ? (
                  <ActivityIndicator color="#1A0F00" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isSignUp ? "Create Account →" : "Continue →"}
                  </Text>
                )}
              </LinearGradient>
            </Animated.View>
          </Pressable>

          {/* OR divider */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          {/* Google sign-in button */}
          <TouchableOpacity
            style={[
              styles.googleBtn,
              isGoogleLoading && styles.googleBtnDisabled,
            ]}
            onPress={handleGoogleSignIn}
            activeOpacity={0.85}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color={Colors.textSecondary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={18} color="#EA4335" />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Access restricted to SJSU students, faculty, and staff.
          </Text>

          <TouchableOpacity
            onPress={handleToggleMode}
            activeOpacity={0.7}
            style={styles.toggleWrapper}
          >
            <Text style={styles.toggleText}>
              {isSignUp ? "Already have an account? " : "New here? "}
              <Text style={styles.toggleLink}>
                {isSignUp ? "Sign In" : "Create account"}
              </Text>
            </Text>
          </TouchableOpacity>
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
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    marginTop: Spacing.lg,
  },
  fieldWrapper: {
    marginTop: Spacing.md,
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.offWhite,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    paddingHorizontal: Spacing.md,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    paddingLeft: Spacing.sm,
    paddingVertical: 4,
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
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  orText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  googleBtnDisabled: {
    opacity: 0.6,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: Spacing.lg,
    lineHeight: 16,
  },
  toggleWrapper: {
    alignItems: "center",
    marginTop: Spacing.md,
  },
  toggleText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  toggleLink: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.blue,
  },
  forgotWrapper: {
    alignSelf: "flex-end",
    marginTop: Spacing.sm,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.blue,
  },
  resetSuccessBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    backgroundColor: "#EDFAF3",
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#A8E6C3",
  },
  resetSuccessText: {
    fontSize: 13,
    color: "#1A7A4A",
    fontWeight: "500",
    flex: 1,
  },
});
