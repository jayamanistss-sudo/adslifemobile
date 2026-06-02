import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
;
import { api, endpoints } from '../../utils/api';
import { Colors } from '../../constants/colors';

export default function VendorAnalytics() {
  const navigation = useNavigation();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(endpoints.audienceAnalytics)
      .then((r) => { if (r.data.success) setData(r.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Summary cards */}
        <View style={styles.grid}>
          {[
            { label: 'Impressions', val: data?.total_impressions ?? 0, icon: 'eye-outline' },
            { label: 'Clicks',      val: data?.total_clicks      ?? 0, icon: 'hand-left-outline' },
            { label: 'Saves',       val: data?.total_saves       ?? 0, icon: 'bookmark-outline' },
            { label: 'Engagement',  val: `${data?.engagement_rate ?? 0}%`, icon: 'stats-chart-outline' },
          ].map(({ label, val, icon }) => (
            <View key={label} style={styles.card}>
              <Ionicons name={icon as any} size={20} color={Colors.primary} />
              <Text style={styles.cardVal}>{val}</Text>
              <Text style={styles.cardLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Top cities */}
        {(data?.top_cities ?? []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Cities</Text>
            {data.top_cities.slice(0, 8).map((c: any, i: number) => (
              <View key={c.city ?? i} style={styles.cityRow}>
                <Text style={styles.cityName}>{c.city ?? 'Unknown'}</Text>
                <View style={styles.barWrap}>
                  <View style={[styles.bar, { width: `${Math.min(100, (c.count / data.top_cities[0].count) * 100)}%` }]} />
                </View>
                <Text style={styles.cityCount}>{c.count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Device breakdown */}
        {data?.device_breakdown && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Breakdown</Text>
            {Object.entries(data.device_breakdown).map(([key, val]) => (
              <View key={key} style={styles.deviceRow}>
                <Ionicons
                  name={key === 'mobile' ? 'phone-portrait-outline' : key === 'desktop' ? 'desktop-outline' : 'tablet-portrait-outline'}
                  size={16}
                  color={Colors.primary}
                />
                <Text style={styles.deviceLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <Text style={styles.deviceVal}>{val as number}%</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.bg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                 padding: 16, paddingTop: 20 },
  title:       { fontSize: 18, fontWeight: '700', color: Colors.dark },
  scroll:      { padding: 16, paddingBottom: 30 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  card:        { flex: 1, minWidth: '45%', backgroundColor: Colors.white,
                 borderRadius: 16, padding: 14, alignItems: 'flex-start',
                 shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                 shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardVal:     { fontSize: 22, fontWeight: '800', color: Colors.dark, marginTop: 8 },
  cardLabel:   { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  section:     { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12,
                 shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                 shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle:{ fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 14 },
  cityRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cityName:    { width: 80, fontSize: 12, color: Colors.text },
  barWrap:     { flex: 1, height: 8, backgroundColor: Colors.bg, borderRadius: 4, overflow: 'hidden', marginHorizontal: 8 },
  bar:         { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  cityCount:   { fontSize: 12, fontWeight: '600', color: Colors.primary, width: 30, textAlign: 'right' },
  deviceRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8,
                 borderBottomWidth: 1, borderBottomColor: Colors.border },
  deviceLabel: { flex: 1, fontSize: 13, color: Colors.text },
  deviceVal:   { fontSize: 13, fontWeight: '700', color: Colors.primary },
});
