import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterDetail3() {
  const handleConfirm = () => {
    // TODO: Submit registration data to API
    Alert.alert(
      'Cadastro Concluído',
      'Seu cadastro foi realizado com sucesso!',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Concluindo cadastro</Text>
          </View>

          {/* Icons */}
          <View style={styles.iconsContainer}>
            <View style={styles.iconWrapper}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.plusText}>+</Text>
            <View style={styles.iconWrapper}>
              <Image
                source={require('../../assets/buyer.png')}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Progress Stepper */}
          <View style={styles.stepperTop}>
            <View style={styles.stepConnector}>
              <View style={[styles.stepDotLarge, styles.stepDotCompleted]} />
              <View style={[styles.stepLine, styles.stepLineCompleted]} />
              <View style={[styles.stepDotLarge, styles.stepDotCompleted]} />
              <View style={[styles.stepLine, styles.stepLineCompleted]} />
              <View style={[styles.stepDotLarge, styles.stepDotCompleted]} />
              <View style={[styles.stepLine, styles.stepLineCompleted]} />
              <View style={[styles.stepDotLarge, styles.stepDotActive]} />
            </View>
            <View style={styles.stepLabelsRow}>
              <Text style={styles.stepLabelTop}>Dados{'\n'}básicos</Text>
              <Text style={styles.stepLabelTop}>Sobre a{'\n'}empresa</Text>
              <Text style={styles.stepLabelTop}>Dados{'\n'}adicionais</Text>
              <Text style={[styles.stepLabelTop, styles.stepLabelActive]}>Confirmação</Text>
            </View>
          </View>

          {/* Data Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>CPF: </Text>
              112.958.447-02{'\n\n'}

              <Text style={styles.summaryLabel}>Data de nascimento: </Text>
              28/05/1987{'\n\n'}

              <Text style={styles.summaryLabel}>Nome completo: </Text>
              GABRIEL CAVALCANTE FURTADO{'\n\n'}

              <Text style={styles.summaryLabel}>E-mail de acesso: </Text>
              me@gabrielfurtado.co{'\n\n'}

              <Text style={styles.summaryLabel}>Telefone: </Text>
              (22) 98104-1700{'\n\n'}

              <Text style={styles.summaryLabel}>CNPJ: </Text>
              35.502.867/0001-20{'\n\n'}

              <Text style={styles.summaryLabel}>Razão social: </Text>
              35.502.867 GABRIEL CAVALCANTE FURTADO{'\n\n'}

              <Text style={styles.summaryLabel}>Nome fantasia: </Text>
              Gabriel Furtado{'\n\n'}

              <Text style={styles.summaryLabel}>Telefone da empresa: </Text>
              (22) 98104-1700{'\n\n'}

              <Text style={styles.summaryLabel}>E-mail da empresa: </Text>
              me@gabrielfurtado.co{'\n\n'}

              <Text style={styles.summaryLabel}>Faturamento mensal: </Text>
              R$ 7.000,00{'\n\n'}

              <Text style={styles.summaryLabel}>Endereço: </Text>
              ESPIRITO SANTO, 386, EXTENSAO DO BOSQUE, Rio das Ostras, RJ - CEP: 28893-316
            </Text>
          </View>
        </ScrollView>

        {/* Footer with Confirm Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleConfirm}
          >
            <Text style={styles.primaryButtonText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#071327',
    marginLeft: 12,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  iconWrapper: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 70,
    height: 70,
  },
  plusText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    marginHorizontal: 20,
  },
  stepperTop: {
    marginBottom: 40,
  },
  stepConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepDotLarge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D9D9D9',
  },
  stepLine: {
    width: 50,
    height: 3,
    backgroundColor: '#D9D9D9',
  },
  stepLineActive: {
    backgroundColor: '#000000',
  },
  stepLineCompleted: {
    backgroundColor: '#000000',
  },
  stepLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  stepLabelTop: {
    fontSize: 11,
    fontWeight: '400',
    color: '#757575',
    textAlign: 'center',
    flex: 1,
  },
  stepDotActive: {
    backgroundColor: '#000000',
  },
  stepDotCompleted: {
    backgroundColor: '#000000',
  },
  stepLabelActive: {
    color: '#000000',
    fontWeight: '700',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    padding: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  summaryLabel: {
    fontWeight: '700',
    color: '#071327',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 20,
  },
  primaryButton: {
    backgroundColor: '#000000',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
