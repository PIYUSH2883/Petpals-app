import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '../Firebase/FirebaseConfig';

const UploadAnimalScreen = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }
    })();
  }, []);
  

  const getLocation = async () => {
    try {
      setLoadingLocation(true);
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name || !type || !purpose || !city || !address || !image || !location) {
      Alert.alert('Incomplete', 'Please fill all fields and capture image/location.');
      return;
    }

    try {
      setUploading(true);

      const imageId = uuid.v4();
      const response = await fetch(image);
      const blob = await response.blob();

      const storageRef = ref(storage, `animals/${imageId}.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      const animalData = {
        name,
        type,
        purpose,
        city,
        address,
        imageUrl: downloadURL,
        location,
        isAvailable: true,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'animals'), animalData);

      Alert.alert('Success', 'Animal details uploaded successfully!');

      // Reset fields
      setName('');
      setType('');
      setPurpose('');
      setCity('');
      setAddress('');
      setImage(null);
      setLocation(null);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Animal</Text>

      <TextInput
        placeholder="Animal Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#666666"
      />

      <TextInput
        placeholder="Type (e.g. Dog, Cat)"
        value={type}
        onChangeText={setType}
        style={styles.input}
        placeholderTextColor="#666666"
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={purpose}
          onValueChange={(itemValue) => setPurpose(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Purpose" value="" />
          <Picker.Item label="Adopt" value="Adopt" />
          <Picker.Item label="Help" value="Help" />
        </Picker>
      </View>

      <TextInput
        placeholder="City"
        value={city}
        onChangeText={setCity}
        style={styles.input}
        placeholderTextColor="#666666"
      />

      <TextInput
        placeholder="Address (Where the animal is located)"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
        placeholderTextColor="#666666"
      />

      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>{image ? 'Retake Image' : 'Take Image'}</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <TouchableOpacity onPress={getLocation} style={styles.button}>
        <Text style={styles.buttonText}>Get Location</Text>
      </TouchableOpacity>

      {loadingLocation ? (
        <ActivityIndicator size="small" color="#FFC857" style={{ marginVertical: 10 }} />
      ) : (
        location && (
          <Text style={styles.locationText}>
            📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        )
      )}

      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitText}>Submit</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    padding: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    color: '#333333',
  },
  button: {
    backgroundColor: '#FF914D',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,
  },
  locationText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  submitButton: {
    backgroundColor: '#FF914D',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    color: '#333333',
  }
});

export default UploadAnimalScreen;
