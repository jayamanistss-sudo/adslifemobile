import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, Switch, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
;
import { api, endpoints } from '../../utils/api';
import { useUserStore } from '../../store/useUserStore';
import { Colors } from '../../constants/colors';

export default function Profile() {
  const navigation = useNavigation();
  const { user, logout, setUser } = useUserStore();
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [darkMode, setDarkMode]   = useState(false);
  const [form, setForm]           = useState({
    name:  user?.name  ?? '',
    city:  user?.city  ?? '',
  });

  const upd = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Name is required'); return; }
    setSaving(true);
    try {
      const res = await api.put(endpoints.updateProfile, {
        name: form.name.trim(), city: form.city.trim() || undefined,
      });
      if (res.data.success && user) {
        const token = (await import('@react-native-async-storage/async-storage')).default
          .getItem('adslife_token');
        await setUser({ ...user, name: form.name.trim(), city: form.city.trim() }, await token ?? '');
        setEditing(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error ?? 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
          await logout();
          navigation.reset({index:0,routes:[{name:'Auth'}]});
        }},
    ]);
  };

  const MENU_ITEMS = [
    ...(user?.role === 'vendor' || user?.role === 'admin'
      ? [{ icon: 'storefront-outline', label: 'Vendor Dashboard', onPress: () => navigation.navigate('VendorDashboard' as never) }]
      : []),
    ...(user?.role === 'admin'
      ? [{ icon: 'shield-checkmark-outline', label: 'Admin Panel', onPress: () => navigation.navigate('AdminDashboard' as never) }]
      : []),
    { icon: 'bookmark-outline',       label: 'Saved Offers',     onPress: () => navigation.navigate('Saved' as never) },
    { icon: 'trophy-outline',         label: 'Leaderboard',      onPress: () => navigation.navigate('Leaderboard' as never) },
    { icon: 'notifications-outline',  label: 'Notifications',    onPress: () => navigation.navigate('Notifications' as never) },
    { icon: 'log-out-outline',        label: 'Sign Out',         onPress: handleLogout, danger: true },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => editing ? handleSave() : setEditing(true)}
          >
            {saving
              ? <ActivityIndicator size="small" color={Colors.primary} />
              : <Ionicons name={editing ? 'checkmark' : 'pencil-outline'} size={18} color={Colors.primary} />
            }
          </TouchableOpacity>
        </View>

        {/* Avatar + info */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarBox}>
            {user?.avatar_url
              ? <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
              : <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</Text>
                </View>
            }
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role}</Text>
            </View>
          </View>

          {editing ? (
            <View style={styles.editForm}>
              {[
                { key: 'name', placeholder: 'Full name', icon: 'person-outline' },
                { key: 'city', placeholder: 'City',      icon: 'location-outline' },
              ].map(({ key, placeholder, icon }) => (
                <View key={key} style={styles.inputBox}>
                  <Ionicons name={icon as any} size={16} color={Colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={form[key as keyof typeof form]}
                    onChangeText={(v) => upd(key as keyof typeof form, v)}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              ))}
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {user?.city ? <Text style={styles.userCity}>📍 {user.city}</Text> : null}
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Streak', value: `${user?.streak_days ?? 0}🔥`, sub: 'days' },
            { label: 'Coins', value: user?.coins ?? 0, sub: 'earned' },
          ].map(({ label, value, sub }) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statSub}>{sub}</Text>
            </View>
          ))}
        </View>

        {/* Dark mode toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Ionicons name="moon-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.toggleLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            thumbColor={darkMode ? Colors.primary : Colors.white}
            trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
          />
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU_ITEMS.map(({ icon, label, onPress, danger }) => (
            <TouchableOpacity key={label} style={styles.menuItem} onPress={onPress}>
              <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
                <Ionicons name={icon as any} size={18} color={danger ? Colors.danger : Colors.primary} />
              </View>
              <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
              {!danger && <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>AdsLife v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  scroll:       { padding: 16, paddingBottom: 40 },
  header:       { flexDirection: 'row', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 20 },
  title:        { fontSize: 22, fontWeight: '700', color: Colors.dark },
  editBtn:      { width: 36, height: 36, borderRadius: 10,
                  backgroundColor: Colors.primary + '18',
                  alignItems: 'center', justifyContent: 'center' },
  avatarSection:{ backgroundColor: Colors.white, borderRadius: 20,
                  padding: 20, marginBottom: 14, alignItems: 'center',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  avatarBox:    { position: 'relative', marginBottom: 14 },
  avatar:       { width: 80, height: 80, borderRadius: 40 },
  avatarFallback: { width: 80, height: 80, borderRadius: 40,
                    backgroundColor: Colors.primary,
                    alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 32, fontWeight: '800', color: Colors.white },
  roleBadge:    { position: 'absolute', bottom: -4, right: -4,
                  backgroundColor: Colors.dark, borderRadius: 8,
                  paddingHorizontal: 7, paddingVertical: 2 },
  roleText:     { fontSize: 9, fontWeight: '700', color: Colors.white, textTransform: 'uppercase' },
  userInfo:     { alignItems: 'center' },
  userName:     { fontSize: 18, fontWeight: '700', color: Colors.dark },
  userEmail:    { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  userCity:     { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  editForm:     { width: '100%', gap: 8 },
  inputBox:     { flexDirection: 'row', alignItems: 'center', gap: 10,
                  backgroundColor: Colors.bg, borderRadius: 12,
                  paddingHorizontal: 12, height: 46,
                  borderWidth: 1, borderColor: Colors.border },
  input:        { flex: 1, fontSize: 14, color: Colors.text },
  cancelBtn:    { alignItems: 'center', paddingVertical: 8 },
  cancelText:   { color: Colors.textSecondary, fontSize: 13 },
  statsRow:     { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard:     { flex: 1, backgroundColor: Colors.white, borderRadius: 16,
                  padding: 16, alignItems: 'center',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  statValue:    { fontSize: 22, fontWeight: '800', color: Colors.primary },
  statLabel:    { fontSize: 12, fontWeight: '700', color: Colors.dark, marginTop: 4 },
  statSub:      { fontSize: 10, color: Colors.textMuted },
  toggleRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: Colors.white, borderRadius: 14,
                  padding: 16, marginBottom: 14,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  toggleLeft:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleLabel:  { fontSize: 14, fontWeight: '600', color: Colors.text },
  menu:         { backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  menuItem:     { flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 16, paddingVertical: 15,
                  borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon:     { width: 34, height: 34, borderRadius: 10,
                  backgroundColor: Colors.primary + '14',
                  alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuIconDanger:{ backgroundColor: Colors.danger + '14' },
  menuLabel:    { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.text },
  menuLabelDanger:{ color: Colors.danger },
  version:      { textAlign: 'center', fontSize: 11, color: Colors.textMuted, marginTop: 24 },
});
