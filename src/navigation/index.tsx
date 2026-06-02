import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useUserStore } from '../store/useUserStore';
import { Colors } from '../constants/colors';

// Auth
import LoginScreen      from '../screens/auth/LoginScreen';
import RegisterScreen   from '../screens/auth/RegisterScreen';

// Tabs
import FeedScreen          from '../screens/tabs/FeedScreen';
import SavedScreen         from '../screens/tabs/SavedScreen';
import LeaderboardScreen   from '../screens/tabs/LeaderboardScreen';
import NotificationsScreen from '../screens/tabs/NotificationsScreen';
import ProfileScreen       from '../screens/tabs/ProfileScreen';

// Detail
import OfferDetailScreen from '../screens/OfferDetailScreen';

// Vendor
import VendorDashboardScreen  from '../screens/vendor/VendorDashboardScreen';
import VendorOffersScreen     from '../screens/vendor/VendorOffersScreen';
import VendorAnalyticsScreen  from '../screens/vendor/VendorAnalyticsScreen';
import EditVendorProfileScreen from '../screens/vendor/EditVendorProfileScreen';

// Admin
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen     from '../screens/admin/AdminUsersScreen';
import AdminVendorsScreen   from '../screens/admin/AdminVendorsScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  OfferDetail: { id: number };
  VendorDashboard: undefined;
  VendorOffers: undefined;
  VendorAnalytics: undefined;
  EditVendorProfile: undefined;
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminVendors: undefined;
};

export type TabParamList = {
  Feed: undefined;
  Saved: undefined;
  Leaderboard: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor:  Colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Feed:          'compass-outline',
            Saved:         'bookmark-outline',
            Leaderboard:   'trophy-outline',
            Notifications: 'notifications-outline',
            Profile:       'person-outline',
          };
          return <Icon name={icons[route.name] ?? 'ellipse-outline'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Feed"          component={FeedScreen}          options={{ title: 'Discover' }} />
      <Tab.Screen name="Saved"         component={SavedScreen}         options={{ title: 'Saved' }} />
      <Tab.Screen name="Leaderboard"   component={LeaderboardScreen}   options={{ title: 'Leaders' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="Profile"       component={ProfileScreen}       options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { isAuthenticated, hydrated } = useUserStore();
  if (!hydrated) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Auth" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen as any} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main"              component={TabNavigator} />
            <Stack.Screen name="OfferDetail"       component={OfferDetailScreen} />
            <Stack.Screen name="VendorDashboard"   component={VendorDashboardScreen} />
            <Stack.Screen name="VendorOffers"      component={VendorOffersScreen} />
            <Stack.Screen name="VendorAnalytics"   component={VendorAnalyticsScreen} />
            <Stack.Screen name="EditVendorProfile" component={EditVendorProfileScreen} />
            <Stack.Screen name="AdminDashboard"    component={AdminDashboardScreen} />
            <Stack.Screen name="AdminUsers"        component={AdminUsersScreen} />
            <Stack.Screen name="AdminVendors"      component={AdminVendorsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
