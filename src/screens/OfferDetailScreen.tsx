import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Linking, Share, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import { api, endpoints } from '../utils/api';
import { useUserStore } from '../store/useUserStore';
import { useSavedStore } from '../store/useSavedStore';
import { Colors } from '../constants/colors';
import type { Offer } from '../types';

function timeLeft(until?: string): string {
  if (!until) return '';
  const diff = new Date(until).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d left`;
  const hrs = Math.floor(diff / 3600000);
  return hrs > 0 ? `${hrs}h left` : 'Ending soon';
}

export default function OfferDetail() {
  const navigation = useNavigation();
  const route = useRoute<any>(); const { id } = route.params;
  const { user } = useUserStore();
  const { isSaved, save, unsave } = useSavedStore();
  const [offer, setOffer]       = useState<Offer | null>(null);
  const [loading, setLoading]   = useState(true);
  const [following, setFollowing] = useState(false);
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(endpoints.offerDetail(Number(id)))
      .then((r) => {
        if (r.data.success) {
          setOffer(r.data.data);
          if (user && r.data.data.vendorId) {
            api.get(endpoints.vendorFollowStatus(r.data.data.vendorId))
              .then((res) => { if (res.data.success) setFollowing(res.data.data.following); })
              .catch(() => {});
          }
          // Track click
          if (user) api.post(endpoints.interaction, { offer_id: Number(id), action: 'click' }).catch(() => {});
        }
      })
      .catch(() => Alert.alert('Error', 'Offer not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const saved = offer ? isSaved(offer.id) : false;

  const handleSave = () => {
    if (!user || !offer) return;
    saved ? unsave(offer.id) : save(offer.id);
  };

  const handleCopyCoupon = async () => {
    if (!offer?.couponCode) return;
    Clipboard.setString(offer.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeem = () => {
    if (!offer) return;
    if (offer.redeemUrl) {
      if (offer.couponCode) handleCopyCoupon();
      Linking.openURL(offer.redeemUrl);
    } else {
      if (offer.couponCode) handleCopyCoupon();
      Alert.alert('Offer Redeemed! 🎉', offer.couponCode ? `Coupon: ${offer.couponCode}` : 'Show this to the vendor');
    }
  };

  const handleShare = async () => {
    if (!offer) return;
    await Share.share({
      message: `${offer.title} — ${offer.discountPercent}% OFF at ${offer.businessName}!\nCheck it on AdsLife: https://adslife.in/offer/${offer.id}`,
    });
  };

  const handleDirections = () => {
    if (!offer?.vendorLat || !offer?.vendorLng) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${offer.vendorLat},${offer.vendorLng}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleFollow = async () => {
    if (!user || !offer?.vendorId) return;
    try {
      const res = await api.post(endpoints.vendorFollow, { vendor_id: offer.vendorId, action: 'toggle' });
      if (res.data.success) setFollowing(res.data.data.following);
    } catch {}
  };

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={Colors.dark} />
      </TouchableOpacity>
      <ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} />
    </SafeAreaView>
  );

  if (!offer) return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={Colors.dark} />
      </TouchableOpacity>
      <View style={styles.notFound}>
        <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.notFoundText}>Offer not found</Text>
      </View>
    </SafeAreaView>
  );

  const tl = timeLeft(offer.validUntil);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero image */}
        <View style={styles.heroBox}>
          {offer.imageUrl
            ? <Image source={{ uri: offer.imageUrl }} style={styles.heroImage} resizeMode="cover" />
            : <View style={[styles.heroImage, styles.heroPlaceholder]}>
                <Ionicons name="pricetag-outline" size={64} color={Colors.textMuted} />
              </View>
          }

          {/* Back + actions */}
          <View style={styles.heroOverlay}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.heroBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroBtn} onPress={handleSave}>
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={saved ? Colors.warning : Colors.white}
                />
              </TouchableOpacity>
            </View>
          </View>

          {offer.discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{offer.discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Category + title */}
          <View style={styles.catRow}>
            <Text style={styles.cat}>{offer.category}</Text>
            {tl ? <Text style={[styles.tl, tl === 'Ending soon' && { color: Colors.danger }]}>{tl}</Text> : null}
          </View>
          <Text style={styles.offerTitle}>{offer.title}</Text>

          {/* Price */}
          {(offer.offerPrice ?? 0) > 0 && (
            <View style={styles.priceCard}>
              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{offer.offerPrice}</Text>
                {(offer.originalPrice ?? 0) > 0 && (
                  <Text style={styles.origPrice}>₹{offer.originalPrice}</Text>
                )}
              </View>
              {offer.couponCode ? (
                <TouchableOpacity style={styles.couponBtn} onPress={handleCopyCoupon}>
                  <Ionicons name="pricetag-outline" size={14} color={Colors.primary} />
                  <Text style={styles.couponCode}>{offer.couponCode}</Text>
                  <Ionicons
                    name={copied ? 'checkmark-circle' : 'copy-outline'}
                    size={14}
                    color={copied ? Colors.accent : Colors.textMuted}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          {/* Validity */}
          {(offer.validFrom || offer.validUntil) && (
            <View style={styles.validRow}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.validText}>
                {offer.validFrom ? `From ${new Date(offer.validFrom).toLocaleDateString('en-IN')}` : ''}
                {offer.validUntil ? ` · Until ${new Date(offer.validUntil).toLocaleDateString('en-IN')}` : ''}
              </Text>
            </View>
          )}

          {/* Description */}
          {offer.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this offer</Text>
              <Text style={styles.description}>{offer.description}</Text>
            </View>
          ) : null}

          {/* Vendor */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop Details</Text>
            <View style={styles.vendorCard}>
              <View style={styles.vendorHeader}>
                {offer.vendorLogo
                  ? <Image source={{ uri: offer.vendorLogo }} style={styles.vendorLogo} />
                  : <View style={[styles.vendorLogo, styles.vendorLogoFallback]}>
                      <Text style={styles.vendorLogoText}>{offer.businessName?.[0]}</Text>
                    </View>
                }
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorName}>{offer.businessName}</Text>
                  <Text style={styles.vendorMeta}>{offer.vendorCategory} · {offer.vendorCity}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.followBtn, following && styles.followBtnActive]}
                  onPress={handleFollow}
                >
                  <Ionicons
                    name={following ? 'notifications' : 'notifications-outline'}
                    size={13}
                    color={following ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[styles.followText, following && styles.followTextActive]}>
                    {following ? 'Subscribed' : 'Subscribe'}
                  </Text>
                </TouchableOpacity>
              </View>

              {offer.vendorDescription ? (
                <Text style={styles.vendorDesc} numberOfLines={3}>{offer.vendorDescription}</Text>
              ) : null}

              {/* Contact info */}
              {[
                { icon: 'location-outline', text: offer.vendorAddress },
                { icon: 'call-outline',     text: offer.vendorPhone, link: `tel:${offer.vendorPhone}` },
                { icon: 'globe-outline',    text: offer.vendorWebsite, link: offer.vendorWebsite },
              ].map(({ icon, text, link }) => text ? (
                <TouchableOpacity
                  key={icon}
                  style={styles.contactRow}
                  onPress={() => link && Linking.openURL(link)}
                  disabled={!link}
                >
                  <Ionicons name={icon as any} size={14} color={Colors.primary} />
                  <Text style={[styles.contactText, link && styles.contactLink]}>{text}</Text>
                </TouchableOpacity>
              ) : null)}

              {/* Directions */}
              {offer.vendorLat && offer.vendorLng ? (
                <TouchableOpacity style={styles.directionsBtn} onPress={handleDirections}>
                  <Ionicons name="navigate-outline" size={14} color={Colors.primary} />
                  <Text style={styles.directionsBtnText}>Open in Maps</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { icon: 'eye-outline',      val: offer.views,  label: 'Views' },
              { icon: 'hand-left-outline',val: offer.clicks, label: 'Clicks' },
              { icon: 'bookmark-outline', val: offer.saves,  label: 'Saves' },
            ].map(({ icon, val, label }) => (
              <View key={label} style={styles.statItem}>
                <Ionicons name={icon as any} size={16} color={Colors.primary} />
                <Text style={styles.statVal}>{val}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.cta}>
        <TouchableOpacity style={styles.dirBtn} onPress={handleDirections}>
          <Ionicons name="navigate-outline" size={18} color={Colors.white} />
          <Text style={styles.dirBtnText}>Get Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.redeemBtn} onPress={handleRedeem}>
          <Ionicons name="gift-outline" size={18} color={Colors.white} />
          <Text style={styles.redeemBtnText}>{offer.redeemUrl ? 'Redeem Online' : 'Redeem Offer'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.white },
  backBtn:      { margin: 16 },
  notFound:     { alignItems: 'center', paddingTop: 60 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary, marginTop: 12 },
  heroBox:      { position: 'relative', height: 280 },
  heroImage:    { width: '100%', height: '100%' },
  heroPlaceholder: { backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center' },
  heroOverlay:  { position: 'absolute', top: 0, left: 0, right: 0,
                  flexDirection: 'row', justifyContent: 'space-between',
                  padding: 16, paddingTop: 20 },
  heroActions:  { flexDirection: 'row', gap: 8 },
  heroBtn:      { width: 36, height: 36, borderRadius: 18,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  alignItems: 'center', justifyContent: 'center' },
  discountBadge:{ position: 'absolute', bottom: 16, right: 16,
                  backgroundColor: Colors.primary, borderRadius: 10,
                  paddingHorizontal: 10, paddingVertical: 5 },
  discountText: { color: Colors.white, fontWeight: '800', fontSize: 14 },
  body:         { padding: 16 },
  catRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cat:          { fontSize: 11, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  tl:           { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  offerTitle:   { fontSize: 22, fontWeight: '800', color: Colors.dark, lineHeight: 30, marginBottom: 14 },
  priceCard:    { backgroundColor: Colors.bg, borderRadius: 14, padding: 14, marginBottom: 14 },
  priceRow:     { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price:        { fontSize: 28, fontWeight: '900', color: Colors.primary },
  origPrice:    { fontSize: 16, color: Colors.textMuted, textDecorationLine: 'line-through' },
  couponBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
                  backgroundColor: Colors.white, borderRadius: 10,
                  paddingHorizontal: 12, paddingVertical: 8,
                  borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.primary + '60' },
  couponCode:   { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.primary, fontFamily: 'monospace' },
  validRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  validText:    { fontSize: 12, color: Colors.textMuted },
  section:      { marginBottom: 14 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 10 },
  description:  { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  vendorCard:   { backgroundColor: Colors.bg, borderRadius: 14, padding: 14 },
  vendorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  vendorLogo:   { width: 44, height: 44, borderRadius: 12, marginRight: 10 },
  vendorLogoFallback: { backgroundColor: Colors.primary + '22', alignItems: 'center', justifyContent: 'center' },
  vendorLogoText: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  vendorInfo:   { flex: 1 },
  vendorName:   { fontSize: 14, fontWeight: '700', color: Colors.dark },
  vendorMeta:   { fontSize: 11, color: Colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  followBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4,
                  paddingHorizontal: 10, paddingVertical: 6,
                  borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  followBtnActive:{ borderColor: Colors.primary + '40', backgroundColor: Colors.primary + '10' },
  followText:   { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  followTextActive: { color: Colors.primary },
  vendorDesc:   { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginBottom: 10 },
  contactRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  contactText:  { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  contactLink:  { color: Colors.primary },
  directionsBtn:{ flexDirection: 'row', alignItems: 'center', gap: 6,
                  marginTop: 10, paddingVertical: 8 },
  directionsBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  statsRow:     { flexDirection: 'row', justifyContent: 'space-around',
                  backgroundColor: Colors.bg, borderRadius: 14, padding: 14, marginTop: 4 },
  statItem:     { alignItems: 'center', gap: 4 },
  statVal:      { fontSize: 16, fontWeight: '700', color: Colors.dark },
  statLabel:    { fontSize: 10, color: Colors.textMuted },
  cta:          { position: 'absolute', bottom: 0, left: 0, right: 0,
                  flexDirection: 'row', gap: 10, padding: 16,
                  backgroundColor: Colors.white,
                  borderTopWidth: 1, borderTopColor: Colors.border },
  dirBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  gap: 6, backgroundColor: Colors.dark, borderRadius: 14, height: 52 },
  dirBtnText:   { color: Colors.white, fontWeight: '700', fontSize: 14 },
  redeemBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  gap: 6, backgroundColor: Colors.primary, borderRadius: 14, height: 52,
                  shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  redeemBtnText:{ color: Colors.white, fontWeight: '700', fontSize: 14 },
});
