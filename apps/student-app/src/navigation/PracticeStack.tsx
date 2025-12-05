import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DailyPracticeScreen } from '@/screens/Practice/Daily';
import { UnitPracticeScreen } from '@/screens/Practice/Unit';
import { AssessmentPracticeScreen } from '@/screens/Practice/Assessment';
import { PracticeHistoryScreen } from '@/screens/Practice/History';
import { PracticeSessionScreen } from '@/screens/Practice/Session';
import { PracticeDetailScreen } from '@/screens/Practice/Detail';
import { PracticeReportScreen } from '@/screens/Practice/Report';

const Stack = createStackNavigator();

export function PracticeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Daily"
        component={DailyPracticeScreen}
        options={{ title: '每日练习' }}
      />
      <Stack.Screen
        name="Unit"
        component={UnitPracticeScreen}
        options={{ title: '单元练习' }}
      />
      <Stack.Screen
        name="Assessment"
        component={AssessmentPracticeScreen}
        options={{ title: '综合评估' }}
      />
      <Stack.Screen
        name="History"
        component={PracticeHistoryScreen}
        options={{ title: '练习历史' }}
      />
      <Stack.Screen
        name="Session"
        component={PracticeSessionScreen}
        options={{ title: '练习会话', headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={PracticeDetailScreen}
        options={{ title: '练习详情' }}
      />
      <Stack.Screen
        name="Report"
        component={PracticeReportScreen}
        options={{ title: '练习报告' }}
      />
    </Stack.Navigator>
  );
}

