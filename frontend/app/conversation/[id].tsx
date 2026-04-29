import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/auth';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import {
  Conversation,
  Message,
  getConversationById,
  getMessages,
  sendMessage,
} from '@/services/messages';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userEmail } = useAuth();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id || !userEmail) return;
    getConversationById(id, userEmail).then(setConversation);
    getMessages(id, userEmail).then(setMessages);
  }, [id, userEmail]);

  // Scroll to bottom when messages load or new ones arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !id || !userEmail) return;

    setInputText('');
    await sendMessage(id, userEmail, trimmed);
    const updated = await getMessages(id, userEmail);
    setMessages(updated);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  };

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Conversation not found</Text>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isUserBuyer = conversation.buyerEmail === userEmail;
  const otherName = isUserBuyer ? conversation.sellerName : conversation.buyerName;

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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={12}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarLetter}>
                {otherName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerName} numberOfLines={1}>
                {otherName}
              </Text>
              <Text style={styles.headerListing} numberOfLines={1}>
                {conversation.listingTitle}
              </Text>
            </View>
          </View>

          {/* Spacer to balance the back button */}
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Message list */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isMe = item.senderEmail === userEmail;
            return (
              <View style={[styles.bubbleRow, isMe ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
                {!isMe && (
                  <View style={styles.bubbleAvatar}>
                    <Text style={styles.bubbleAvatarLetter}>
                      {otherName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.bubbleColumn}>
                  <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
                      {item.text}
                    </Text>
                  </View>
                  <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeRight : styles.bubbleTimeLeft]}>
                    {formatTime(item.sentAt)}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <Text style={styles.emptyMessagesText}>
                Send a message to start the conversation
              </Text>
            </View>
          }
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            returnKeyType="default"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, inputText.trim().length === 0 && styles.sendBtnDisabled]}
            onPress={handleSend}
            activeOpacity={0.75}
            disabled={inputText.trim().length === 0}
          >
            <Ionicons name="send" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.blueDark,
  },
  flex: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'android' ? Spacing.lg : Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.whiteAlpha15,
    borderWidth: 1.5,
    borderColor: Colors.whiteAlpha60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarLetter: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  headerListing: {
    fontSize: 11,
    color: Colors.whiteAlpha60,
    marginTop: 1,
  },
  headerSpacer: {
    width: 30,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
    marginVertical: 2,
  },
  bubbleRowRight: {
    justifyContent: 'flex-end',
  },
  bubbleRowLeft: {
    justifyContent: 'flex-start',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 16, // aligns above timestamp
  },
  bubbleAvatarLetter: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  bubbleColumn: {
    maxWidth: '72%',
    gap: 3,
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadow.card,
  },
  bubbleMe: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.lg,
    borderBottomRightRadius: Radius.sm,
    alignSelf: 'flex-end',
  },
  bubbleThem: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderBottomLeftRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextMe: {
    color: Colors.white,
    fontWeight: '400',
  },
  bubbleTextThem: {
    color: Colors.textPrimary,
    fontWeight: '400',
  },
  bubbleTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  bubbleTimeRight: {
    textAlign: 'right',
  },
  bubbleTimeLeft: {
    textAlign: 'left',
    marginLeft: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    color: Colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    lineHeight: 21,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...Shadow.button,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  emptyMessages: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyMessagesText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.offWhite,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  backLink: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backLinkText: {
    fontSize: 15,
    color: Colors.blue,
    fontWeight: '600',
  },
});
