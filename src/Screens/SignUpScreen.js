import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { TextInput, Button } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Firebase/FirebaseConfig';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore();

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState('user');
  const [mobile, setMobile] = useState(''); // Mobile number state

  const handleSignUp = async () => {
    if (!name || !email || !password || !city || !role || !mobile) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        city,
        role,
        mobile,
        uid: user.uid,
      });

      Alert.alert('Success', 'Account created!');
      navigation.navigate('SignIn');
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

      <TextInput
        label="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
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
  placeholder={{ label: 'Select the role', value: null,  }}
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
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: '#FF914D',
    borderRadius: 10,
    padding: 4,
    color: '#fff',
    marginTop:30
  },
  input: { marginBottom: 10 },
  pickerInput: {
    padding: 8,
    marginBottom:6,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 20,
  },
  signUpButton: {
    marginTop: 20,
    backgroundColor: '#FF914D',
    borderRadius:10
  }
});

export default SignUpScreen;
