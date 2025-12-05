import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '@/screens/Home';
import { ProfileScreen } from '@/screens/Profile';
import { WrongRecordsScreen } from '@/screens/WrongRecords';
import { PracticeStack } from './PracticeStack';
import { Header } from '@/components/business/Header';

const Tab = createBottomTabNavigator();

export function MainNavigator() {
  return (
    <>
      <Header />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#999',
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{ title: '首页', tabBarLabel: '首页' }}
        />
        <Tab.Screen
          name="Practice"
          component={PracticeStack}
          options={{ title: '练习', tabBarLabel: '练习' }}
        />
        <Tab.Screen
          name="WrongRecords"
          component={WrongRecordsScreen}
          options={{ title: '错题', tabBarLabel: '错题' }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: '我的', tabBarLabel: '我的' }}
        />
      </Tab.Navigator>
    </>
  );
}

