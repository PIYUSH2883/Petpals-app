import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

const db = getFirestore();

const DoctorsScreen = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const doctorList = [];

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.role === 'Doctor' && data.showInList) {
                    doctorList.push({ id: docSnap.id, ...data });
                }
            });

            setDoctors(doctorList);
            setFilteredDoctors(doctorList);
        };

        fetchDoctors();
    }, []);

    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredDoctors(doctors);
        } else {
            const filtered = doctors.filter((doctor) =>
                doctor.city?.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredDoctors(filtered);
        }
    }, [searchText, doctors]);

    const renderDoctor = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <Text style={styles.name}>Dr. {item.name}</Text>
                <Text style={styles.info}>📍 {item.city}</Text>
                <Text style={styles.info}>📞 {item.mobile}</Text>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headertxt}>Doctors</Text>
            </View>

            <TextInput
                style={styles.searchBar}
                placeholder="Search by city..."
                value={searchText}
                onChangeText={setSearchText}
            />

            <FlatList
                data={filteredDoctors}
                keyExtractor={(item) => item.id}
                renderItem={renderDoctor}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>No doctors found.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        backgroundColor: '#F7F7F7',
    },
    header: {
        width:'100%',
        backgroundColor: '#FF914D',
        textAlign: 'center',
        paddingTop:15,
        paddingBottom:10,
        justifyContent:'center',
        alignItems:'center',
        marginBottom:10
        
    },
    headertxt: {
        marginTop:20,
        fontSize:25,
        color:'#fff'
    },
    searchBar: {
        height: 45,
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderColor: '#ccc',
        borderWidth: 1,
        marginHorizontal:10
    },
    card: {
        backgroundColor: '#fff',
        marginBottom: 15,
        padding: 10,
        borderRadius: 10,
        elevation: 2,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
    },
    info: {
        fontSize: 14,
        marginTop: 4,
    },
    list: {
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        marginTop: 50,
        fontSize: 16,
    },
});

export default DoctorsScreen;
