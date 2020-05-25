const express = require('express');
const fetch = require('node-fetch');
const cheerio = require ('cheerio');
const stream = require('stream');
const path = require('path');
const fs = require('fs');
const http = require('http');
const contentDisposition = require('content-disposition');

const app = express();
const port = 2022;
app.use(express.static(path.join(__dirname, 'public')));



function generateAudio(textFile){
	// Imports the Google Cloud client library
	const textToSpeech = require('@google-cloud/text-to-speech');

	// Import other required libraries
	const util = require('util');
	// Creates a client
	const client = new textToSpeech.TextToSpeechClient();
	async function quickStart() {
	  // The text to synthesize
	  const text = textFile;

	  // Construct the request
	  const request = {
	    input: {text: text},
	    // Select the language and SSML voice gender (optional)
	    voice: {languageCode: 'es-ES', ssmlGender: 'NEUTRAL'},
	    // select the type of audio encoding
	    audioConfig: {audioEncoding: 'MP3'},
	  };

	  // Performs the text-to-speech request
	  const [response] = await client.synthesizeSpeech(request);
	  // Write the binary audio content to a local file
	  const writeFile = util.promisify(fs.writeFile);
	  await writeFile('media/t2p_output.mp3', response.audioContent, 'binary');
	  console.log('Audio content written to file: t2s_output.mp3 \n');
	}
	quickStart();
}


function generateText(audioFile){
	// Imports the Google Cloud client library
	const speech = require('@google-cloud/speech');

	async function main() {
		// Creates a client
		const client = new speech.SpeechClient();
	  	// The audio to synthesize
		const audioBytes = audioFile.toString('base64');

		const audio = {
			content: audioBytes
		};

		const config = {
			encoding: 'LINEAR16',
			//sampleRateHertz: 16000,
			languageCode: 'en-US'
			//languageCode: 'es-ES'
		};

		const request = {
			audio: audio,
			config: config
		};

  		// Detects speech in the audio file
 		const [response] = await client.recognize(request);
		const transcription = response.results.map(result =>
			result.alternatives[0].transcript).join('\n');
			console.log('Transcription: ', transcription, '\n');

		// Create output file
		fs.writeFile("media/s2t_output.txt", transcription, (err) => {
  		if (err) throw err;
 			console.log('Text content written to file: s2t_output.txt \n');
		});
	}
	main().catch(console.error);
}

//here goes the routing
app.get('/', (req, res) => (res.send(index.html)));
app.get('/crawler', (req,res) => {

	var source = '/Users/AlbaVendrellMoya/Desktop/SM/hackathon/sm-hackovid/media/'
	var textInput_Name = 'data.txt'
	var audioInput_Name = 'example3.wav'
	
	var textFile = fs.readFileSync(source + textInput_Name,'utf8');
	var audioFile = fs.readFileSync(source +  audioInput_Name);

	generateAudio(textFile);
	generateText(audioFile);
	
});

app.listen(port, () => console.log(`Example app listening on port ${port}!` + '\n'));

