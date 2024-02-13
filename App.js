import { StatusBar } from 'expo-status-bar';
import { Button, Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MESSAGES, addDoc, collection, firestore, onSnapshot, query, serverTimestamp } from './firebase/config';
import { useEffect, useState } from 'react';
import { convertFirebaseTimeToJS } from './helpers/time';
import { orderBy } from 'firebase/firestore';

export default function App() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    const q = query(collection(firestore, MESSAGES), orderBy('created', 'desc'))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tempMessages = []

      querySnapshot.forEach((doc) => {
        const messageObj = {
          id: doc.id,
          text: doc.data().text,
          created: convertFirebaseTimeToJS(doc.data().created)
        }
        tempMessages.push(messageObj)
      })
      setMessages(tempMessages)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const save = async () => {
    const docRef = await addDoc(collection(firestore, MESSAGES), {
      text: newMessage,
      created: serverTimestamp()
    }).catch(error => console.log(error))

    setNewMessage('')
    Keyboard.dismiss()
    console.log('Message saved')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }}>
        {
          messages.map((message) => (
            <View style={styles.message} key={message.id}>
              <Text style={styles.messageInfo}>{message.created}</Text>
              <Text>{message.text}</Text>
            </View>
          ))
        }
      </ScrollView>
      <View style={{ flex: 1, marginTop: 20 }}>
        <TextInput
          placeholder='Send message...'
          value={newMessage}
          onChangeText={text => setNewMessage(text)}
          style={styles.input}
        />
        <Button title='Send' type='button' onPress={save} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignContent: 'space-between',
    justifyContent: 'center',
    margin: 10
  },
  message: {
    position: 'relative',
    padding: 10,
    margin: 10,
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  messageInfo: {
    fontSize: 12,
    fontStyle: 'italic'
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 20,
  }
});
