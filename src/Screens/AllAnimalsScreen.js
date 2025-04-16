import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { db } from '../Firebase/FirebaseConfig';
import { Linking } from 'react-native';
import {auth} from '../Firebase/FirebaseConfig'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { collection, query, where, getDocs } from 'firebase/firestore';

// Optional: Uncomment if you want reverse geocoding
import * as Location from 'expo-location';

const screenWidth = Dimensions.get('window').width;

const AllAnimalsScreen = () => {
  const [animals, setAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const q = query(collection(db, 'animals'), where('isAvailable', '==', true));
        const querySnapshot = await getDocs(q);
        const fetchedAnimals = [];

        for (const doc of querySnapshot.docs) {
          const data = { id: doc.id, ...doc.data() };

          // Optional: Convert coords to city
          // if (data.latitude && data.longitude) {
          //   const city = await getCityFromCoords(data.latitude, data.longitude);
          //   data.city = city;
          // }

          fetchedAnimals.push(data);
        }

        setAnimals(fetchedAnimals);
      } catch (error) {
        console.log('Error fetching animals:', error);
      }
    };

    fetchAnimals();
  }, []);
  const currentUser = auth.currentUser;


  const handleCloseDetail = () => setSelectedAnimal(null);

  const handlePurposeAction = async (purpose) => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      alert('Please sign in to perform this action.');
      return;
    }
  
    try {
      // 1. Update the animal's isAvailable to false
      const animalRef = doc(db, 'animals', selectedAnimal.id);
      await updateDoc(animalRef, {
        isAvailable: false,
      });
  
      // 2. Add animal reference to user's profile
      const userRef = doc(db, 'users', user.uid);
      const fieldName = purpose === 'Adoption' ? 'adoptedAnimals' : 'helpedAnimals';
  
      await updateDoc(userRef, {
        [fieldName]: arrayUnion(selectedAnimal.id),
      });
  
      setAnimals((prev) => prev.filter((animal) => animal.id !== selectedAnimal.id));
      alert(`Thank you for choosing to ${purpose === 'Adoption' ? 'adopt' : 'help'}!`);
      setSelectedAnimal(null);
  
      // 3. Remove animal from local state
    } catch (error) {
      console.error('Error updating documents:', error);
      alert('Something went wrong. Please try again.');
    }
  };


  const renderCards = () => {
    return animals.map((item, index) => (
      <TouchableOpacity
        key={item.id}
        onPress={() =>{ 
          console.log(item)
          setSelectedAnimal(item)}}
        style={styles.cardContainer}
      >
        <View style={styles.card}>
          {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.info}>Type: {item.type}</Text>
          <Text style={styles.info}>Purpose: {item.purpose}</Text>
          <Text style={styles.info}>City: {item.city || 'Unknown'}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTxt}>All Animals</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.grid}>{renderCards()}</View>
      </ScrollView>

      {/* Modal for Animal Details */}
      {selectedAnimal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={selectedAnimal !== null}
          onRequestClose={handleCloseDetail}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalCard}>
              <TouchableOpacity onPress={handleCloseDetail} style={styles.closeButton}>
                <Text style={{ fontSize: 20, color: '#fff' }}>X</Text>
              </TouchableOpacity>
              <Image
                source={{ uri: selectedAnimal.imageUrl }}
                style={styles.modalImage}
              />
              <Text style={styles.modalName}>{selectedAnimal.name}</Text>
              <Text style={styles.modalInfo}>Type: {selectedAnimal.type}</Text>
              <Text style={styles.modalInfo}>Purpose: {selectedAnimal.purpose}</Text>
              <Text style={styles.modalInfo}>City: {selectedAnimal.city || 'Unknown'}</Text>
              <Text style={styles.modalInfo}>
  Address: {selectedAnimal.address || 'Not Provided'}
</Text>

<TouchableOpacity
  style={styles.mapButton}
  onPress={() => {
    const latitude = selectedAnimal.location.latitude
    const longitude = selectedAnimal.location.longitude
    if (latitude && longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      // Open in browser
      Linking.openURL(url);
    } else {
      
      alert('Location not available');
    }
  }}
>
  <Text style={styles.mapButtonText}>Get Directions</Text>
</TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handlePurposeAction(selectedAnimal.purpose)}
              >
                <Text style={styles.actionButtonText}>
                  {selectedAnimal.purpose === 'Adopt' ? 'Adopt' : 'Help'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8',margin:0 },
  scrollContainer: {
    paddingBottom: 30,
    paddingHorizontal:10,
    paddingTop:10
  },
  header:{
    backgroundColor:"#FF914D",
    paddingTop:40,
    paddingBottom:10
  },
  headerTxt:{
    fontSize:25,
    marginLeft:12,
    color:"#fff",
    fontWeight:400
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: (screenWidth - 36) / 2, // Adjust for spacing & margin
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 130,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 13,
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    borderRadius: 40,
    paddingVertical: 2,
    paddingHorizontal: 8,
    zIndex: 1,
  },
  modalImage: {
    height: 200,
    width: '100%',
    borderRadius: 12,
    marginBottom: 10,
  },
  modalName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 6,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#7EB93F',
    borderRadius: 6,
    width: '60%',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AllAnimalsScreen;
