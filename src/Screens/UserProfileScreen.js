import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Text as RNText, SafeAreaView } from 'react-native';
import { Text, Checkbox, Card } from 'react-native-paper';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../Firebase/FirebaseConfig';

const db = getFirestore();

const UserProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [showInList, setShowInList] = useState(false);
  const [helpedAnimals, setHelpedAnimals] = useState([]);
  const [adoptedAnimals, setAdoptedAnimals] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const uid = auth.currentUser.uid;
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUserData(data);

        if (data.role === 'doctor') {
          setShowInList(data.showInList ?? true);
        }

        // Fetch helped animals from 'animals' collection by ID
        if (Array.isArray(data.helpedAnimals) && data.helpedAnimals.length > 0) {
          const helped = await Promise.all(
            data.helpedAnimals.map(async (animalId) => {
              const animalSnap = await getDoc(doc(db, 'animals', animalId));
              return animalSnap.exists() ? { id: animalSnap.id, ...animalSnap.data() } : null;
            })
          );
          setHelpedAnimals(helped.filter(Boolean));
        }

        // Fetch adopted animals from 'animals' collection by ID
        if (Array.isArray(data.adoptedAnimals) && data.adoptedAnimals.length > 0) {
          const adopted = await Promise.all(
            data.adoptedAnimals.map(async (animalId) => {
              const animalSnap = await getDoc(doc(db, 'animals', animalId));
              return animalSnap.exists() ? { id: animalSnap.id, ...animalSnap.data() } : null;
            })
          );
          setAdoptedAnimals(adopted.filter(Boolean));
        }
      }
    };

    fetchData();
  }, []);

  const handleToggleShowInList = async () => {
    const uid = auth.currentUser.uid;
    const newValue = !showInList;
    await updateDoc(doc(db, 'users', uid), { showInList: newValue });
    setShowInList(newValue);
  };

  if (!userData) return null;

  return (
    <SafeAreaView>
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>My Profile</Text>
      </View>

      {/* User Info Card */}
      <Card style={styles.cardContainer}>
        <Card.Content>
          <Text style={styles.label}>Name: {userData.name}</Text>
          <Text style={styles.label}>Email: {userData.email}</Text>
          <Text style={styles.label}>City: {userData.city}</Text>
          <Text style={styles.label}>Role: {userData.role}</Text>

          {userData.role === 'doctor' && (
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={showInList ? 'checked' : 'unchecked'}
                onPress={handleToggleShowInList}
              />
              <Text onPress={handleToggleShowInList}>Show my profile in doctor list</Text>
            </View>
          )}
        </Card.Content>
      </Card>
          <View style={styles.lower}>
      {/* Helped Animals Section */}
      <Text style={styles.sectionTitle}>Animals Helped</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {helpedAnimals.length > 0 ? helpedAnimals.map(animal => (
          <View key={animal.id} style={styles.animalCard}>
            <Image source={{ uri: animal.imageUrl }} style={styles.animalImage} />
            <RNText style={styles.animalName}>{animal.name}</RNText>
            <RNText style={styles.animalSub}>{animal.type}</RNText>
          </View>
        )) : <RNText>No animals helped yet.</RNText>}
      </ScrollView>

      {/* Adopted Animals Section */}
      <Text style={styles.sectionTitle}>Animals Adopted</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {adoptedAnimals.length > 0 ? adoptedAnimals.map(animal => (
          <View key={animal.id} style={styles.animalCard}>
            <Image source={{ uri: animal.imageUrl }} style={styles.animalImage} />
            <RNText style={styles.animalName}>{animal.name}</RNText>
            <RNText style={styles.animalSub}>{animal.type}</RNText>
          </View>
        )) : <RNText>No animals adopted yet.</RNText>}
      </ScrollView>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    paddingBottom: 40,
    
  },
  header: {
    backgroundColor: '#FF914D',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    paddingTop:30
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginHorizontal:15
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 10,
    color: '#FF914D',
    
  },
  horizontalScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  animalCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  animalImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 6,
  },
  animalName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  animalSub: {
    fontSize: 12,
    color: 'gray',
  },
  lower:{
    marginHorizontal:18
  }
});

export default UserProfileScreen;
