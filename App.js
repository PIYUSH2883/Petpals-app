// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/Firebase/FirebaseConfig';

import { ActivityIndicator, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';

import HomeScreen from './src/Screens/HomeScreen';
import SignUpScreen from './src/Screens/SignUpScreen';
import SignInScreen from './src/Screens/SignInScreen';
import UploadAnimalScreen from './src/Screens/UploadAnimalScreen';
import AllAnimalsScreen from './src/Screens/AllAnimalsScreen';

import UserProfileScreen from './src/Screens/UserProfileScreen';
import DoctorsScreen from './src/Screens/DoctorsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="Doctors" component={DoctorsScreen} />
              <Stack.Screen name="UploadAnimal" component={UploadAnimalScreen} />
              <Stack.Screen name="AllAnimals" component={AllAnimalsScreen} />
              <Stack.Screen name="Profile" component={UserProfileScreen} />
            </>
          ) : (
            <>
            
             <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="SignIn" component={SignInScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
