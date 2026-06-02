import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Modal, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
;
import { api, endpoints } from '../../utils/api';
import { Colors } from '../../constants/colors';

interface OfferItem {
  id: number; title: string; category: string; discount_percent: number;
  is_active: number; views: number; clicks: number; saves: number;
  valid_until?: string; image_url?: string; description?: string;
  original_price?: number; offer_price?: number; coupon_code?: string;
  redeem_url?: string; max_redemptions?: number; valid_from?: string;
}

const emptyForm = {
  title: '', description: '', category: '', discount_percent: '',
  original_price: '', offer_price: '', coupon_code: '', redeem_url: '',
  max_redemptions: '', valid_from: '', valid_until: '',
};

export default function VendorOffers() {
  const navigation = useNavigation();
  const [offers, setOffers]     = useState<OfferItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState<OfferItem | null>(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);

  const load = () => {
    setLoading(true);
    api.get(endpoints.myOffers)
      .then((r) => { if (r.data.success) setOffers(r.data.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit   = (o: OfferItem) => {
    setEditing(o);
    setForm({
      title:            o.title ?? '',
      description:      o.description ?? '',
      category:         o.category ?? '',
      discount_percent: o.discount_percent != null ? String(o.discount_percent) : '',
      original_price:   o.original_price   != null ? String(o.original_price)   : '',
      offer_price:      o.offer_price       != null ? String(o.offer_price)      : '',
      coupon_code:      o.coupon_code ?? '',
      redeem_url:       o.redeem_url ?? '',
      max_redemptions:  o.max_redemptions != null ? String(o.max_redemptions) : '',
      valid_from:       o.valid_from  ? o.valid_from.slice(0, 10)  : '',
      valid_until:      o.valid_until ? o.valid_until.slice(0, 10) : '',
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { Alert.alert('Error', 'Title is required'); return; }
    setSaving(true);
    try {
      const body = {
        ...form,
        discount_percent: form.discount_percent ? parseFloat(form.discount_percent) : null,
        original_price:   form.original_price   ? parseFloat(form.original_price)   : null,
        offer_price:      form.offer_price       ? parseFloat(form.offer_price)      : null,
        max_redemptions:  form.max_redemptions   ? parseInt(form.max_redemptions)    : 0,
      };
      const res = editing
        ? await api.put(endpoints.offerUpdate(editing.id), body)
        : await api.post(endpoints.offerCreate, body);
      if (res.data.success) { setModal(false); load(); }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error ?? 'Failed to save offer');
    } finally { setSaving(false); }
  };

  const handleDelete = (o: OfferItem) => {
    Alert.alert('Delete Offer', `Delete "${o.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await api.delete(endpoints.offerDelete(o.id)).catch(() => {});
          setOffers((prev) => prev.filter((x) => x.id !== o.id));
        }},
    ]);
  };

  const handleToggle = async (o: OfferItem) => {
    await api.put(endpoints.offerUpdate(o.id), { is_active: !o.is_active }).catch(() => {});
    setOffers((prev) => prev.map((x) => x.id === o.id ? { ...x, is_active: x.is_active ? 0 : 1 } : x));
  };

  const upd = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>My Offers</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {loading
        ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        : <FlatList
            data={offers}
            keyExtractor={(o) => String(o.id)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.cardMeta}>{item.category} · {item.discount_percent}% off</Text>
                    <Text style={styles.cardStats}>
                      👁 {item.views}  👆 {item.clicks}  🔖 {item.saves}
                    </Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(item)}>
                      <Ionicons name="pencil-outline" size={17} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item)}>
                      <Ionicons name="trash-outline" size={17} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  {item.valid_until && (
                    <Text style={styles.expiry}>Expires {new Date(item.valid_until).toLocaleDateString('en-IN')}</Text>
                  )}
                  <TouchableOpacity
                    style={[styles.toggleBtn, item.is_active ? styles.toggleBtnActive : null]}
                    onPress={() => handleToggle(item)}
                  >
                    <Text style={[styles.toggleText, item.is_active ? styles.toggleTextActive : null]}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="pricetag-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No offers yet</Text>
                <TouchableOpacity style={styles.createBtn} onPress={openCreate}>
                  <Text style={styles.createBtnText}>+ Add First Offer</Text>
                </TouchableOpacity>
              </View>
            }
          />}

      {/* Create/Edit Modal */}
      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Ionicons name="close" size={24} color={Colors.dark} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editing ? 'Edit Offer' : 'New Offer'}</Text>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            {[
              { key: 'title',            label: 'Title *',           placeholder: 'e.g. 30% off pizzas' },
              { key: 'description',      label: 'Description',       placeholder: 'Describe your offer…' },
              { key: 'category',         label: 'Category',          placeholder: 'e.g. food-dining' },
              { key: 'discount_percent', label: 'Discount %',        placeholder: '30', numeric: true },
              { key: 'original_price',   label: 'Original Price ₹',  placeholder: '500', numeric: true },
              { key: 'offer_price',      label: 'Offer Price ₹',     placeholder: '350', numeric: true },
              { key: 'coupon_code',      label: 'Coupon Code',       placeholder: 'SAVE30' },
              { key: 'redeem_url',       label: 'Redeem URL',        placeholder: 'https://…' },
              { key: 'max_redemptions',  label: 'Max Redemptions',   placeholder: '0 = unlimited', numeric: true },
              { key: 'valid_from',       label: 'Valid From (YYYY-MM-DD)', placeholder: '2026-01-01' },
              { key: 'valid_until',      label: 'Valid Until (YYYY-MM-DD)', placeholder: '2026-12-31' },
            ].map(({ key, label, placeholder, numeric }) => (
              <View key={key} style={styles.field}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form[key as keyof typeof emptyForm]}
                  onChangeText={(v) => upd(key as keyof typeof emptyForm, v)}
                  placeholder={placeholder}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType={numeric ? 'numeric' : 'default'}
                  multiline={key === 'description'}
                  numberOfLines={key === 'description' ? 3 : 1}
                />
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.bg },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                padding: 16, paddingTop: 20 },
  title:      { fontSize: 18, fontWeight: '700', color: Colors.dark },
  addBtn:     { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.primary,
                alignItems: 'center', justifyContent: 'center' },
  list:       { padding: 16, paddingBottom: 30 },
  card:       { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10,
                shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTop:    { flexDirection: 'row', alignItems: 'flex-start' },
  cardInfo:   { flex: 1 },
  cardTitle:  { fontSize: 14, fontWeight: '700', color: Colors.dark },
  cardMeta:   { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  cardStats:  { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  cardActions:{ flexDirection: 'row', gap: 4 },
  iconBtn:    { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.bg,
                alignItems: 'center', justifyContent: 'center' },
  cardFooter: { flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between', marginTop: 10, paddingTop: 10,
                borderTopWidth: 1, borderTopColor: Colors.border },
  expiry:     { fontSize: 11, color: Colors.textMuted },
  toggleBtn:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                backgroundColor: Colors.textMuted + '22' },
  toggleBtnActive: { backgroundColor: Colors.accent + '22' },
  toggleText: { fontSize: 11, fontWeight: '700', color: Colors.textMuted },
  toggleTextActive: { color: Colors.accent },
  empty:      { alignItems: 'center', paddingTop: 60 },
  emptyText:  { fontSize: 15, color: Colors.textSecondary, marginTop: 12 },
  createBtn:  { marginTop: 16, backgroundColor: Colors.primary,
                paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  createBtnText: { color: Colors.white, fontWeight: '600' },
  modal:      { flex: 1, backgroundColor: Colors.white },
  modalHeader:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  saveBtn:    { backgroundColor: Colors.primary, borderRadius: 10,
                paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText:{ color: Colors.white, fontWeight: '700' },
  modalBody:  { padding: 16, paddingBottom: 40 },
  field:      { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  fieldInput: { backgroundColor: Colors.bg, borderRadius: 12, paddingHorizontal: 14,
                paddingVertical: 12, fontSize: 14, color: Colors.text,
                borderWidth: 1, borderColor: Colors.border },
});
