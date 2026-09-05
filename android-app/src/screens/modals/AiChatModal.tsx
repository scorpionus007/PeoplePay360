import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { ModalSheet } from '../../components/common/ModalSheet';
import { LucideIcon } from '../../icons/LucideIcon';
import { useApp } from '../../context/AppContext';
import { aiAssistantService } from '../../api/services';
import { AiChatMessage } from '../../types';

export const AiChatModal: React.FC = () => {
  const { activeModal, closeModal } = useApp();
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'm-01',
      sender: 'assistant',
      text: 'Hello Aryan! I am your PeoplePay360 assistant. Ask me anything about your salary advance limit, leave balances, tax rules, or IT devices.',
      timestamp: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const quickPrompts = [
    'How does salary advance work?',
    'What is my leave balance?',
    'Explain my tax deductions',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    const userMsg: AiChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const reply = await aiAssistantService.askQuestion(query);
      const botMsg: AiChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ModalSheet
      visible={activeModal === 'ai'}
      onClose={closeModal}
      title="PeoplePay AI Assistant"
      subtitle="Instant 24/7 answers for payroll, benefits, and HR operations"
      maxHeightPercent={92}
    >
      <View style={styles.container}>
        {/* Quick prompt chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promptChipsRow}
        >
          {quickPrompts.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.promptChip}
              onPress={() => handleSend(p)}
              activeOpacity={0.7}
            >
              <Text style={styles.promptChipText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chat History */}
        <View style={styles.messagesWrapper}>
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <View
                key={m.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.messageRowUser : styles.messageRowBot,
                ]}
              >
                {!isUser && (
                  <View style={styles.botIconCircle}>
                    <LucideIcon name="sparkles" size={14} color={colors.primary600} />
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.bubbleUser : styles.bubbleBot,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.textUser : styles.textBot,
                    ]}
                  >
                    {m.text}
                  </Text>
                </View>
              </View>
            );
          })}

          {isTyping && (
            <View style={[styles.messageRow, styles.messageRowBot]}>
              <View style={styles.botIconCircle}>
                <LucideIcon name="sparkles" size={14} color={colors.primary600} />
              </View>
              <View style={[styles.messageBubble, styles.bubbleBot, styles.typingBubble]}>
                <ActivityIndicator size="small" color={colors.primary600} />
                <Text style={styles.typingText}>PeoplePay assistant is thinking...</Text>
              </View>
            </View>
          )}
        </View>

        {/* Input Bar */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            value={inputVal}
            onChangeText={setInputVal}
            placeholder="Ask about salary, leaves, IT..."
            placeholderTextColor={colors.ink400}
            selectionColor={colors.primary600}
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => handleSend()}
            disabled={!inputVal.trim() || isTyping}
            activeOpacity={0.8}
          >
            <LucideIcon name="send" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  promptChipsRow: {
    gap: 8,
    marginBottom: 16,
    paddingRight: 8,
  },
  promptChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.primary50,
    borderWidth: 1,
    borderColor: colors.primary100,
  },
  promptChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary700,
  },
  messagesWrapper: {
    gap: 12,
    marginBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  botIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: colors.ink950,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#F3F4FA',
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  typingText: {
    fontSize: 12,
    color: colors.ink500,
    fontStyle: 'italic',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
  },
  textUser: {
    color: colors.white,
  },
  textBot: {
    color: colors.ink950,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#D8DBEA',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 8,
  },
  chatInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink950,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
