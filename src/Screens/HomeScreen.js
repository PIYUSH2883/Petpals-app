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
import { auth } from '../Firebase/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const { width } = Dimensions.get('window');

const animalData = [
  { id: '1', image: require('../../assets/dog1.jpg'), category: 'Dog', city: 'Delhi' },
  { id: '2', image: require('../../assets/cat1.jpg'), category: 'Cat', city: 'Mumbai' },
  { id: '3', image: require('../../assets/dog2.jpg'), category: 'Dog', city: 'Bangalore' },
];

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const flatListRef = useRef(null);
  const currentIndex = useRef(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (flatListRef.current) {
        currentIndex.current = (currentIndex.current + 1) % animalData.length;
        flatListRef.current.scrollToIndex({ index: currentIndex.current, animated: true });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.caption}>{item.category} - {item.city}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={{ width: 60 }} />
        <Text style={styles.appName}>PetPals</Text>
        <TouchableOpacity onPress={() => {
          if (user) {
            navigation.navigate('Profile');
          } else {
            navigation.navigate('Login');
          }
        }}>
          <Text style={styles.navButton}>{user ? 'Profile' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        {user ? (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('UploadAnimal')}
            >
              <Text style={styles.buttonText}>Upload Animal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AllAnimals')}
            >
              <Text style={styles.buttonText}>See All Animals</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.centered}>
            <Text style={styles.aboutTitle}>🐾 About PetPals</Text>
            <Text style={styles.aboutText}>We help animals get adopted and provide care to injured ones.</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* FlatList Slider */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={animalData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0', // Background color
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF914D', // Primary color
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
    backgroundColor: '#FF914D', // Primary color
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFF8F0', // Light text on primary
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
    color: '#333333', // Primary text
  },
  aboutText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666666', // Secondary text
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
    color: '#333333', // Primary text
  },
});

export default HomeScreen;
