import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/auth';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { Conversation, getConversations } from '@/services/messages';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── ConversationRow ──────────────────────────────────────────────────────────

type ConversationRowProps = {
  conversation: Conversation;
  userEmail: string;
  onPress: () => void;
};

function ConversationRow({ conversation: c, userEmail, onPress }: ConversationRowProps) {
  const isUserBuyer = c.buyerEmail === userEmail;
  const otherName = isUserBuyer ? c.sellerName : c.buyerName;
  const avatarLetter = otherName.charAt(0).toUpperCase();
  const hasUnread = c.unreadCount > 0;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarLetter}>{avatarLetter}</Text>
      </View>

      {/* Content */}
      <View style={styles.rowContent}>
        <View style={styles.rowTopLine}>
          <Text style={styles.otherName} numberOfLines={1}>
            {otherName}
          </Text>
          <Text style={styles.timestamp}>{formatRelativeTime(c.lastMessageAt)}</Text>
        </View>
        <Text style={styles.listingTitle} numberOfLines={1}>
          {c.listingTitle}
        </Text>
        <Text
          style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
          numberOfLines={1}
        >
          {c.lastMessage || 'Tap to start the conversation'}
        </Text>
      </View>

      {/* Unread badge */}
      {hasUnread && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{c.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MessagesScreen() {
  const { userEmail } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (userEmail) {
      getConversations(userEmail).then(setConversations);
    }
  }, [userEmail]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (userEmail) {
        getConversations(userEmail).then(setConversations);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [userEmail]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.blueLight, Colors.blue, Colors.blueDark]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="chatbubble" size={22} color={Colors.goldLight} />
            <Text style={styles.headerTitle}>
              Spartan <Text style={styles.headerTitleAccent}>Messages</Text>
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Conversation list */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : undefined}
        renderItem={({ item }) => (
          <ConversationRow
            conversation={item}
            userEmail={userEmail ?? ''}
            onPress={() => router.push(`/conversation/${item.id}` as any)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Tap &quot;Contact Seller&quot; on any listing to start a conversation
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.blueDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'android' ? Spacing.lg : Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  headerTitleAccent: {
    color: Colors.goldLight,
  },
  list: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  otherName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textMuted,
    flexShrink: 0,
  },
  listingTitle: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '400',
  },
  lastMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  lastMessageUnread: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    flexShrink: 0,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 76, // aligns with content, clears avatar
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
