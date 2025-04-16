import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { TextInput, Button } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Firebase/FirebaseConfig';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Import Firestore

const db = getFirestore(); // Initialize Firestore

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState('user');

  const handleSignUp = async () => {
    if (!name || !email || !password || !city || !role) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        city,
        role,
        uid: user.uid,
      });

      Alert.alert('Success', 'Account created!');
      navigation.navigate('SignIn'); // Navigate to SignIn screen
    } catch (error) {
      Alert.alert('Signup Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="City"
        value={city}
        onChangeText={setCity}
        mode="outlined"
        style={styles.input}
      />

      <RNPickerSelect
        onValueChange={(value) => setRole(value)}
        items={[
          { label: 'User', value: 'User' },
          { label: 'Doctor', value: 'Doctor' },
        ]}
        value={role}
        style={{
          inputAndroid: {
            ...styles.pickerInput,
            backgroundColor: 'white',
            color: '#333',
          },
          inputIOS: {
            ...styles.pickerInput,
            backgroundColor: 'white',
            color: '#333',
          },
          placeholder: {
            color: '#aaa',
          },
          iconContainer: {
            top: 10,
            right: 12,
          },
        }}
      />

      <Button
        mode="contained"
        onPress={handleSignUp}
        style={styles.signUpButton}
      >
        Sign Up
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center'  , backgroundColor:'#FF914D' , borderRadius:20 , padding:4 , color:'#fff' },
  input: { marginBottom: 10 },
  pickerInput: {
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  signUpButton: { marginTop: 20 , 
    backgroundColor:'#FF914D',
    
   }
});

export default SignUpScreen;
