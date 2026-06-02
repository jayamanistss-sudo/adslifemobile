import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
;
import { api, endpoints } from '../../utils/api';
import { Colors } from '../../constants/colors';

export default function AdminUsers() {
  const navigation = useNavigation();
  const [users, setUsers]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);

  const load = (p = 1, q = search) => {
    setLoading(true);
    api.get(`${endpoints.adminUsers}?page=${p}&search=${encodeURIComponent(q)}&limit=20`)
      .then((r) => {
        if (r.data.success) {
          const list = r.data.data?.users ?? r.data.data ?? [];
          setUsers(p === 1 ? list : (prev: any[]) => [...prev, ...list]);
          setPage(p);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const handleBan = (u: any) => {
    Alert.alert(`${u.is_active ? 'Ban' : 'Unban'} User`, `${u.is_active ? 'Ban' : 'Unban'} ${u.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: 'destructive', onPress: async () => {
          await api.put(`${endpoints.adminUsers}/${u.id}`, { action: u.is_active ? 'ban' : 'unban' }).catch(() => {});
          setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, is_active: x.is_active ? 0 : 1 } : x));
        }},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Users</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={(v) => { setSearch(v); load(1, v); }}
          placeholder="Search users..."
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(u) => String(u.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() ?? 'U'}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <View style={styles.badges}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{item.role}</Text>
                  </View>
                  {!item.is_active && (
                    <View style={styles.bannedBadge}>
                      <Text style={styles.bannedText}>Banned</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.banBtn, !item.is_active && styles.unbanBtn]}
              onPress={() => handleBan(item)}
            >
              <Ionicons
                name={item.is_active ? 'ban-outline' : 'checkmark-circle-outline'}
                size={16}
                color={item.is_active ? Colors.danger : Colors.accent}
              />
            </TouchableOpacity>
          </View>
        )}
        onEndReached={() => load(page + 1)}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loading ? <ActivityIndicator color={Colors.primary} style={{ margin: 20 }} /> : null}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.bg },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                padding: 16, paddingTop: 20 },
  title:      { fontSize: 18, fontWeight: '700', color: Colors.dark },
  searchBox:  { flexDirection: 'row', alignItems: 'center', gap: 10,
                margin: 16, backgroundColor: Colors.white, borderRadius: 12,
                paddingHorizontal: 14, height: 44,
                shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  searchInput:{ flex: 1, fontSize: 14, color: Colors.text },
  list:       { paddingHorizontal: 16, paddingBottom: 30 },
  card:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
                borderRadius: 12, padding: 12, marginBottom: 8,
                shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  cardLeft:   { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary,
                alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  info:       { flex: 1 },
  name:       { fontSize: 13, fontWeight: '600', color: Colors.dark },
  email:      { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  badges:     { flexDirection: 'row', gap: 6, marginTop: 4 },
  roleBadge:  { backgroundColor: Colors.primary + '20', borderRadius: 5,
                paddingHorizontal: 6, paddingVertical: 2 },
  roleText:   { fontSize: 9, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase' },
  bannedBadge:{ backgroundColor: Colors.danger + '20', borderRadius: 5,
                paddingHorizontal: 6, paddingVertical: 2 },
  bannedText: { fontSize: 9, fontWeight: '700', color: Colors.danger },
  banBtn:     { width: 34, height: 34, borderRadius: 10,
                backgroundColor: Colors.danger + '14',
                alignItems: 'center', justifyContent: 'center' },
  unbanBtn:   { backgroundColor: Colors.accent + '14' },
  empty:      { alignItems: 'center', paddingTop: 60 },
  emptyText:  { fontSize: 15, color: Colors.textSecondary, marginTop: 12 },
});
