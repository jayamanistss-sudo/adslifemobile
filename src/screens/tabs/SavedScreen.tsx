import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { api, endpoints } from '../../utils/api';
import { useUserStore } from '../../store/useUserStore';
import OfferCard from '../../components/OfferCard';
import { Colors } from '../../constants/colors';
import type { Offer } from '../../types';

export default function Saved() {
  const { user } = useUserStore();
  const [offers, setOffers]   = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get(`/feed/saved-offers`)
      .then((r) => { if (r.data.success) setOffers(r.data.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Offers</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{offers.length}</Text>
        </View>
      </View>

      {loading
        ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        : <FlatList
            data={offers}
            keyExtractor={(o) => String(o.id)}
            renderItem={({ item }) => <OfferCard offer={item} />}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="bookmark-outline" size={52} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No saved offers</Text>
                <Text style={styles.emptyText}>Tap the bookmark icon on any offer to save it</Text>
              </View>
            }
          />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.bg },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 10,
                padding: 16, paddingTop: 20 },
  title:      { fontSize: 22, fontWeight: '700', color: Colors.dark },
  countBadge: { backgroundColor: Colors.primary, borderRadius: 8,
                paddingHorizontal: 8, paddingVertical: 3 },
  countText:  { color: Colors.white, fontSize: 12, fontWeight: '700' },
  list:       { paddingHorizontal: 16, paddingBottom: 20 },
  empty:      { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary, marginTop: 14 },
  emptyText:  { fontSize: 13, color: Colors.textMuted, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
});
