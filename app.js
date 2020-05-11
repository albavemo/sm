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
	//const fs = require('fs');
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
	    voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
	    // select the type of audio encoding
	    audioConfig: {audioEncoding: 'MP3'},
	  };

	  // Performs the text-to-speech request
	  const [response] = await client.synthesizeSpeech(request);
	  // Write the binary audio content to a local file
	  const writeFile = util.promisify(fs.writeFile);
	  await writeFile('output.mp3', response.audioContent, 'binary');
	  console.log('Audio content written to file: output.mp3');
	}
	quickStart();
}



//here goes the routing
console.log("OKI")
app.get('/', (req, res) => (res.send(index.html)));
app.get('/crawler', (req,res) => {


	var textFile = fs.readFileSync('/Users/AlbaVendrellMoya/Desktop/SM/hackathon/sm-hackovid/data.txt','utf8');
	generateAudio(textFile);
	
});
app.listen(port, () => console.log(`Example app listening on port ${port}!` + '\n'));




