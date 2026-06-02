import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
;
import { api, endpoints } from '../../utils/api';
import { Colors } from '../../constants/colors';

export default function AdminDashboard() {
  const navigation = useNavigation();
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(endpoints.adminStats)
      .then((r) => { if (r.data.success) setStats(r.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const MENU = [
    { icon: 'people-outline',          label: 'Users',          sub: `${stats?.users?.total ?? 0} total`,   route: '/(admin)/users' },
    { icon: 'storefront-outline',      label: 'Vendors',        sub: `${stats?.vendors?.total ?? 0} total`,  route: '/(admin)/vendors' },
    { icon: 'pricetag-outline',        label: 'Offers',         sub: `${stats?.offers?.total ?? 0} total`,   route: '/(admin)/offers' },
    { icon: 'shield-checkmark-outline',label: 'Vendor Requests',sub: `${stats?.pendingVendors ?? 0} pending`,route: '/(admin)/vendors' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Panel</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading
        ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} />
        : <ScrollView contentContainerStyle={styles.scroll}>

            {/* Stats grid */}
            <View style={styles.grid}>
              {[
                { label: 'Total Users',    val: stats?.users?.total    ?? 0, icon: 'people-outline',     color: Colors.primary },
                { label: 'Active Vendors', val: stats?.vendors?.active ?? 0, icon: 'storefront-outline', color: Colors.accent },
                { label: 'Total Offers',   val: stats?.offers?.total   ?? 0, icon: 'pricetag-outline',   color: Colors.warning },
                { label: 'Revenue',        val: `₹${stats?.revenue ?? 0}`, icon: 'cash-outline',       color: Colors.dark },
              ].map(({ label, val, icon, color }) => (
                <View key={label} style={styles.statCard}>
                  <Ionicons name={icon as any} size={20} color={color} />
                  <Text style={[styles.statVal, { color }]}>{val}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              ))}
            </View>

            {/* Quick nav */}
            <Text style={styles.sectionTitle}>Manage</Text>
            {MENU.map(({ icon, label, sub, route }) => (
              <TouchableOpacity
                key={label}
                style={styles.menuItem}
                onPress={() => navigation.navigate(route as never)}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name={icon as any} size={20} color={Colors.primary} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>{label}</Text>
                  <Text style={styles.menuSub}>{sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </ScrollView>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.bg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                 padding: 16, paddingTop: 20 },
  title:       { fontSize: 18, fontWeight: '700', color: Colors.dark },
  scroll:      { padding: 16, paddingBottom: 30 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard:    { flex: 1, minWidth: '45%', backgroundColor: Colors.white,
                 borderRadius: 16, padding: 14, alignItems: 'flex-start',
                 shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                 shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  statVal:     { fontSize: 24, fontWeight: '800', marginTop: 8 },
  statLabel:   { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  sectionTitle:{ fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 12 },
  menuItem:    { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
                 borderRadius: 14, padding: 14, marginBottom: 10,
                 shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                 shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  menuIcon:    { width: 42, height: 42, borderRadius: 12,
                 backgroundColor: Colors.primary + '14',
                 alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuText:    { flex: 1 },
  menuLabel:   { fontSize: 14, fontWeight: '600', color: Colors.dark },
  menuSub:     { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
});
