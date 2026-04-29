import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export default function Index() {
  const { userEmail, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.blueDark }}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  return <Redirect href={(userEmail ? '/(tabs)' : '/(auth)/login') as any} />;
}
