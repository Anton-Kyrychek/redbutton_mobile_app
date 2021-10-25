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
import {Input, Button, Overlay, Icon} from 'react-native-elements';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// TO DO: add NetInfo and handle loss of connection.
// TO DO: add Preson first name & last name & age for confirmation after login.

const sosUrl = 'https://redbutton.xmig.net/button/';
const authUrl = 'https://redbutton.xmig.net/button/reg_code_check/';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [userData, setUserData] = useState({
    first_name: null,
    last_name: null,
    birth_year: null,
  });
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

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const onConfirmUserData = async () => {
    setuserId(`${inputValue}`);
    await AsyncStorage.setItem('userId', `${inputValue}`);
  };

  const onRejectUserData = () => {
    setShowOverlay(false);
  };

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
        data: body,
        url: authUrl,
        headers,
      });

      if (resp) {
        setUserData(resp);
        setShowOverlay(true);
      }
    } catch (error) {
      setErrorMessage(
        "Помилка реєстрації, перевірте правильність введених даних або зв'яжіться з адміністратором.",
      );
    }
    setLoading(false);
  };

  const presshandle = async () => {
    if (loading) {
      return;
    }
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
        data: body,
        url: sosUrl,
        headers,
      });
      if (resp) {
        setResponseData({
          response: resp,
          time: new Date().toLocaleTimeString(),
        });
      }
    } catch (error) {
      alert(error);
    }
    await sleep(5000);
    setLoading(false);
  };

  if (userId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={'light-content'} />
        <View>
          <Pressable
            style={({pressed}) => ({
              backgroundColor: !pressed ? '#ff0000' : '#ff8f8f',
              ...styles.alarmButton,
              zIndex: 100,
            })}
            onPress={presshandle}>
            <AnimatedCircularProgress
              size={200}
              width={15}
              fill={100}
              duration={5000}
              tintColor="#6dc963"
              backgroundColor="#3d5875">
              {() => <Text style={styles.buttonTitle}>Надіслати виклик</Text>}
            </AnimatedCircularProgress>
          </Pressable>

          {responseData && (
            <Text style={[styles.buttonTitle, styles.successMessage]}>
              Виклик відправлений успішно о {responseData.time}
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'} />
      <Input
        placeholder="Введіть реєстраційний номер підопічного"
        value={inputValue}
        containerStyle={styles.input}
        onChangeText={value => setInputValue(value)}
        errorStyle={[styles.error, styles.text]}
        errorMessage={errorMessage}
        keyboardType="number-pad"
      />
      <Button
        title="Увiйти"
        onPress={initUser}
        loading={loading}
        containerStyle={styles.button}
      />
      <Overlay
        overlayStyle={{
          ...styles.overlayContainer,
        }}
        onBackdropPress={() => setShowOverlay(false)}
        isVisible={showOverlay}>
        <Text style={styles.overlayTitle}>Підтвердіть правильність даних</Text>
        <Icon
          type="material"
          name="close"
          color="#000000"
          size={28}
          containerStyle={styles.closeIcon}
          onPress={() => setShowOverlay(false)}
        />
        <Text style={styles.overlayText} numberOfLines={2}>
          {`${userData?.first_name || ''} ${userData?.last_name || ''}`}
        </Text>
        <Text style={styles.overlayText}>{userData?.birth_year}</Text>
        <View style={styles.overlayButtonContainer}>
          <Button
            title="Редагувати код"
            onPress={onRejectUserData}
            buttonStyle={styles.cancelButton}
            containerStyle={styles.overlayButton}
          />
          <Button
            title="Інформація правильна"
            buttonStyle={styles.confirmButton}
            onPress={onConfirmUserData}
            containerStyle={styles.overlayButton}
          />
        </View>
      </Overlay>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // main container
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
    textAlign: 'center',
  },
  buttonTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
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
    width: '95%',
    alignSelf: 'center',
  },
  button: {
    width: '70%',
    alignSelf: 'center',
  },

  // overlay

  overlayContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  overlayButtonContainer: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  overlayText: {
    fontSize: 20,
    textTransform: 'capitalize',
    paddingVertical: 5,
  },
  confirmButton: {
    backgroundColor: '#6dc963',
  },
  cancelButton: {
    backgroundColor: '#f00',
  },
  overlayButton: {
    marginHorizontal: 5,
  },
  closeIcon: {
    position: 'absolute',
    right: 15,
    top: 10,
  },
  overlayTitle: {
    fontSize: 16,
    paddingBottom: 10,
  },
});

export default App;
