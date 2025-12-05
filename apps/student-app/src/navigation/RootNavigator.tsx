import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '@/stores/auth-store';
import { AuthStack } from './AuthStack';
import { MainNavigator } from './MainNavigator';
import { LoadingSpinner } from '@/components/business/LoadingSpinner';

const Stack = createStackNavigator();

export function RootNavigator() {
  const { isAuthenticated } = useAuthStore();
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        await useAuthStore.getState().check();
      } catch (error) {
        // Auth check failed
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, []);

  if (isChecking) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

