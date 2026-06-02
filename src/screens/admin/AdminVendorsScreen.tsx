import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
;
import { api, endpoints } from '../../utils/api';
import { Colors } from '../../constants/colors';

export default function AdminVendors() {
  const navigation = useNavigation();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  const load = () => {
    setLoading(true);
    api.get(`${endpoints.adminVendors}?status=${filter === 'all' ? '' : filter}`)
      .then((r) => { if (r.data.success) setVendors(r.data.data?.vendors ?? r.data.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleReview = (id: number, status: 'approved' | 'rejected') => {
    Alert.alert(`${status === 'approved' ? 'Approve' : 'Reject'} Vendor?`, '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: status === 'rejected' ? 'destructive' : 'default',
        onPress: async () => {
          await api.put(endpoints.adminReviewVendor(id), { status }).catch(() => {});
          setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status } : v));
        }},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Vendors</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Filter tabs */}
      <View style={styles.filters}>
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        : <FlatList
            data={vendors}
            keyExtractor={(v) => String(v.id)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.name}>{item.business_name}</Text>
                    <Text style={styles.meta}>{item.city} · {item.category}</Text>
                    <Text style={styles.email}>{item.user_name} · {item.user_email}</Text>
                  </View>
                  <View style={[styles.statusBadge,
                    item.status === 'approved' && styles.statusApproved,
                    item.status === 'rejected' && styles.statusRejected,
                  ]}>
                    <Text style={[styles.statusText,
                      item.status === 'approved' && { color: Colors.accent },
                      item.status === 'rejected' && { color: Colors.danger },
                    ]}>{item.status}</Text>
                  </View>
                </View>

                {item.status === 'pending' && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleReview(item.id, 'approved')}
                    >
                      <Ionicons name="checkmark" size={14} color={Colors.white} />
                      <Text style={styles.actionBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleReview(item.id, 'rejected')}
                    >
                      <Ionicons name="close" size={14} color={Colors.white} />
                      <Text style={styles.actionBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="storefront-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No vendors</Text>
              </View>
            }
          />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.bg },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                   padding: 16, paddingTop: 20 },
  title:         { fontSize: 18, fontWeight: '700', color: Colors.dark },
  filters:       { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  filterBtn:     { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
                   backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  filterBtnActive:{ backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText:    { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive:{ color: Colors.white },
  list:          { padding: 16, paddingBottom: 30 },
  card:          { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10,
                   shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                   shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardHeader:    { flexDirection: 'row', alignItems: 'flex-start' },
  cardInfo:      { flex: 1 },
  name:          { fontSize: 14, fontWeight: '700', color: Colors.dark },
  meta:          { fontSize: 12, color: Colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  email:         { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  statusBadge:   { backgroundColor: Colors.textMuted + '22', borderRadius: 8,
                   paddingHorizontal: 8, paddingVertical: 3 },
  statusApproved:{ backgroundColor: Colors.accent + '22' },
  statusRejected:{ backgroundColor: Colors.danger + '22' },
  statusText:    { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textTransform: 'capitalize' },
  actions:       { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                   gap: 5, paddingVertical: 8, borderRadius: 10 },
  approveBtn:    { backgroundColor: Colors.accent },
  rejectBtn:     { backgroundColor: Colors.danger },
  actionBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  empty:         { alignItems: 'center', paddingTop: 60 },
  emptyText:     { fontSize: 15, color: Colors.textSecondary, marginTop: 12 },
});
