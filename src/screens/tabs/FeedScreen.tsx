import { useNavigation } from '@react-navigation/native';
import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet,
  TextInput, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
;
import { api, endpoints } from '../../utils/api';
import { useFeedStore } from '../../store/useFeedStore';
import { useUserStore } from '../../store/useUserStore';
import OfferCard from '../../components/OfferCard';
import { Colors } from '../../constants/colors';
import type { Category } from '../../types';

const FILTER_TABS = [
  { key: 'all',      label: 'All' },
  { key: 'trending', label: 'Trending' },
  { key: 'flash',    label: 'Flash Sale' },
  { key: 'ending',   label: 'Ending Soon' },
];

export default function Feed() {
  const navigation = useNavigation();
  const { user } = useUserStore();
  const { forYouOffers, trendingOffers, loading, loadForYou, loadTrending, reset } = useFeedStore();
  console.log("Checkofferssection", forYouOffers,trendingOffers,loading)

  const [tab, setTab]               = useState<'forYou' | 'trending'>('forYou');
  const [activeCategory, setCategory] = useState<string | null>(null);
  const [activeFilter, setFilter]   = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch]         = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback((t = tab) => {
    if (t === 'forYou' && user) loadForYou(user.id, undefined, undefined, true);
    else loadTrending('Chennai');
  }, [tab, user]);

  useEffect(() => {
    load();
   api.get(endpoints.categoriesList())
      .then((r) => { if (r.data.success) setCategories(r.data.data ?? []); })
      .catch(() => {});
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await (tab === 'forYou' && user
      ? loadForYou(user.id, undefined, undefined, true)
      : loadTrending('Chennai'));
    setRefreshing(false);
  };

  const baseOffers = tab === 'forYou' ? forYouOffers : trendingOffers;
  const displayed = baseOffers.filter((o) => {
    if (activeCategory && o.category !== activeCategory) return false;
    if (search && !o.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === 'flash' && (o.discountPercent ?? 0) < 30) return false;
    if (activeFilter === 'ending' && o.validUntil) {
      const diff = new Date(o.validUntil).getTime() - Date.now();
      if (diff > 86400000 * 2) return false;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subGreet}>Find the best deals near you</Text>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.navigate('Notifications' as never)}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.dark} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={16} color={Colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search offers, shops..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(o) => String(o.id)}
        renderItem={({ item }) => <OfferCard offer={item} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <>
            {/* Tab switcher */}
            <View style={styles.tabRow}>
              {(['forYou', 'trending'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                  onPress={() => { setTab(t); load(t); }}
                >
                  <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                    {t === 'forYou' ? 'For You' : 'Trending'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cats}>
              <TouchableOpacity
                style={[styles.catChip, !activeCategory && styles.catChipActive]}
                onPress={() => setCategory(null)}
              >
                <Text style={[styles.catText, !activeCategory && styles.catTextActive]}>All</Text>
              </TouchableOpacity>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.slug}
                  style={[styles.catChip, activeCategory === c.slug && styles.catChipActive]}
                  onPress={() => setCategory(activeCategory === c.slug ? null : c.slug)}
                >
                  <Text style={[styles.catText, activeCategory === c.slug && styles.catTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Filter tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
              {FILTER_TABS.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
                  onPress={() => setFilter(f.key)}
                >
                  <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.offerHeader}>
              <Text style={styles.offerTitle}>Offers</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{displayed.length}</Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          loading
            ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
            : <View style={styles.empty}>
                <Ionicons name="gift-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No offers found</Text>
                <Text style={styles.emptySubText}>Try a different category or filter</Text>
              </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: Colors.bg },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  greeting:       { fontSize: 18, fontWeight: '700', color: Colors.dark },
  subGreet:       { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  notifBtn:       { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white,
                    alignItems: 'center', justifyContent: 'center',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  searchBox:      { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
                    borderRadius: 12, marginHorizontal: 16, marginBottom: 8,
                    paddingHorizontal: 12, height: 44,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  searchInput:    { flex: 1, fontSize: 14, color: Colors.text },
  list:           { paddingHorizontal: 16, paddingBottom: 20 },
  tabRow:         { flexDirection: 'row', gap: 8, marginBottom: 12, marginTop: 4 },
  tabBtn:         { flex: 1, height: 38, borderRadius: 10, alignItems: 'center',
                    justifyContent: 'center', backgroundColor: Colors.white,
                    borderWidth: 1, borderColor: Colors.border },
  tabBtnActive:   { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText:        { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive:  { color: Colors.white },
  cats:           { marginBottom: 10 },
  catChip:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                    backgroundColor: Colors.white, marginRight: 8,
                    borderWidth: 1, borderColor: Colors.border },
  catChipActive:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText:        { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  catTextActive:  { color: Colors.white },
  filters:        { marginBottom: 14 },
  filterChip:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                    backgroundColor: Colors.surface2, marginRight: 8 },
  filterChipActive:{ backgroundColor: Colors.dark },
  filterText:     { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive:{ color: Colors.white },
  offerHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  offerTitle:     { fontSize: 16, fontWeight: '700', color: Colors.dark },
  countBadge:     { backgroundColor: Colors.primary, borderRadius: 8,
                    paddingHorizontal: 7, paddingVertical: 2 },
  countText:      { color: Colors.white, fontSize: 11, fontWeight: '700' },
  empty:          { alignItems: 'center', paddingTop: 60 },
  emptyText:      { fontSize: 16, fontWeight: '600', color: Colors.textSecondary, marginTop: 12 },
  emptySubText:   { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
});
