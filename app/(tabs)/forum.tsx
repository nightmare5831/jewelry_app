import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { router, useLocalSearchParams } from 'expo-router';
import { messageApi, QAMessage } from '../../services/api';

export default function Forum() {
  const { sellerId, sellerName } = useLocalSearchParams<{ sellerId: string; sellerName: string }>();
  const { currentUser, authToken } = useAppStore();
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [answeringId, setAnsweringId] = useState<number | null>(null);

  const sellerIdNum = sellerId ? parseInt(sellerId, 10) : null;
  const decodedSellerName = sellerName ? decodeURIComponent(sellerName) : 'Vendedor';

  useEffect(() => {
    if (sellerIdNum) {
      loadMessages();
    }
  }, [sellerIdNum]);

  const loadMessages = async () => {
    if (!authToken || !sellerIdNum) return;
    try {
      setLoading(true);
      const data = await messageApi.getBySeller(authToken, sellerIdNum);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
      Alert.alert('Erro', 'Não foi possível carregar as perguntas');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCreateQuestion = async () => {
    if (!newQuestionText.trim() || !authToken || !sellerIdNum) return;
    try {
      await messageApi.createQuestion(authToken, sellerIdNum, newQuestionText);
      setNewQuestionText('');
      setShowNewQuestion(false);
      Alert.alert('Sucesso', 'Pergunta enviada com sucesso!');
      loadMessages();
    } catch (error) {
      console.error('Failed to create question:', error);
      Alert.alert('Erro', 'Não foi possível enviar a pergunta');
    }
  };

  const handleAnswer = async (messageId: number) => {
    if (!answerText.trim() || !authToken) return;
    try {
      await messageApi.answerQuestion(authToken, messageId, answerText);
      setAnswerText('');
      setAnsweringId(null);
      Alert.alert('Sucesso', 'Resposta enviada com sucesso!');
      loadMessages();
    } catch (error) {
      console.error('Failed to answer:', error);
      Alert.alert('Erro', 'Não foi possível enviar a resposta');
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!authToken) return;
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta pergunta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await messageApi.delete(authToken, messageId);
              Alert.alert('Sucesso', 'Pergunta excluída com sucesso!');
              loadMessages();
            } catch (error) {
              console.error('Failed to delete:', error);
              Alert.alert('Erro', 'Não foi possível excluir a pergunta');
            }
          },
        },
      ]
    );
  };

  const isCurrentUserSeller = currentUser?.id === sellerIdNum;

  if (!sellerIdNum) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perguntas</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyStateTitle}>Vendedor não encontrado</Text>
          <Text style={styles.emptyStateText}>Volte para a página do produto</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perguntas para {decodedSellerName}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>Nenhuma pergunta ainda</Text>
            <Text style={styles.emptyStateText}>Seja o primeiro a fazer uma pergunta!</Text>
          </View>
        ) : (
          messages.map((message) => (
            <View key={message.id} style={styles.qaCard}>
              {/* Question */}
              <View style={styles.questionSection}>
                <View style={styles.qaHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {message.from_user_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.qaHeaderInfo}>
                    <Text style={styles.userName}>{message.from_user_name}</Text>
                    <Text style={styles.timestamp}>{message.created_at}</Text>
                  </View>
                  {message.from_user_id === currentUser?.id && (
                    <TouchableOpacity onPress={() => handleDelete(message.id)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.questionText}>{message.question}</Text>
              </View>

              {/* Answer */}
              {message.answer ? (
                <View style={styles.answerSection}>
                  <View style={styles.qaHeader}>
                    <View style={[styles.avatar, styles.sellerAvatar]}>
                      <Text style={styles.avatarText}>
                        {message.to_user_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.qaHeaderInfo}>
                      <Text style={styles.userName}>{message.to_user_name}</Text>
                      <Text style={styles.timestamp}>{message.answered_at}</Text>
                    </View>
                  </View>
                  <Text style={styles.answerText}>{message.answer}</Text>
                </View>
              ) : isCurrentUserSeller ? (
                answeringId === message.id ? (
                  <View style={styles.answerInputSection}>
                    <TextInput
                      style={styles.answerInput}
                      placeholder="Digite sua resposta..."
                      value={answerText}
                      onChangeText={setAnswerText}
                      multiline
                      maxLength={1000}
                    />
                    <View style={styles.answerActions}>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => { setAnsweringId(null); setAnswerText(''); }}
                      >
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.sendBtn, !answerText.trim() && styles.sendBtnDisabled]}
                        onPress={() => handleAnswer(message.id)}
                        disabled={!answerText.trim()}
                      >
                        <Text style={styles.sendBtnText}>Responder</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.answerBtn}
                    onPress={() => setAnsweringId(message.id)}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color="#2563eb" />
                    <Text style={styles.answerBtnText}>Responder</Text>
                  </TouchableOpacity>
                )
              ) : (
                <View style={styles.pendingAnswer}>
                  <Text style={styles.pendingAnswerText}>Aguardando resposta do vendedor...</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* New Question Modal */}
      {showNewQuestion && (
        <View style={styles.newQuestionContainer}>
          <View style={styles.newQuestionHeader}>
            <Text style={styles.newQuestionTitle}>Nova Pergunta</Text>
            <TouchableOpacity onPress={() => setShowNewQuestion(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.newQuestionInput}
            placeholder="Digite sua pergunta..."
            value={newQuestionText}
            onChangeText={setNewQuestionText}
            multiline
            maxLength={1000}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.postButton, !newQuestionText.trim() && styles.postButtonDisabled]}
            onPress={handleCreateQuestion}
            disabled={!newQuestionText.trim()}
          >
            <Text style={styles.postButtonText}>Enviar Pergunta</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Create Question Button */}
      {!isCurrentUserSeller && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowNewQuestion(true)}
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  qaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  questionSection: {
    marginBottom: 12,
  },
  qaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sellerAvatar: {
    backgroundColor: '#10b981',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  qaHeaderInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  deleteBtn: {
    padding: 8,
  },
  questionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  answerSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  answerText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  pendingAnswer: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  pendingAnswerText: {
    fontSize: 13,
    color: '#92400e',
    fontStyle: 'italic',
  },
  answerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 8,
  },
  answerBtnText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  answerInputSection: {
    marginTop: 12,
  },
  answerInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  answerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#6b7280',
  },
  sendBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sendBtnDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendBtnText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  newQuestionContainer: {
    position: 'absolute',
    bottom: 80,
    left: '5%',
    right: '5%',
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  newQuestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  newQuestionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  newQuestionInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  postButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
