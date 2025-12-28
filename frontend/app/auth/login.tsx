import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const params = useLocalSearchParams();
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType] = useState<string>((params.userType as string) || 'user');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogin = async () => {
    if (!mobile && !email) {
      Alert.alert('Error', 'Please enter mobile number or email');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter password');
      return;
    }

    try {
      await login(email || mobile, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Error', error.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => router.push('/auth')}
                style={styles.backButtonContainer}
              >
                <Text style={styles.backButton}>← Back</Text>
              </TouchableOpacity>
              
              <View style={styles.logoContainer}>
                <View style={styles.logoBadge}>
                  <Text style={styles.logo}>🏥</Text>
                </View>
              </View>

              <View style={styles.headerText}>
                <Text style={styles.mainTitle}>SmartHealth</Text>
                <Text style={styles.subtitle}>Your health companion, anytime.</Text>
                <Text style={styles.userTypeTag}>{userType.charAt(0).toUpperCase() + userType.slice(1)}</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.form, { opacity: fadeAnim }]}>
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Mobile Number</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your mobile number"
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                  value={mobile}
                  onChangeText={setMobile}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.labelRow}>
                <Text style={styles.sectionLabel}>Password</Text>
                <TouchableOpacity onPress={() => Alert.alert('Reset password', 'Password reset flow not implemented')}>
                  <Text style={styles.forgotPassword}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword((s) => !s)} 
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
              onPress={handleLogin} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/auth/register-type')}>
                <Text style={styles.registerLink}> Create one</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FF'
  },
  content: { 
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 32,
  },
  header: { 
    alignItems: 'center',
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButton: { 
    color: '#5B5FFF', 
    fontSize: 16,
    fontWeight: '600',
  },
  logoContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#5B5FFF',
    opacity: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: { 
    fontSize: 40,
  },
  headerText: {
    alignItems: 'center',
  },
  mainTitle: { 
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  userTypeTag: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#5B5FFF',
    opacity: 0.15,
    borderRadius: 8,
    color: '#5B5FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  form: { 
    marginTop: 16,
  },
  formSection: {
    marginBottom: 18,
  },
  sectionLabel: { 
    fontSize: 13,
    color: '#333',
    marginBottom: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E4FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFF',
    height: 48,
    shadowColor: '#5B5FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E4FF',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#999',
    fontSize: 12,
  },
  eyeButton: { 
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eyeText: { 
    color: '#5B5FFF',
    fontSize: 18,
  },
  forgotPassword: { 
    color: '#5B5FFF', 
    fontSize: 12,
    fontWeight: '600',
  },
  loginButton: { 
    backgroundColor: '#5B5FFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#5B5FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: { 
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  registerContainer: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: { 
    color: '#888',
    fontSize: 13,
  },
  registerLink: { 
    color: '#5B5FFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
