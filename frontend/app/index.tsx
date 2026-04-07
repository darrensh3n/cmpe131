import { Redirect } from "expo-router";

import { useAuth } from "@/context/auth";

export default function Index() {
  const { userEmail } = useAuth();
  return <Redirect href={userEmail ? "/(tabs)" : "/(auth)/login"} />;
}
