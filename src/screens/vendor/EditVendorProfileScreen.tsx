import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
;
import { api, endpoints } from '../../utils/api';
import { Colors } from '../../constants/colors';

export default function EditVendorProfile() {
  const navigation = useNavigation();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({
    business_name: '', category: '', city: '', address: '',
    phone: '', website: '', description: '', gst_number: '',
  });

  useEffect(() => {
    api.get(endpoints.vendorProfile)
      .then((r) => {
        if (r.data.success) {
          const p = r.data.data;
          setForm({
            business_name: p.business_name ?? '',
            category:      p.category ?? '',
            city:          p.city ?? '',
            address:       p.address ?? '',
            phone:         p.phone ?? '',
            website:       p.website ?? '',
            description:   p.description ?? '',
            gst_number:    p.gst_number ?? '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upd = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.business_name.trim()) { Alert.alert('Error', 'Business name is required'); return; }
    setSaving(true);
    try {
      const res = await api.put(endpoints.vendorUpdateProfile, form);
      if (res.data.success) { Alert.alert('Success', 'Profile updated'); navigation.goBack(); }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error ?? 'Failed to update');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} />
    </SafeAreaView>
  );

  const FIELDS = [
    { key: 'business_name', label: 'Business Name *', placeholder: 'My Business' },
    { key: 'category',      label: 'Category',        placeholder: 'food-dining' },
    { key: 'city',          label: 'City',            placeholder: 'Chennai' },
    { key: 'address',       label: 'Address',         placeholder: 'Full address', multi: true },
    { key: 'phone',         label: 'Phone',           placeholder: '+91 9876543210', keyboard: 'phone-pad' as const },
    { key: 'website',       label: 'Website',         placeholder: 'https://yoursite.com', keyboard: 'url' as const },
    { key: 'description',   label: 'Description',     placeholder: 'Tell customers about your business…', multi: true },
    { key: 'gst_number',    label: 'GST Number',      placeholder: '33AABCU9603R1ZJ' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator size="small" color={Colors.white} />
            : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {FIELDS.map(({ key, label, placeholder, multi, keyboard }) => (
          <View key={key} style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={[styles.input, multi && styles.inputMulti]}
              value={form[key as keyof typeof form]}
              onChangeText={(v) => upd(key as keyof typeof form, v)}
              placeholder={placeholder}
              placeholderTextColor={Colors.textMuted}
              multiline={multi}
              numberOfLines={multi ? 3 : 1}
              keyboardType={keyboard ?? 'default'}
              autoCapitalize={key === 'website' || key === 'gst_number' ? 'none' : 'sentences'}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.white },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                padding: 16, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title:      { fontSize: 18, fontWeight: '700', color: Colors.dark },
  saveBtn:    { backgroundColor: Colors.primary, borderRadius: 10,
                paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText:{ color: Colors.white, fontWeight: '700' },
  scroll:     { padding: 16, paddingBottom: 40 },
  field:      { marginBottom: 16 },
  label:      { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  input:      { backgroundColor: Colors.bg, borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 12,
                fontSize: 14, color: Colors.text,
                borderWidth: 1, borderColor: Colors.border },
  inputMulti: { height: 88, textAlignVertical: 'top' },
});
