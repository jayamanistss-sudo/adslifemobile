import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
;
import Ionicons from 'react-native-vector-icons/Ionicons';
import { api, endpoints } from '../../utils/api';
import { useUserStore } from '../../store/useUserStore';
import { Colors } from '../../constants/colors';

export default function Register() {
  const navigation = useNavigation();
  const { setUser } = useUserStore();
  const [form, setForm]       = useState({ name: '', email: '', password: '', city: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const upd = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      Alert.alert('Error', 'Name, email and password are required');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(endpoints.register, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        city: form.city.trim() || undefined,
      });
      if (res.data.success) {
        const { user, token } = res.data.data;
        await setUser({
          id: user.id, name: user.name, email: user.email, role: user.role, city: user.city,
        }, token);
        navigation.reset({index:0,routes:[{name:'Main'}]});
      }
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.error ?? 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join AdsLife — it's free</Text>

        {[
          { key: 'name',     placeholder: 'Full name',    icon: 'person-outline',       keyboard: 'default' as const },
          { key: 'email',    placeholder: 'Email',        icon: 'mail-outline',         keyboard: 'email-address' as const },
          { key: 'city',     placeholder: 'City (optional)', icon: 'location-outline',  keyboard: 'default' as const },
        ].map(({ key, placeholder, icon, keyboard }) => (
          <View key={key} style={styles.inputBox}>
            <Ionicons name={icon as any} size={18} color={Colors.textMuted} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={Colors.textMuted}
              value={form[key as keyof typeof form]}
              onChangeText={(v) => upd(key as keyof typeof form, v)}
              keyboardType={keyboard}
              autoCapitalize={key === 'email' ? 'none' : 'words'}
            />
          </View>
        ))}

        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.icon} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password (min 6 chars)"
            placeholderTextColor={Colors.textMuted}
            value={form.password}
            onChangeText={(v) => upd('password', v)}
            secureTextEntry={!showPw}
          />
          <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
            <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Auth' as never)}>
            <Text style={styles.link}>Sign in</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flexGrow: 1, backgroundColor: Colors.white, padding: 24, paddingTop: 60 },
  back:       { marginBottom: 24 },
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
