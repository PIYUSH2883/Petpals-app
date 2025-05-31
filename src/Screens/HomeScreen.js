import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { auth, db } from '../Firebase/FirebaseConfig'; // ✅ Import db here
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore'; // ✅ Use getDocs for collections

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [animalData, setAnimalData] = useState([]);
  const flatListRef = useRef(null);
  const currentIndex = useRef(0);

  // ✅ Fetch all documents from "animals" collection
  const fetchAnimals = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'animals'));
      const animalsArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnimalData(animalsArray);
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
  };

  const filteredAnimalData = animalData.filter((animal) => animal.isAvailable);

  useEffect(() => {
    fetchAnimals();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (flatListRef.current && filteredAnimalData.length > 0) {
        currentIndex.current = (currentIndex.current + 1) % filteredAnimalData.length;
        flatListRef.current.scrollToIndex({ index: currentIndex.current, animated: true });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [filteredAnimalData]);

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text style={styles.caption}>{item.category} - {item.city}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <View style={{ width: 60 }} />
        <Text style={styles.appName}>PetPals</Text>
        <TouchableOpacity onPress={() => navigation.navigate(user ? 'Profile' : 'SignIn')}>
          <Text style={styles.navButton}>{user ? 'Profile' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        {user ? (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('UploadAnimal')}>
              <Text style={styles.buttonText}>Upload Animal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AllAnimals')}>
              <Text style={styles.buttonText}>See All Animals</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Doctors')}>
              <Text style={styles.buttonText}>Contact a Doctor</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.centered}>
            <Text style={styles.aboutTitle}>🐾 About PetPals</Text>
            <Text style={styles.aboutText}>We help animals get adopted and provide care to injured ones.</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {filteredAnimalData.length > 0 && (
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={filteredAnimalData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF914D',
    padding: 15,
    paddingTop: 40,
  },
  appName: {
    fontSize: 22,
    color: '#FFF8F0',
    fontWeight: 'bold',
  },
  navButton: {
    color: '#FFF8F0',
    fontWeight: '600',
  },
  main: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#FF914D',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFF8F0',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  centered: {
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  aboutText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666666',
  },
  carouselContainer: {
    paddingBottom: 20,
  },
  slide: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 2,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
    width: width * 0.8,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  caption: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
});

export default HomeScreen;
