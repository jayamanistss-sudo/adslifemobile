import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { api, endpoints } from '../../utils/api';
import { useUserStore } from '../../store/useUserStore';
import { Colors } from '../../constants/colors';

export default function Login() {
  const navigation = useNavigation();
  const { setUser } = useUserStore();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(endpoints.login, { email: email.trim(), password });
      if (res.data.success) {
        const { user, token } = res.data.data;
        await setUser({
          id: user.id, name: user.name, email: user.email, role: user.role,
          city: user.city, avatar_url: user.avatar_url,
          streak_days: Number(user.streak_days) || 0,
        }, token);
        navigation.reset({index:0,routes:[{name:'Main'}]});
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.error ?? 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.appName}>AdsLife</Text>
          <Text style={styles.tagline}>Discover · Earn · Win</Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {/* Email */}
        <View style={styles.inputBox}>
          <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        {/* Password */}
        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.icon} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            autoComplete="password"
          />
          <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
            <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Login button */}
        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.btnText}>Sign In</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>No account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
            <Text style={styles.link}>Sign up free</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flexGrow: 1, backgroundColor: Colors.white, padding: 24, paddingTop: 60 },
  header:     { alignItems: 'center', marginBottom: 40 },
  logoBox:    { width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.primary,
                alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText:   { color: Colors.white, fontSize: 28, fontWeight: '800' },
  appName:    { fontSize: 24, fontWeight: '800', color: Colors.dark },
  tagline:    { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  title:      { fontSize: 26, fontWeight: '700', color: Colors.dark, marginBottom: 6 },
  subtitle:   { fontSize: 14, color: Colors.textSecondary, marginBottom: 28 },
  inputBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg,
                borderWidth: 1, borderColor: Colors.border, borderRadius: 14,
                paddingHorizontal: 14, marginBottom: 14, height: 52 },
  icon:       { marginRight: 10 },
  input:      { flex: 1, fontSize: 15, color: Colors.text },
  eyeBtn:     { padding: 4 },
  btn:        { backgroundColor: Colors.primary, borderRadius: 14, height: 52,
                alignItems: 'center', justifyContent: 'center', marginTop: 8,
                shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  btnDisabled:{ opacity: 0.7 },
  btnText:    { color: Colors.white, fontSize: 16, fontWeight: '700' },
  footer:     { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: Colors.textSecondary },
  link:       { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
