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
const authUrl = 'http://redbutton.xmig.net/button/reg_code_check/';

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
    setErrorMessage('');
    try {
      const headers = {
        'Content-type': 'application/json; charset=UTF-8',
      };
      const body = JSON.stringify({
        registration_code: `${inputValue}`,
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
      console.log('Responce error', error);

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
        registration_code: `${userId}`, // needs to be string not int
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
      alert(error);
    }
    setLoading(false);
  };

  if (!userId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={'light-content'} />
        <Input
          placeholder="Введите идентификационный номер"
          value={inputValue}
          containerStyle={styles.input}
          onChangeText={value => setInputValue(value)}
          errorStyle={[styles.error, styles.text]}
          errorMessage={errorMessage}
          keyboardType="number-pad"
        />
        <Button
          title="Войти"
          onPress={initUser}
          loading={loading}
          containerStyle={styles.button}
        />
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
            ...styles.alarmButton,
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
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
  },
  alarmButton: {
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
  errorText: {
    color: '#f00',
  },
  text: {
    fontSize: 20,
  },
  input: {
    width: '80%',
    alignSelf: 'center',
  },
  button: {
    width: '70%',
    alignSelf: 'center',
  },
});

export default App;
