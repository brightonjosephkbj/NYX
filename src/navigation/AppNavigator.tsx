import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';
import MiniPlayer from '../components/MiniPlayer';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import DownloadsScreen from '../screens/DownloadsScreen';
import ARIAScreen from '../screens/ARIAScreen';
import PlayerScreen from '../screens/PlayerScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const icons: Record<string, string> = { Home: '⬡', Search: '◎', Library: '▤', Downloads: '⬇', ARIA: '◈' };
  return <Text style={{ fontSize: focused ? 22 : 18, color }}>{icons[name] || '●'}</Text>;
}

function Tabs({ navigation }: any) {
  const { theme } = useThemeStore();
  const showMiniPlayer = usePlayerStore(s => s.showMiniPlayer);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: theme.bg, borderTopColor: theme.border, borderTopWidth: 1, height: 60, paddingBottom: 6 },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 1 },
          tabBarIcon: ({ focused, color }) => <TabIcon name={route.name} focused={focused} color={color} />,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Library" component={LibraryScreen} />
        <Tab.Screen name="Downloads" component={DownloadsScreen} />
        <Tab.Screen name="ARIA" component={ARIAScreen} />
      </Tab.Navigator>
      {showMiniPlayer && (
        <MiniPlayer onPress={() => navigation.navigate('Player')} />
      )}
    </View>
  );
}

export default function AppNavigator() {
  const { theme } = useThemeStore();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: theme.bg } }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Player" component={PlayerScreen} options={{ presentation: 'modal', cardStyleInterpolator: ({ current }) => ({ cardStyle: { opacity: current.progress } }) }} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
