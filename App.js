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
import {useNetInfo} from '@react-native-community/netinfo';
import axios from 'axios';

const sosUrl = 'https://redbutton.xmig.net/button/';
const authUrl = 'https://redbutton.xmig.net/button/reg_code_check/';

const App = () => {
  const {isInternetReachable} = useNetInfo();
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
    } finally {
      await sleep(5000);
      setLoading(false);
    }
  };

  const canSendSignal = isInternetReachable && !loading;

  if (userId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={'light-content'} />
        {!isInternetReachable && (
          <Text numberOfLines={2} style={styles.noConnection}>
            Відсутнє підключення до Інтернету, виклик допомоги неможливий.
          </Text>
        )}
        <View style={styles.buttonContainerStyle}>
          <Pressable
            style={({pressed}) => ({
              backgroundColor: !canSendSignal
                ? '#8d8d8d'
                : !pressed
                ? '#ff0000'
                : '#ff8f8f',
              ...styles.alarmButton,
            })}
            onPress={presshandle}
            disabled={!isInternetReachable}>
            {!canSendSignal ? (
              <AnimatedCircularProgress
                size={200}
                width={15}
                fill={100}
                duration={isInternetReachable ? 5000 : 0}
                tintColor={isInternetReachable ? '#6dc963' : '#3d5875'}
                backgroundColor="#3d5875">
                {() => <Text style={styles.buttonTitle}>Надіслати виклик</Text>}
              </AnimatedCircularProgress>
            ) : (
              <Text style={styles.buttonTitle}>Надіслати виклик</Text>
            )}
          </Pressable>

          {responseData && !loading && (
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
      {!isInternetReachable && (
        <Text numberOfLines={2} style={styles.noConnection}>
          Відсутнє підключення до Інтернету, ініціалізація неможлива.
        </Text>
      )}
      <Input
        placeholder="Введіть номер"
        label="Введіть реєстраційний номер підопічного"
        value={inputValue}
        containerStyle={styles.inputCuntainer}
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
        disabledTitleStyle={styles.disabledButtonTitle}
        disabledStyle={styles.disabledButton}
        disabled={!isInternetReachable}
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
            disabledTitleStyle={styles.disabledButtonTitle}
            disabledStyle={styles.disabledButton}
            disabled={!isInternetReachable}
          />
          <Button
            title="Інформація правильна"
            buttonStyle={styles.confirmButton}
            onPress={onConfirmUserData}
            containerStyle={styles.overlayButton}
            disabledTitleStyle={styles.disabledButtonTitle}
            disabledStyle={styles.disabledButton}
            disabled={!isInternetReachable}
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
    color: '#fff',
  },
  successMessage: {
    paddingTop: 10,
    color: '#6dc963',
    textAlign: 'center',
  },
  errorText: {
    color: '#f00',
  },
  text: {
    fontSize: 20,
  },
  inputCuntainer: {
    width: '95%',
    alignSelf: 'center',
  },
  button: {
    width: '70%',
    alignSelf: 'center',
  },
  noConnection: {
    position: 'absolute',
    top: 0,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    width: '100%',
    height: '15%',
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#ff0000',
  },
  disabledButton: {
    backgroundColor: '#8d8d8d',
  },
  disabledButtonTitle: {
    color: '#fff',
  },
  buttonContainerStyle: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '90%',
    top: '25%',
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
    fontSize: 20,
    paddingVertical: 15,
    paddingTop: 20,
  },
});

export default App;
