import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://adslife.in/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('adslife_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.multiRemove(['adslife_token', 'adslife_user']);
    }
    return Promise.reject(err);
  },
);

export const endpoints = {
  login:            '/auth/login',
  register:         '/auth/register',
  trending:         (city: string) => `/feed/trending?city=${encodeURIComponent(city)}`,
  forYou:           (uid: number) => `/feed/for-you/${uid}`,
  categoriesList:   (active = true) => `/categories?active=${active}`,
  offerDetail:      (id: number) => `/offers/${id}`,
  myOffers:         '/offers/my/list',
  offerCreate:      '/offers',
  offerUpdate:      (id: number) => `/offers/${id}`,
  offerDelete:      (id: number) => `/offers/${id}`,
  uploadImage:      '/upload/image',
  interaction:      '/feed/interaction',
  savedIds:         '/feed/saved-ids',
  savedOffers:      '/feed/saved-offers',
  unsaveOffer:      '/feed/unsave',
  vendorDashboard:  '/vendor/dashboard',
  vendorProfile:    '/vendor/profile',
  vendorUpdateProfile: '/vendor/profile',
  vendorFollowStatus: (id: number) => `/vendor/follow-status?vendor_id=${id}`,
  vendorFollow:     '/vendor/follow',
  vendorFollowers:  (id: number) => `/vendor/followers?vendor_id=${id}&limit=10`,
  notifications:    '/notifications',
  markNotifRead:    (id: number) => `/notifications/${id}/read`,
  markAllRead:      '/notifications/read-all',
  leaderboard:      (period = 'monthly') => `/leaderboard?period=${period}&limit=50`,
  updateProfile:    '/users/profile',
  groupDeals:       '/group-deals',
  adminStats:       '/admin/stats',
  adminUsers:       '/admin/users',
  adminVendors:     '/admin/vendors',
  adminReviewVendor:(id: number) => `/admin/review-vendor/${id}`,
  audienceAnalytics:'/analytics/audience',
  siteSettings:     '/admin/site-settings',
};
