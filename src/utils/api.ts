import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://dev.adslife.in/api';

const INTERNAL_IP_RE = /http:\/\/160\.250\.224\.242(:\d+)?/g;
const PUBLIC_BASE = 'http://103.190.92.21:3001';

function fixUrls(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(INTERNAL_IP_RE, PUBLIC_BASE);
  }

  if (Array.isArray(obj)) {
    return obj.map(fixUrls);
  }

  if (obj && typeof obj === 'object') {
    const result: any = {};

    Object.keys(obj).forEach((key) => {
      result[key] = fixUrls(obj[key]);
    });

    return result;
  }

  return obj;
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(
        'adslife_token'
      );

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.log('TOKEN ERROR', e);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = fixUrls(response.data);
    }

    return response;
  },
  async (error) => {
    try {
      if (error?.response?.status === 401) {
        await AsyncStorage.removeItem(
          'adslife_token'
        );

        await AsyncStorage.removeItem(
          'adslife_user'
        );

        console.log('Session expired');
      }
    } catch (e) {
      console.log('401 cleanup error', e);
    }

    return Promise.reject(error);
  }
);

export const endpoints = {
  login: '/auth/login',
  register: '/auth/register',

  feed: (
    userId: number,
    lat: number,
    lng: number,
    page = 1,
    perPage = 20,
    q = ''
  ) =>
    `/feed/personalized?user_id=${userId}&lat=${lat}&lng=${lng}&page=${page}&per_page=${perPage}${
      q ? `&q=${encodeURIComponent(q)}` : ''
    }`,

  trending: (
    city: string,
    page = 1,
    perPage = 20
  ) =>
    `/feed/trending?city=${encodeURIComponent(
      city
    )}&page=${page}&per_page=${perPage}`,

  nearby: (
    lat: number,
    lng: number,
    radius = 5,
    page = 1
  ) =>
    `/feed/nearby?lat=${lat}&lng=${lng}&radius=${radius}&page=${page}`,

  interaction: '/feed/interaction',

  savedOffers: (page = 1) =>
    `/feed/saved?page=${page}`,

  savedIds: '/feed/saved-ids',

  unsaveOffer: '/feed/unsave',

  categoriesList: (
    isAdmin?: boolean
  ) => `/categories${isAdmin ? '?admin=true' : ''}`,

  offerDetail: (
    id: number
  ) => `/offers/${id}`,
// /vendor/follow-status?vendor_id=2
vendorFollowStatus:(
    vendor_id:number
    ) => `/vendor/follow-status?vendor_id=${vendor_id}`,
};