import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import * as FirebaseCore from 'expo-firebase-core';
import Note from '../components/note';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications';
import firebase from '../Firebase';

// import Notifications from 'expo' import Constants from 'expo-constants';
// import * as Permissions from 'expo-permissions';

import {useCallback} from 'react';

export default class Main extends React.Component {
    constructor(props) {
        super(props);
        // this.getUser(); this.subscriber = firebase     .firestore()
        // .collection("Users")     .doc('emre')     .onSnapshot(doc => {
        // this.setState({             noteText: doc                 .data()     .note
        // })     })

        this.state = {
            noteArray: [],
            noteText: ''
        }
    }

    registerForPushNotificationsAsync = async() => {
        if (Constants.isDevice) {
            const {status: existingStatus} = await
            Permissions.getAsync(Permissions.NOTIFICATIONS);
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const {status} = await Permissions.askAsync(Permissions.NOTIFICATIONS);
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log(token);
            this.setState({expoPushToken: token});
        } else {
            alert('Must use physical device for Push Notifications ');
        }
        
        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [
                    0, 250, 250, 250
                ],
                lightColor: '#FF231F7C'
            });
        }
    };

    /* getUser = async() => {
        const userDocument = await firebase
            .firestore()
            .collection("Users")
            .doc('emre')
            .get()
        console.log(userDocument);
    }*/

    /* getLists(callback) {
        let ref = firebase
            .firestore()
            .collection('Users')
            .doc(firebase.auth().currentUser.uid);
        let unsubscribe = ref.onSnapshot(snapshot => {
            let noteArray = []

            snapshot.forEach(doc => {
                noteArray.push({
                    id: doc.id,
                    ...doc.data()
                });
                callback(noteArray);
            });
        })

    }*/

    async componentDidMount() {
        await this.registerForPushNotificationsAsync();

        /*this.getLists(noteArray => {
            this.setState({
                noteArray,
                user
            }, () => {
                this.setState({loading: false});

            });
        });*/

        /* try {
            const user = firebase
                .auth()
                .currentUser;

            firebase
                .firestore()
                .collection("Users")
                .doc(firebase.auth().currentUser.uid)
                .get()
                .then(querySnapshot => {
                    this.setState({
                        noteText: querySnapshot
                            .data()
                            .getNote()
                    })
                });

            firebase
                .firestore()
                .collection('Users')
                .get()
                .then(snapshot => {
                    snapshot.forEach(doc => {
                        if (doc && doc.exists) {
                            this.setState({

                                data: [
                                    ...this.state.data, {
                                        noteText: doc
                                            .data()
                                            .getNote()
                                    }
                                ]

                            })

                        }
                    });
                });
        } catch (error) {
            console.log(error);
        }*/
    }

    render() {
        let notes = this
            .state
            .noteArray
            .map((val, key) => {
                return <Note
                    key={key}
                    keyval={key}
                    val={val}
                    deleteMethod={() => this.deleteNote(key)}/>
            })
        return (
            <View style={styles.container}>

                <View
                    style={{
                    padding: 15,
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderColor: 'lightgray'
                }}>
                    <Text style={styles.headerText}>Notlarım</Text>
                    <Text>User: {firebase
                            .auth()
                            .currentUser
                            .uid}</Text>
                </View>

                <ScrollView style={styles.scrollContainer}>
                    {notes}
                </ScrollView>

                <View style={styles.footer}>
                    <TextInput
                        style={styles.textInput}
                        onChangeText={(noteText) => this.setState({noteText})}
                        value={this.state.noteText}
                        placeholder='Yapılak işi giriniz...'
                        placeholderTextColor='white'
                        underlineColorAndroid='transparent'></TextInput>
                </View>

                <TouchableOpacity
                    onPress={this
                    .addTask
                    .bind(this)}
                    style={styles.addButton}>
                    <Text style={styles.addButtonText}>Ekle</Text>
                </TouchableOpacity>

            </View>
        );
    }

    addTask() {
        if (this.state.noteText) {
            var date = new Date();
            let userId = firebase
                .auth()
                .currentUser
                .uid;

            this
                .state
                .noteArray
                .push({
                    'date': "Tarih: " + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate(),
                    'note': this.state.noteText
                });

            firebase
                .firestore()
                .collection(`Users/${userId}/notes`)
                .add({
                    note: this.state.noteText,
                    date: date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate()
                })

            this.setState({noteArray: this.state.noteArray});
            this.setState({noteText: this.state.noteText});
        }
    };

    getNote = () => {
        console.log(this.state.note);
    }

    deleteNote(key) {
        this
            .state
            .noteArray
            .splice(key, 1);

        this.setState({noteArray: this.state.noteArray});
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerText: {
        color: 'black',
        fontSize: 12,
        fontWeight: 'bold'
    },
    scrollContainer: {
        flex: 1,
        marginBottom: 100
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10
    },
    textInput: {
        alignSelf: 'stretch',
        color: '#fff',
        padding: 20,
        backgroundColor: 'gray',
        borderTopWidth: 2,
        borderTopColor: '#ededed'
    },
    addButton: {
        position: 'absolute',
        zIndex: 11,
        right: 20,
        bottom: 90,
        backgroundColor: '#3933FF',
        width: 90,
        height: 90,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8
    },
    addButtonText: {
        color: '#fff',
        fontSize: 12
    }
});
