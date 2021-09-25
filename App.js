/* eslint-disable no-alert */
import React, {useEffect, useState} from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Input, Button} from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// TO DO: add NetInfo and handle loss of connection.

const sosUrl = 'http://redbutton.xmig.net/button/';
const authUrl = 'http://redbutton.xmig.net/auth/';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [responseData, setResponseData] = useState(null);
  const [userId, setuserId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await AsyncStorage.getItem('userId');
      if (user) {
        setuserId(user);
      }
      setLoading(false);
    })();
  }, []);

  const initUser = async val => {
    setLoading(true);
    try {
      const headers = {
        'Content-type': 'application/json; charset=UTF-8',
      };
      const body = JSON.stringify({
        registration_code: inputValue,
      });
      const {data: resp} = await axios({
        method: 'POST',
        body,
        url: authUrl,
        headers,
      });
      if (resp) {
        setuserId(resp);
        await AsyncStorage.setItem('userId', resp);
      }
    } catch (error) {
      setErrorMessage(
        'Ошибка регистрации, проверьте правильность введенных данных.',
      );
    }
    setLoading(false);
  };

  const presshandle = async () => {
    setResponseData(null);
    setLoading(true);
    try {
      const headers = {
        'Content-type': 'application/json; charset=UTF-8',
      };
      const body = JSON.stringify({
        registration_code: `${98}`, // needs to be string not int
      });
      const {data: resp} = await axios({
        method: 'POST',
        body,
        url: sosUrl,
        headers,
      });
      if (resp) {
        alert('Request sent!');
        setResponseData({
          response: resp,
          time: new Date().toLocaleTimeString(),
        });
      }
    } catch (error) {
      alert('error');
    }

    setLoading(false);
  };

  if (!userId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={'light-content'} />
        <Input
          placeholder="Введите идентификационный номер"
          // leftIcon={{ type: 'font-awesome', name: 'comment' }}
          value={inputValue}
          style={styles}
          onChangeText={value => setInputValue(value)}
          errorStyle={{color: 'red'}}
          errorMessage={errorMessage}
        />
        <Button title="Войти" onPress={initUser} loading={loading} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'} />
      <View>
        <Pressable
          style={({pressed}) => ({
            backgroundColor: !pressed ? '#ff0000' : '#ff8f8f',
            ...styles.button,
          })}
          onPress={presshandle}>
          <Text style={styles.buttonTitle}>SOS</Text>
        </Pressable>
        {responseData && (
          <Text style={[styles.buttonTitle, styles.successMessage]}>
            Request sent successfully at {responseData.time}
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
