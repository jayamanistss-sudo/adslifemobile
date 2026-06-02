import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
;
import { api, endpoints } from '../../utils/api';
import { Colors } from '../../constants/colors';

interface DashData {
  vendor: any; stats: any; offers: any[];
  recentOffers: any[]; dailyTrend: any[];
}

export default function VendorDashboard() {
  const navigation = useNavigation();
  const [data, setData]         = useState<DashData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await api.get(endpoints.vendorDashboard);
      if (r.data.success) setData(r.data.data);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} />
    </SafeAreaView>
  );

  if (!data) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.error}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.errorText}>Failed to load dashboard</Text>
        <TouchableOpacity onPress={() => load()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const { vendor, stats, recentOffers } = data;

  const KPI = [
    { icon: 'eye-outline',       label: 'Impressions', val: stats.impressions ?? 0, trend: stats.impressions_trend },
    { icon: 'hand-left-outline', label: 'Clicks',      val: stats.clicks ?? 0,      trend: stats.clicks_trend },
    { icon: 'bookmark-outline',  label: 'Saves',       val: stats.saves ?? 0,       trend: stats.saves_trend },
    { icon: 'stats-chart-outline',label: 'Engagement', val: `${stats.engagement_rate ?? 0}%`, trend: null },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.bizName}>{vendor.business_name}</Text>
            <Text style={styles.bizMeta}>{vendor.city} · {vendor.status} · {vendor.plan_name} plan</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('EditVendorProfile' as never)}>
            <Ionicons name="settings-outline" size={20} color={Colors.dark} />
          </TouchableOpacity>
        </View>

        {/* Follower count */}
        <View style={styles.followerBanner}>
          <Ionicons name="people-outline" size={16} color={Colors.primary} />
          <Text style={styles.followerText}>{vendor.total_followers} subscribers</Text>
          <Text style={styles.slotText}>{data.offers?.length ?? 0}/{vendor.plan_max_offers} offer slots used</Text>
        </View>

        {/* KPI grid */}
        <View style={styles.kpiGrid}>
          {KPI.map(({ icon, label, val, trend }) => (
            <View key={label} style={styles.kpiCard}>
              <Ionicons name={icon as any} size={20} color={Colors.primary} />
              <Text style={styles.kpiVal}>{val}</Text>
              <Text style={styles.kpiLabel}>{label}</Text>
              {trend != null && (
                <Text style={[styles.kpiTrend, Number(trend) >= 0 && styles.kpiTrendUp]}>
                  {Number(trend) >= 0 ? '↑' : '↓'} {Math.abs(Number(trend))}%
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <View style={styles.actionsRow}>
          {[
            { icon: 'add-circle-outline',  label: 'Add Offer',  onPress: () => navigation.navigate('VendorOffers' as never) },
            { icon: 'list-outline',         label: 'My Offers',  onPress: () => navigation.navigate('VendorOffers' as never) },
            { icon: 'bar-chart-outline',    label: 'Analytics',  onPress: () => navigation.navigate('VendorAnalytics' as never) },
            { icon: 'person-outline',       label: 'Profile',    onPress: () => navigation.navigate('EditVendorProfile' as never) },
          ].map(({ icon, label, onPress }) => (
            <TouchableOpacity key={label} style={styles.actionBtn} onPress={onPress}>
              <View style={styles.actionIcon}>
                <Ionicons name={icon as any} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent offers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Offers</Text>
            <TouchableOpacity onPress={() => navigation.navigate('VendorOffers' as never)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {(recentOffers ?? []).slice(0, 5).map((o: any) => (
            <View key={o.id} style={styles.offerRow}>
              <View style={styles.offerInfo}>
                <Text style={styles.offerTitle} numberOfLines={1}>{o.title}</Text>
                <Text style={styles.offerMeta}>{o.views ?? 0} views · {o.clicks ?? 0} clicks · {o.saves ?? 0} saves</Text>
              </View>
              <View style={[styles.activeChip, !o.is_active && styles.inactiveChip]}>
                <Text style={[styles.activeText, !o.is_active && styles.inactiveText]}>
                  {o.is_active ? 'Active' : 'Off'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  header:       { flexDirection: 'row', justifyContent: 'space-between',
                  alignItems: 'flex-start', padding: 16, paddingTop: 20 },
  bizName:      { fontSize: 20, fontWeight: '700', color: Colors.dark },
  bizMeta:      { fontSize: 12, color: Colors.textMuted, marginTop: 3, textTransform: 'capitalize' },
  settingsBtn:  { width: 38, height: 38, borderRadius: 10,
                  backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  followerBanner: { flexDirection: 'row', alignItems: 'center', gap: 8,
                    marginHorizontal: 16, backgroundColor: Colors.primary + '12',
                    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  followerText: { fontSize: 13, fontWeight: '600', color: Colors.primary, flex: 1 },
  slotText:     { fontSize: 12, color: Colors.textSecondary },
  kpiGrid:      { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 14 },
  kpiCard:      { flex: 1, minWidth: '45%', backgroundColor: Colors.white, borderRadius: 16,
                  padding: 16, alignItems: 'flex-start',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  kpiVal:       { fontSize: 24, fontWeight: '800', color: Colors.dark, marginTop: 8 },
  kpiLabel:     { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  kpiTrend:     { fontSize: 11, fontWeight: '600', color: Colors.danger, marginTop: 2 },
  kpiTrendUp:   { color: Colors.accent },
  actionsRow:   { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 14 },
  actionBtn:    { flex: 1, alignItems: 'center', gap: 6 },
  actionIcon:   { width: 48, height: 48, borderRadius: 14,
                  backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  actionLabel:  { fontSize: 10, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },
  section:      { marginHorizontal: 16, marginBottom: 20 },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  seeAll:       { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  offerRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
                  borderRadius: 12, padding: 12, marginBottom: 8,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  offerInfo:    { flex: 1 },
  offerTitle:   { fontSize: 13, fontWeight: '600', color: Colors.dark },
  offerMeta:    { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  activeChip:   { backgroundColor: Colors.accent + '22', borderRadius: 6,
                  paddingHorizontal: 8, paddingVertical: 3 },
  inactiveChip: { backgroundColor: Colors.textMuted + '22' },
  activeText:   { fontSize: 10, fontWeight: '700', color: Colors.accent },
  inactiveText: { color: Colors.textMuted },
  error:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText:    { fontSize: 15, color: Colors.textSecondary, marginTop: 12 },
  retryBtn:     { marginTop: 16, backgroundColor: Colors.primary,
                  paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryText:    { color: Colors.white, fontWeight: '600' },
});
