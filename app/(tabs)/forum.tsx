import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { router } from 'expo-router';
import FABMenu from '../../components/FABMenu';

export default function Forum() {
  const { currentUser } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    // Navigate based on user role
    if (currentUser?.role === 'seller') {
      router.push('/(tabs)/seller-dashboard');
    } else {
      router.push('/(tabs)');
    }
  };

  // Mock conversations for demo
  const conversations = [
    {
      id: '1',
      name: 'João Silva',
      role: 'buyer',
      lastMessage: 'Obrigado pela informação!',
      timestamp: '10:30',
      unread: 2,
      online: true,
    },
    {
      id: '2',
      name: 'Maria Santos',
      role: 'seller',
      lastMessage: 'O produto está disponível?',
      timestamp: 'Ontem',
      unread: 0,
      online: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fórum</Text>
        <View style={styles.backButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info Banner */}
        <View style={styles.userBanner}>
          <View style={styles.userBannerContent}>
            <Ionicons
              name={currentUser?.role === 'seller' ? 'storefront' : 'cart'}
              size={24}
              color="#2563eb"
            />
            <View style={styles.userBannerText}>
              <Text style={styles.userBannerTitle}>
                {currentUser?.role === 'seller' ? 'Vendedor' : 'Comprador'}
              </Text>
              <Text style={styles.userBannerSubtitle}>
                Conecte-se com {currentUser?.role === 'seller' ? 'compradores' : 'vendedores'}
              </Text>
            </View>
          </View>
        </View>

        {/* Conversations List */}
        <View style={styles.conversationsContainer}>
          <Text style={styles.sectionTitle}>Mensagens</Text>

          {conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateTitle}>Nenhuma conversa</Text>
              <Text style={styles.emptyStateText}>
                Suas conversas aparecerão aqui
              </Text>
            </View>
          ) : (
            conversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.id}
                style={styles.conversationCard}
                onPress={() => {
                  Alert.alert('Em breve', 'Funcionalidade de chat será implementada em breve');
                }}
              >
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {conversation.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  {conversation.online && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>{conversation.name}</Text>
                    <Text style={styles.conversationTime}>{conversation.timestamp}</Text>
                  </View>
                  <View style={styles.conversationFooter}>
                    <Text
                      style={styles.conversationMessage}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {conversation.lastMessage}
                    </Text>
                    {conversation.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{conversation.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>Dicas</Text>
          <View style={styles.tipCard}>
            <Ionicons name="shield-checkmark" size={24} color="#16a34a" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Comunicação Segura</Text>
              <Text style={styles.tipText}>
                Mantenha todas as negociações dentro da plataforma
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="time" size={24} color="#2563eb" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Responda Rapidamente</Text>
              <Text style={styles.tipText}>
                Respostas rápidas aumentam a confiança
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FAB Menu - Back to Main and Logout */}
      <FABMenu mode="forum" />
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  userBanner: {
    backgroundColor: '#eff6ff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  userBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userBannerText: {
    flex: 1,
  },
  userBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 2,
  },
  userBannerSubtitle: {
    fontSize: 13,
    color: '#3b82f6',
  },
  conversationsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16a34a',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  conversationTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  unreadBadge: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
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
  tipsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#6b7280',
  },
});
