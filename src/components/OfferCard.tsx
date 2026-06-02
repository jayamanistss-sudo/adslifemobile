import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
;
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import { useSavedStore } from '../store/useSavedStore';
import { useUserStore } from '../store/useUserStore';
import type { Offer } from '../types';

interface Props { offer: Offer; compact?: boolean; }

function timeLeft(until?: string): string {
  if (!until) return '';
  const diff = new Date(until).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / 86400000);
  if (days > 1) return `${days}d left`;
  const hrs = Math.floor(diff / 3600000);
  return hrs > 0 ? `${hrs}h left` : 'Ending soon';
}

export default function OfferCard({ offer, compact }: Props) {
  const { isSaved, save, unsave } = useSavedStore();
  const { user } = useUserStore();
  const saved = isSaved(offer.id);
  const tl = timeLeft(offer.validUntil);

  const handleSave = (e: any) => {
    e.stopPropagation?.();
    if (!user) { navigation.navigate('Auth' as never); return; }
    saved ? unsave(offer.id) : save(offer.id);
  };

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={() => navigation.navigate('OfferDetail', {id: offer.id})}
      activeOpacity={0.93}
    >
      {/* Image */}
      <View style={styles.imageBox}>
        {offer.imageUrl
          ? <Image source={{ uri: offer.imageUrl }} style={styles.image} resizeMode="cover" />
          : <View style={styles.imagePlaceholder}>
              <Ionicons name="pricetag-outline" size={32} color={Colors.textMuted} />
            </View>
        }
        {/* Discount badge */}
        {offer.discountPercent > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{offer.discountPercent}% OFF</Text>
          </View>
        )}
        {/* Save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={saved ? Colors.primary : Colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.category}>{offer.category}</Text>
        <Text style={styles.title} numberOfLines={2}>{offer.title}</Text>

        {/* Price row */}
        {(offer.offerPrice ?? 0) > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{offer.offerPrice}</Text>
            {(offer.originalPrice ?? 0) > 0 && (
              <Text style={styles.originalPrice}>₹{offer.originalPrice}</Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.vendorRow}>
            {offer.vendorLogo
              ? <Image source={{ uri: offer.vendorLogo }} style={styles.vendorLogo} />
              : <View style={[styles.vendorLogo, styles.vendorLogoFallback]}>
                  <Text style={styles.vendorLogoText}>{offer.businessName?.[0] ?? 'S'}</Text>
                </View>
            }
            <Text style={styles.vendorName} numberOfLines={1}>{offer.businessName}</Text>
          </View>
          {tl ? (
            <Text style={[styles.timeLeft, tl === 'Ending soon' && styles.urgent]}>{tl}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardCompact: { marginBottom: 10 },
  imageBox: { position: 'relative', height: 160 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: Colors.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: Colors.primary, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  saveBtn: {
    position: 'absolute', bottom: 10, right: 10,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: 12 },
  category: {
    fontSize: 10, fontWeight: '600', color: Colors.primary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  title: { fontSize: 14, fontWeight: '700', color: Colors.dark, lineHeight: 20, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 },
  price: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  originalPrice: { fontSize: 13, color: Colors.textMuted, textDecorationLine: 'line-through' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vendorRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  vendorLogo: { width: 20, height: 20, borderRadius: 6, marginRight: 6 },
  vendorLogoFallback: {
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  vendorLogoText: { fontSize: 9, fontWeight: '700', color: Colors.primary },
  vendorName: { fontSize: 11, color: Colors.textSecondary, flex: 1 },
  timeLeft: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  urgent: { color: Colors.danger },
});
