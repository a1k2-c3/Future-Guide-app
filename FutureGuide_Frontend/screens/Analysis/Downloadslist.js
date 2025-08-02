import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native';
import Colors from '../../constants/Colors';




const profileId = '6851040cd76f99883f82f90c';


export default function Downloadslist() {

  const handleDownloadPDF = async (item, index) => {
    try {
      const htmlContent = `
  <html>
    <head>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          color: #333;
          background-color: #f9f9f9;
        }
        .container {
          margin: 40px;
          padding: 20px;
          border: 2px solid #ccc;
          border-radius: 10px;
          background-color: #fff;
          height:87%;

        }
        h1 {
          margin-bottom: 16px;
          color: #2c3e50;
        }
        h3 {
          margin-top: 24px;
          color: #34495e;
        }
        ul {
          padding-left: 20px;
        }
        li {
          margin-bottom: 6px;
        }
        p {
          margin: 4px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Resume Analysis - Demo ${index + 1}</h1>
        <p><strong>Profile ID:</strong> ${item.profileId}</p>
        <p><strong>Score:</strong> ${item.score}/100</p>
        
        <h3>Analysis Breakdown:</h3>
        <ul>
          ${item.analysis.map(line => `<li>${line}</li>`).join('')}
        </ul>
        
        <h3>Suggestions:</h3>
        <ul>
          ${item.suggestions.map(s => `<li>${s}</li>`).join('')}
        </ul>
        
      </div>
    </body>
  </html>
`;



      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // Ensure no other sharing is active
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('❌ Error creating PDF:', error);
      Alert.alert('Error', 'Could not generate or share the PDF.');
    }
  };


  const handleDelete = async (id) => {
    try {
      // Optional: ask for confirmation
      Alert.alert(
        'Delete Confirmation',
        'Are you sure you want to delete this file?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              // console.log(id);
              const response = await axios.delete(
                `https://futureguide-backend.onrender.com/api/analyses/${id}`
              );
              await fetchFiles();
              // console.log('✅ File deleted:', response.data);

              // Refresh file list by filtering out deleted item
              // setFiles((prevFiles) => prevFiles.filter((file) => file._id !== id));
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      Alert.alert('Error', 'Failed to delete the file.');
    }
  };




  const renderItem = ({ item, index }) => (
    <View style={styles.fileBox}>
      <View style={styles.nameboxx}>
        <Text style={styles.fileName}>Demo {index + 1}</Text>
        <Text>{item.timestamp}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleDownloadPDF(item, index)}>
          <Icon name="download" size={24} color="#007bff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleDelete(item._id)}>
          <Icon name="trash-can-outline" size={24} color="red" style={{ marginLeft: 12 }} />
        </TouchableOpacity>
      </View>
    </View>
  );



  const [files, setFiles] = useState([]);
  const fetchFiles = async () => {
    try {
      const response = await axios.get(`https://futureguide-backend.onrender.com/api/analyses/profile/${profileId}`);
      setFiles(response.data.data);
    } catch (error) {
      console.error('Error fetching files:', error);
      Alert.alert('Error', 'Failed to fetch files.');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />
      <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={files}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No files found.</Text>}
      />
      </SafeAreaView>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  fileBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#b2dfdb',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outerContainer: {
      flex: 1,
      backgroundColor: Colors.primary,
    },
    safeArea: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    header: {
      backgroundColor: Colors.primary,
      paddingBottom: 20,
      paddingHorizontal: 20,
      elevation: 4,
      shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      color: Colors.textLight,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    headerSubtitle: {
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: 15,
    },
    notificationButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors.accent,
      borderWidth: 1.5,
      borderColor: Colors.primary,
    },
    searchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: Colors.background,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 50,
      elevation: 2,
      shadowColor: Colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      borderWidth: 1,
      borderColor: Colors.divider,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: Colors.textDark,
      height: '100%',
    },
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginTop: 5, // Reduced from 10 to 5 to decrease the gap
    },
    resultsText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors.textDark,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: Colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    sortText: {
      marginLeft: 4,
      color: Colors.textMedium,
      fontSize: 14,
      fontWeight: '500',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
});

