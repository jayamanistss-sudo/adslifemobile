import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { api, endpoints } from '../../utils/api';
import { useUserStore } from '../../store/useUserStore';
import { Colors } from '../../constants/colors';

interface LeaderEntry {
  rank: number;
  user_id: number;
  name: string;
  avatar_url?: string;
  city?: string;
  coins: number;
  streak_days: number;
}

const PERIODS = [
  { key: 'weekly',  label: 'Week' },
  { key: 'monthly', label: 'Month' },
  { key: 'alltime', label: 'All Time' },
];

const MEDAL = ['🥇','🥈','🥉'];

export default function Leaderboard() {
  const { user } = useUserStore();
  const [period, setPeriod] = useState('monthly');
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(endpoints.leaderboard(period))
      .then((r) => { if (r.data.success) setEntries(r.data.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const myRank = entries.find((e) => e.user_id === user?.id);

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Leaderboard</Text>
      <Text style={styles.subtitle}>Top earners on AdsLife</Text>

      {/* Period tabs */}
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* My rank sticky */}
      {myRank && (
        <View style={styles.myRankCard}>
          <Text style={styles.myRankLabel}>Your Rank</Text>
          <View style={styles.myRankRow}>
            <Text style={styles.myRankNum}>#{myRank.rank}</Text>
            <Ionicons name="trophy" size={16} color={Colors.warning} />
            <Text style={styles.myRankCoins}>{myRank.coins} coins</Text>
          </View>
        </View>
      )}

      {loading
        ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        : <FlatList
            data={entries}
            keyExtractor={(e) => String(e.user_id)}
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => (
              <View style={[styles.row, item.user_id === user?.id && styles.rowMe]}>
                <Text style={styles.rank}>
                  {index < 3 ? MEDAL[index] : `#${item.rank}`}
                </Text>
                {item.avatar_url
                  ? <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
                  : <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={styles.avatarText}>{item.name[0]}</Text>
                    </View>
                }
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.city}>{item.city ?? 'India'}</Text>
                </View>
                <View style={styles.right}>
                  <Text style={styles.coins}>{item.coins}</Text>
                  <Text style={styles.coinsLabel}>coins</Text>
                  {item.streak_days > 0 && (
                    <View style={styles.streak}>
                      <Text style={styles.streakText}>🔥 {item.streak_days}d</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="trophy-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No entries yet</Text>
              </View>
            }
          />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  title:        { fontSize: 22, fontWeight: '700', color: Colors.dark, marginLeft: 16, marginTop: 20 },
  subtitle:     { fontSize: 13, color: Colors.textMuted, marginLeft: 16, marginBottom: 16 },
  periodRow:    { flexDirection: 'row', marginHorizontal: 16, gap: 8, marginBottom: 14 },
  periodBtn:    { flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  periodBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  periodText:   { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  periodTextActive: { color: Colors.white },
  myRankCard:   { marginHorizontal: 16, backgroundColor: Colors.primary + '12',
                  borderRadius: 12, padding: 12, marginBottom: 10,
                  borderWidth: 1, borderColor: Colors.primary + '30' },
  myRankLabel:  { fontSize: 11, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  myRankRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  myRankNum:    { fontSize: 18, fontWeight: '800', color: Colors.primary },
  myRankCoins:  { fontSize: 14, color: Colors.dark, fontWeight: '600' },
  list:         { paddingHorizontal: 16, paddingBottom: 20 },
  row:          { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
                  borderRadius: 14, padding: 12, marginBottom: 8,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  rowMe:        { borderWidth: 1.5, borderColor: Colors.primary + '40', backgroundColor: Colors.primary + '06' },
  rank:         { width: 36, fontSize: 16, textAlign: 'center', fontWeight: '700' },
  avatar:       { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  avatarFallback: { backgroundColor: Colors.primary + '22', alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 16, fontWeight: '800', color: Colors.primary },
  info:         { flex: 1 },
  name:         { fontSize: 14, fontWeight: '600', color: Colors.dark },
  city:         { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  right:        { alignItems: 'flex-end' },
  coins:        { fontSize: 16, fontWeight: '800', color: Colors.primary },
  coinsLabel:   { fontSize: 10, color: Colors.textMuted },
  streak:       { backgroundColor: Colors.warning + '22', borderRadius: 6,
                  paddingHorizontal: 6, paddingVertical: 2, marginTop: 3 },
  streakText:   { fontSize: 10, fontWeight: '600', color: Colors.warning },
  empty:        { alignItems: 'center', paddingTop: 60 },
  emptyText:    { fontSize: 15, color: Colors.textSecondary, marginTop: 12 },
});
