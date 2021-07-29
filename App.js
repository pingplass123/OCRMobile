import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Button, Image, StyleSheet, Text, View,TouchableOpacity } from 'react-native';





const API_KEY = 'KEY_API_GOOGLE_VISION';
const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

async function callGoogleVisionAsync(image) {
  const body = {
    requests: [
      {
        image: {
          content: image,
        },
        features: [
          {
            type: 'TEXT_DETECTION',
          },
        ],
      },
    ],
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  console.log(result);
  return result.responses[0].fullTextAnnotation.text
}

export default function App() {
  const [image, setImage] = React.useState(null);
  const [status, setStatus] = React.useState(null);
  const [permissions, setPermissions] = React.useState(false);

  const askPermissionsAsync = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    } else {
      setPermissions(true);
    }
  };

  const takePictureAsync = async () => {
    // set image to base64 and take image from camera
    const { cancelled, uri, base64 } = await ImagePicker.launchCameraAsync({
      base64: true,
    });

    if (!cancelled) {
      setImage(uri);
      setStatus('Loading...');
      try {
        const result = await callGoogleVisionAsync(base64);
        setStatus(result);
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    } else {
      setImage(null);
      setStatus(null);
    }
  };

  const pickImage = async () => {
    // set image to base64 and pick image from gallery
    const {cancelled, uri, base64} = await ImagePicker.launchImageLibraryAsync({
      base64: true,
    });
    
    if (!cancelled) {
      setImage(uri);
      setStatus('Loading...');
      try {
        const result = await callGoogleVisionAsync(base64);
        setStatus(result);
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    } else {
      setImage(null);
      setStatus(null);
    }
  };

  return (
    <View style={styles.container}>
    <Text style={styles.title}>Text Recognition</Text>
      {permissions === false ? (
        <Button onPress={askPermissionsAsync} title="Ask permissions" />
      ) : (
        <>
          
          {image && <Image style={styles.image} source={{ uri: image }}/>}
          {status && <Text style={styles.text}>{status}</Text>}

          <TouchableOpacity style={styles.button} onPress={takePictureAsync}>
          <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick a Photo</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '80%',
    height: undefined,
    aspectRatio: 1,
    
  },
  text: {
    margin: 5,
  },
  title: {
    fontSize: 35,
    marginVertical: 40,
    
  },
  button: {
    backgroundColor: '#47477b',
    color: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
  },
});