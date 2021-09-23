/* eslint-disable no-alert */
import React, {useState} from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const url = 'http://localhost:8080/button/';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const presshandle = async () => {
    setData(null);
    setLoading(true);
    try {
      const headers = {
        'Content-type': 'application/json; charset=UTF-8',
      };
      const body = JSON.stringify({
        // title: 'help',
        // body: 'immediately',
        registration_code: 98,
      });
      const {data: resp} = await axios({
        method: 'POST',
        body,
        url: url,
        headers,
      });
      if (resp) {
        alert('Request sent!');
        setData({response: resp, time: new Date().toLocaleTimeString()});
      }
    } catch (error) {
      alert('error');
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'} />
      <View>
        {loading ? (
          <ActivityIndicator size="large" color="#6dc963" />
        ) : (
          <Pressable
            style={({pressed}) => ({
              backgroundColor: !pressed ? '#ff0000' : '#ff8f8f',
              ...styles.button,
            })}
            onPress={presshandle}>
            <Text style={styles.buttonTitle}>SOS</Text>
          </Pressable>
        )}
        {data && (
          <Text style={[styles.buttonTitle, styles.successMessage]}>
            Request sent successfully at {data.time}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: 'gray',
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 200,
    borderColor: '#cdcdcd',
    borderWidth: 3,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTitle: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  successMessage: {
    color: '#6dc963',
    textAlign: 'center',
  },
});

export default App;
