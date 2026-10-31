import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }
    setError('');
    setLoading(true);
    // TODO: gọi API /auth/login ở bước sau. Hiện tại chạy chế độ demo.
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Home');
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.wrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🚑</Text>
          </View>
          <Text style={styles.brand}>SmartEMS Driver</Text>
          <Text style={styles.tagline}>Ứng dụng dành cho tài xế & nhân viên y tế</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng nhập</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="taixe@smartems.vn"
              placeholderTextColor="#aaa"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="••••••••"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity style={styles.eye} onPress={() => setShowPass(!showPass)}>
                <Text style={styles.eyeText}>{showPass ? 'Ẩn' : 'Hiện'}</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.demo}>Chế độ demo: nhập email và mật khẩu bất kỳ</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#D32F2F' },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  wrap: { width: '100%', maxWidth: 420, alignItems: 'center' },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  logoIcon: { fontSize: 44 },
  brand: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4, marginBottom: 26, textAlign: 'center' },
  card: {
    width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 18 },
  label: { fontSize: 13, color: '#666', fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FAFAFA',
    borderRadius: 12, paddingVertical: 13, paddingHorizontal: 14, fontSize: 16, marginBottom: 14,
  },
  passRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  eye: { marginLeft: 10, paddingVertical: 12, paddingHorizontal: 8 },
  eyeText: { color: '#D32F2F', fontWeight: '600' },
  error: { color: '#D32F2F', marginBottom: 10, fontSize: 13 },
  button: {
    backgroundColor: '#D32F2F', borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  demo: { textAlign: 'center', color: 'rgba(255,255,255,0.75)', marginTop: 18, fontSize: 12 },
});