import { createStaticNavigation, StaticParamList, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, useState } from 'react';
import { StyleSheet, Text, Pressable , View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-root-toast';
import { RootSiblingParent } from 'react-native-root-siblings';

//==================================
//Helpers
//==================================


//==================================
//Screen Stack
//==================================
type RootStackParamList = StaticParamList<typeof RootStack>;

declare global
{
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Start',
  screens: {
    Start: {
      screen: StartScreen,
      options: {title: 'Welcome'}
    },

    //Player Screens
    PlayerSignIn:
    {
      screen: PlayerSignInScreen,
      options: {title: 'Player sign in'}
    },
    PlayerBuzzer:
    {
      screen: PlayerBuzzerScreen,
      options: {title: 'GAME TIME'}
    },

    //Admin Screens
    CreateLobby:
    {
      screen: CreateLobby,
      options: {title: 'Create Lobby'}
    },

    AdminHome:
    {
      screen: AdminHome,
      options: {title: 'Admin Main'}
    },

    AdminSignIn:
    {
      screen: AdminSignInScreen,
      options: {title: 'Admin sign in'}
    },
  }
})

const Navigation = createStaticNavigation(RootStack);

//==================================
// Screens
//==================================
//todo: lag compensation
function AdminSignInScreen() { 
  const navigator = useNavigation();
  
  return (
    <View style={styles.container}>
      
    </View>
  )
}

function AdminHome() { 
  const navigator = useNavigation();
  //clear queue (reset buzzers)
  async function ResetQueue(){
    console.log('resetting queue');
    const response = await fetch('http://10.0.0.173:3000/resetQueue', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json'}
    })
  }
  return(
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={() => ResetQueue()}>
        <Text>Reset Buzzers</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => ResetQueue()}>
        <Text>Change Scores</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => ResetQueue()}>
        <Text>Remove Players</Text>
      </Pressable>
    </View>
  )
  //change points
  
  //remove players


}
function CreateLobby() { //Todo: do
  const navigator = useNavigation();
  //Player Limit
  
  //honestly gonna put this on hold. setting up a webserver is fun but tangental to my goal of learning app development
  return (
    <View style={styles.container}>

    </View>
  )
}


function PlayerBuzzerScreen() {
  const navigator = useNavigation();
  const {playerName} = useGameContext();
  const [isBuzzed, SetBuzzStatus] = useState(false);

  async function BuzzIn() {
    console.log(playerName,'is buzzing in');
    try {
      const response = await fetch('http://10.0.0.173:3000/buzz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: playerName })
      });

      SetBuzzStatus(true);
    } catch (error) {
      SetBuzzStatus(false);
    }
    
    
  }
    return (
      <View style={styles.container}>
        <Text>Play game!</Text>
        <Pressable style={[styles.button, {backgroundColor: isBuzzed ? 'red' : 'green' }]} onPress={() => !isBuzzed && BuzzIn()}>
          <Text>BUZZ IN!</Text>
        </Pressable>
      </View>
    )
}

function PlayerSignInScreen() {
  const navigator = useNavigation();
  const { playerName, SetPlayerName } = useGameContext();

  //api functions
  async function CreatePlayer() {
    const controller = new AbortController();
    const apiWait = setTimeout(() => controller.abort(), 5000); //5000 ms

    console.log('attempting to create player:',playerName);
    Toast.show('Submitting, please wait...',{position: Toast.positions.TOP});
    try {
      const response = await fetch('http://10.0.0.173:3000/createPlayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: playerName }),
      signal: controller.signal
    });
    clearTimeout(apiWait);
    console.log(response.status,": added player",playerName,"successfully");
    navigator.navigate('PlayerBuzzer');
    //const data = await response.json();
  //console.log(data);
    
    //FAIL
    } catch (error) {
      Toast.show('Could not add player.',{position:Toast.positions.TOP});
      console.log('Could not add player:',playerName)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      >

      <View style = {styles.container}>
        <Text>Choose Your Name</Text>
        <TextInput 
          style = {styles.textInput}
          value = {playerName}
          onChangeText = {SetPlayerName}
        />
        <Text>{playerName}</Text>
        <Pressable style = {styles.button} onPress={()=> playerName && CreatePlayer()}>
          <Text>Join!</Text>
        </Pressable>
      </View>

    </KeyboardAvoidingView>
  )
}

function StartScreen(){
  const navigator = useNavigation();
  return (
    <View style={styles.container}>
      <Text>Welcome</Text>
      <Pressable 
        style = {styles.button} 
        onPress = {()=>navigator.navigate('PlayerSignIn')}>
        <Text>Player Enter</Text>
      </Pressable>

      <Pressable
        style = {styles.button}
        onPress = {()=>navigator.navigate('CreateLobby')}>
        <Text>Create Lobby</Text> 
      </Pressable>

      <Pressable
        style = {styles.button}
        onPress = {()=>navigator.navigate('AdminHome')}> 
        <Text>Admin Enter</Text> 
      </Pressable>
    </View>
  )
}

//==================================
//API Functions !!!should i do this later? not sure how this works
//==================================

//==================================
//App Logic
//==================================

//Player Data Storage
const GameContext = createContext<GameContextType | undefined>({playerName: "Default Name B" , SetPlayerName: () => {}});

function useGameContext() 
{
  const context = useContext(GameContext);
  if (!context) throw new Error('...');  
  return context;
}

type GameContextType = 
{
  playerName: string;
  SetPlayerName: (name:string) => void;
}


export default function App() {
  const [playerName, SetPlayerName] = useState('') //so it initializes this variable to '' when the app starts 

  return (
    <RootSiblingParent>
      <GameContext value={{ playerName, SetPlayerName }}>
        <Navigation />
      </GameContext>
    </RootSiblingParent>
  );
}

//==================================
//Stylesheet
//==================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    width: 200,
    height: 100,
    borderRadius: 5, //round corners, as opposed to borderWidth
    backgroundColor: '#ec3737',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminContainer: {
    flex: 1,
    backgroundColor: '#13ad3a',
  },
  textInput: 
  {
    width: 200,
    height: 50,
    borderWidth: 1
  }

});
