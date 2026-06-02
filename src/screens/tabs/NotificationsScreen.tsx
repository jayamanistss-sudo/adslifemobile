import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
;
import { api, endpoints } from '../../utils/api';
import { Colors } from '../../constants/colors';
import type { Notification } from '../../types';

const TYPE_ICON: Record<string, string> = {
  offer:  'pricetag-outline',
  follow: 'person-add-outline',
  system: 'information-circle-outline',
  reward: 'trophy-outline',
};

export default function Notifications() {
  const navigation = useNavigation();
  const [notifs, setNotifs]   = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get(endpoints.notifications)
      .then((r) => { if (r.data.success) setNotifs(r.data.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await api.put(endpoints.markNotifRead(id)).catch(() => {});
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await api.put(endpoints.markAllRead).catch(() => {});
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unread > 0 && <Text style={styles.unread}>{unread} unread</Text>}
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading
        ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        : <FlatList
            data={notifs}
            keyExtractor={(n) => String(n.id)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.row, !item.isRead && styles.rowUnread]}
                onPress={() => {
                  markRead(item.id);
                  if (item.offerId) navigation.navigate('OfferDetail' as never, {id: item.offerId} as never);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.iconBox, { backgroundColor: Colors.primary + '18' }]}>
                  <Ionicons
                    name={(TYPE_ICON[item.type] ?? 'notifications-outline') as any}
                    size={18}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.content}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
                  <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString('en-IN')}</Text>
                </View>
                {!item.isRead && <View style={styles.dot} />}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="notifications-off-outline" size={52} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            }
          />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.bg },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
               padding: 16, paddingTop: 20 },
  title:     { fontSize: 22, fontWeight: '700', color: Colors.dark },
  unread:    { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  markAll:   { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 6 },
  list:      { paddingHorizontal: 16, paddingBottom: 20 },
  row:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
               borderRadius: 14, padding: 14, marginBottom: 8,
               shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
               shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  rowUnread: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  iconBox:   { width: 40, height: 40, borderRadius: 12,
               alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 },
  content:   { flex: 1 },
  notifTitle:{ fontSize: 14, fontWeight: '700', color: Colors.dark },
  body:      { fontSize: 12, color: Colors.textSecondary, marginTop: 3, lineHeight: 17 },
  time:      { fontSize: 10, color: Colors.textMuted, marginTop: 5 },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginLeft: 8 },
  empty:     { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15, color: Colors.textSecondary, marginTop: 12 },
});
