import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUserStore } from './src/store/useUserStore';
import Navigation from './src/navigation';

export default function App() {
  const { hydrate } = useUserStore();

  useEffect(() => { hydrate(); }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Navigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
