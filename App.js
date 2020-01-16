

// Example of Text to Speech conversion
import React, { Component } from 'react';
//Import React
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  TextInput,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
//Import basic component from React Native
import Slider from '@react-native-community/slider';
//Import slider for the tuning of pitch and speed
import Tts from 'react-native-tts';
//Import library for Text to Speech
import Voice from "react-native-voice";

import { Colors } from "react-native/Libraries/NewAppScreen";

export default class App extends Component {
  state = {
    voices: [],
    ttsStatus: 'initiliazing',
    selectedVoice: null,
    speechRate: 0.5,
    speechPitch: 1,
    text: 'Enter Text like Hello About React',

    recognized: "",
    started: "",
    results: []
  };

  constructor(props) {
    super(props);
    Tts.addEventListener('tts-start', event =>
      this.setState({ ttsStatus: 'started' })
    );
    Tts.addEventListener('tts-finish', event =>
      this.setState({ ttsStatus: 'finished' })
    );
    Tts.addEventListener('tts-cancel', event =>
      this.setState({ ttsStatus: 'cancelled' })
    );
    Tts.setDefaultRate(this.state.speechRate);
    Tts.setDefaultPitch(this.state.speechPitch);
    Tts.getInitStatus().then(this.initTts);

    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechRecognized = this.onSpeechRecognized.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
  }
  // ----------------------------------

  onSpeechStart(e) {
    this.setState({
      started: "√"
    });
  }
  onSpeechRecognized(e) {
    this.setState({
      recognized: "√"
    });
  }
  onSpeechResults(e) {
    this.setState({
      results: e.value
    });
  }

  async _startRecognition(e) {
    this.setState({
      recognized: "",
      started: "",
      results: []
    });
    try {
      await Voice.start("en-US");
    } catch (e) {
      console.error(e);
    }
  }


  // ----------------------------------



  initTts = async () => {
    const voices = await Tts.voices();
    const availableVoices = voices
      .filter(v => !v.networkConnectionRequired && !v.notInstalled)
      .map(v => {
        return { id: v.id, name: v.name, language: v.language };
      });
    let selectedVoice = null;
    if (voices && voices.length > 0) {
      selectedVoice = voices[0].id;
      try {
        await Tts.setDefaultLanguage(voices[0].language);
      } catch (err) {
        //Samsung S9 has always this error: "Language is not supported"
        console.log(`setDefaultLanguage error `, err);
      }
      await Tts.setDefaultVoice(voices[0].id);
      this.setState({
        voices: availableVoices,
        selectedVoice,
        ttsStatus: 'initialized',
      });
    } else {
      this.setState({ ttsStatus: 'initialized' });
    }
  };

  readText = async () => {
    Tts.stop();
    Tts.speak(this.state.text);
  };

  setSpeechRate = async rate => {
    await Tts.setDefaultRate(rate);
    this.setState({ speechRate: rate });
  };

  setSpeechPitch = async rate => {
    await Tts.setDefaultPitch(rate);
    this.setState({ speechPitch: rate });
  };

  onVoicePress = async voice => {
    try {
      await Tts.setDefaultLanguage(voice.language);
    } catch (err) {
      // My Samsung S9 has always this error: "Language is not supported"
      console.log(`setDefaultLanguage error `, err);
    }
    await Tts.setDefaultVoice(voice.id);
    this.setState({ selectedVoice: voice.id });
  };

  renderVoiceItem = ({ item }) => {
    return (
      <Button
        title={`${item.language} - ${item.name || item.id}`}
        color={this.state.selectedVoice === item.id ? undefined : '#969696'}
        onPress={() => this.onVoicePress(item)}
      />
    );
  };

  render() {
    const { results } = this.state
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Example of Text to Speech Conversion in React Native
        </Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>
            {`Speed: ${this.state.speechRate.toFixed(2)}`}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0.01}
            maximumValue={0.99}
            value={this.state.speechRate}
            onSlidingComplete={this.setSpeechRate}
          />
        </View>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>
            {`Pitch: ${this.state.speechPitch.toFixed(2)}`}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={2}
            value={this.state.speechPitch}
            onSlidingComplete={this.setSpeechPitch}
          />
        </View>
        <Text style={styles.sliderContainer}>
          {`Selected Voice: ${this.state.selectedVoice || ''}`}
        </Text>
        <TextInput
          style={styles.textInput}
          onChangeText={text => this.setState({ text })}
          value={this.state.text}
          onSubmitEditing={Keyboard.dismiss}
        />
        <TouchableOpacity style={styles.button} onPress={this.readText}>
          <Text>
            Click to Read Text ({`Status: ${this.state.ttsStatus || ''}`})
          </Text>
        </TouchableOpacity>
        <Text style={styles.sliderLabel}>Select the Voice from below</Text>
        <View style={{ height: '15%' }}>
          <FlatList
            style={{ width: '100%', marginTop: 5, }}
            keyExtractor={item => item.id}
            renderItem={this.renderVoiceItem}
            extraData={this.state.selectedVoice}
            data={this.state.voices}
          />
        </View>
        <View style={{ height: '50%' }}>
          <Text style={styles.title}>
            Example of Speech to Text Conversion in React Native
        </Text>
          {/* <Text style={styles.sectionTitle}>Transcript</Text> */}
          <View style={styles.body}>
            <Button style={styles.transcript}
              onPress={this._startRecognition.bind(this)}
              title="Start"
            />
          </View>
          <Text style={styles.sectionTitle}>Transcript</Text>
          {results.map((result, index) => (
            <Text style={styles.transcript}> {result}</Text>
          ))}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    width: 300,
    margin: 10,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    padding: 5,
  },
  sliderLabel: {
    textAlign: 'center',
    marginRight: 20,
  },
  slider: {
    flex: 1,
  },
  textInput: {
    borderColor: 'gray',
    borderWidth: 1,
    color: 'black',
    width: 300,
    textAlign: 'center',
    height: 40,
  },
  transcript: {
    textAlign: "center",
    color: "#000"
  },
  body: {
    marginTop: 10,
    backgroundColor: Colors.white
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.black
  }
});