import React, { useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Button } from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useLogin } from "../../Login_id_passing";

export default function ResumeHome({ navigation }) {
  const { loginId } = useLogin();
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const [upload, setupload] = useState(1);
  const [backData, uploadbackData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileData, setFileData] = useState(null);

  // Get profile ID from context with fallback
  const profileId = loginId?.profile_id || "asdfgsadgf";

  console.log("ResumeHome - LoginId from context:", loginId);
  console.log("ResumeHome - Using profileId:", profileId);

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: false,
      });
      console.log("ResumeHome - Document picker result:", result);

      if (!result.canceled) {
        const file = result.assets[0];
        console.log("ResumeHome - Selected file:", {
          name: file.name,
          size: file.size,
          uri: file.uri,
        });

        if (file.size > MAX_SIZE) {
          Alert.alert("File too large", "Please select a PDF under 10MB.");
        } else {
          const formData = new FormData();
          formData.append("resumeFile", {
            uri: file.uri,
            name: file.name,
            type: "application/pdf",
          });
          formData.append("profileId", profileId);
          
          setFileData(formData);
          setupload(2);
          setIsUploading(false);
        }
      } 
      else {
        console.log("ResumeHome - Document picker canceled");
        setupload(3);
      }
    } catch (error) {
      console.error("ResumeHome - Error picking PDF:", error);
      setupload(3);
      setIsUploading(false);
      Alert.alert("Error", "Could not pick the PDF.");
    }
  };

  const handleSubmit = () => {
    if (upload === 2 && fileData) {
      console.log("ResumeHome - Navigating to ResLoader with fileData");
      navigation.navigate("ResLoader", { fileData: fileData });
    } else if (upload === 1) {
      Alert.alert(
        "No File Picked",
        "Please upload your resume PDF before submitting."
      );
    } else if (upload === 3) {
      Alert.alert("Upload Failed", "Please try uploading the file again.");
    }
  };

  return (
    <View style={styles.resoverall}>
      <Text style={styles.reshead1}>Upload Resume</Text>
      <Text style={styles.reshead2}>Pdf Format Only (Max File Size 10MB)</Text>

      <View style={styles.imgtag}>
        {upload === 2 ? (
          <Text style={[styles.notice, { color: "green" }]}>
            (Resume analyzed successfully)
          </Text>
        ) : upload === 1 ? null : (
          <Text style={[styles.notice, { color: "red" }]}>
            (Upload failed - please try again)
          </Text>
        )}
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={pickPDF}
          disabled={isUploading}
        >
          <View style={styles.icon}>
            {isUploading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Resume is Uploading...</Text>
              </View>
            ) : (
              <Ionicons name="cloud-upload-outline" size={80} color="#e8e8e8" />
            )}
          </View>
          <View style={styles.text}>
            <Text style={styles.label}>
              {isUploading ? "" : "Click to upload PDF"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Button
        mode="contained"
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "SUBMIT"}
      </Button>
    </View>
  );
}
const Height = Dimensions.get("window").height;
const styles = StyleSheet.create({
  resoverall: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  reshead1: {
    fontSize: 24,
    fontWeight: "600",
    // color: '#ffffff',
    marginBottom: 8,
    // textAlign: 'center',
  },
  reshead2: {
    fontSize: 15,
    fontWeight: "400",
    color: "grey",
  },
  notice: {
    textAlign: "center",
    // color: 'red',
    fontWeight: "400",
    fontSize: 16,
    marginVertical: 10,
  },
  imgtag: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadBox: {
    height: Height * 0.56,
    width: 300,
    backgroundColor: "#212121",
    borderWidth: 2,
    borderColor: "red",
    borderStyle: "dashed",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#e8e8e8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  icon: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    color: "#e8e8e8",
    fontWeight: "400",
    fontSize: 16,
  },
  submitButton: {
    marginTop: 30,
    padding: 5,
    backgroundColor: "#004d40",
    // backgroundColor:'skyblue',
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#e8e8e8",
    fontSize: 16,
    marginTop: 10,
  },
});