import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/auth';
import { WishlistProvider } from '@/context/wishlist';

export default function RootLayout() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="light" />
      </WishlistProvider>
    </AuthProvider>
  );
}
