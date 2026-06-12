import { create } from 'zustand';
import { api, endpoints } from '../utils/api';
import type { Offer } from '../types';

function mapOffer(o: any): Offer {
  return {
    ...o,
    discountPercent: Number(o.discountPercent ?? o.discount_percent ?? 0),
    originalPrice:   o.originalPrice != null ? Number(o.originalPrice) : undefined,
    offerPrice:      o.offerPrice    != null ? Number(o.offerPrice)    : undefined,
    vendorLat:       o.vendorLat     != null ? Number(o.vendorLat)     : undefined,
    vendorLng:       o.vendorLng     != null ? Number(o.vendorLng)     : undefined,
  };
}

interface FeedState {
  forYouOffers:   Offer[];
  trendingOffers: Offer[];
  loading:        boolean;
  hasMore:        boolean;
  page:           number;
  activeCategory: string | null;
  setCategory:    (c: string | null) => void;
  loadTrending:   (city?: string) => Promise<void>;
  loadForYou:     (userId: number, lat?: number, lng?: number, reset?: boolean) => Promise<void>;
  reset:          () => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  forYouOffers:   [],
  trendingOffers: [],
  loading:        false,
  hasMore:        true,
  page:           1,
  activeCategory: null,

  setCategory: (c) => set({ activeCategory: c }),

  loadTrending: async (city = 'Chennai') => {
    set({ loading: true });
    try {
      const res = await api.get(endpoints.trending(city));
      if (res.data.success) {
        set({ trendingOffers: (res.data.data ?? []).map(mapOffer), loading: false });
      }
    } catch { set({ loading: false }); }
  },

loadForYou: async (userId, lat, lng, reset = false) => {
  if (get().loading) return;

  const page = reset ? 1 : get().page;

  set({ loading: true });

  try {
    console.log("loadForYou called");


    const url = endpoints.feed(
      userId,
      lat ?? 13.0827,
      lng ?? 80.2707,
      page,
      20
    );

    console.log("URL", url);

    const res = await api.get(url);

    console.log(
      "FORYOU RESPONSE",
      JSON.stringify(res.data, null, 2)
    );

    if (res.data.success) {
      const rawOffers = Array.isArray(res.data.data?.offers)
        ? res.data.data.offers
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];

      const offers = rawOffers.map(mapOffer);

      console.log("OFFERS COUNT", offers.length);

      set((s) => ({
        forYouOffers: reset
          ? offers
          : [...s.forYouOffers, ...offers],
        hasMore: offers.length === 20,
        page: page + 1,
        loading: false,
      }));
    } else {
      set({ loading: false });
    }
  } catch (e) {
    console.log("loadForYou Error", e);
    set({ loading: false });
  }
},

  reset: () => set({ forYouOffers: [], trendingOffers: [], page: 1, hasMore: true }),
}));
