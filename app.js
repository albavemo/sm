
const express = require('express');
const fetch = require('node-fetch');
const cheerio = require ('cheerio');
const stream = require('stream');
const path = require('path');
const fs = require('fs');
const http = require('http');
const contentDisposition = require('content-disposition');
const upload = require('express-fileupload');
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

function readScript(ruta){
	var runner =  require('child_process');
	runner.exec("php "+ruta + " ", (error, stdout, stderr) => {
	if(error) {
		console.log(`exec error: ${error}`);
		return;
	}
	console.log(`stdout: ${stdout}`);
});
}


//declarar ruta a través de una variable que se setee al subir un archivo con el nombre de este
app.use(upload())

//here goes the routing
app.get('/', (req, res) => {
/*var ruta = "/public/index.php";
readScript(ruta);*/
res.sendFile(index.html)

});

app.post('/upload',(req, res) => {

	if(req.files){
		
		var file = req.files.filename;
		var filename = req.files.filename.name;
			file.mv("/home/albavemo11/git/sm/media/uploaded/"+filename, function(err){
				if(err){
					console.log(err);
					res.send("error occured")
				}
				else {
					var audioFile = fs.readFileSync("/home/albavemo11/git/sm/media/uploaded/"+filename);
					generateText(audioFile);
					res.download("/home/albavemo11/git/sm/media/s2t_output.txt");
				}
			});
	}
});
app.get('/apis', (req,res) => {

	var source = '/home/albavemo11/git/sm/media/'
	var textInput_Name = 'data.txt'
	var audioInput_Name = 'example3.wav'
	
	var textFile = fs.readFileSync(source + textInput_Name,'utf8');
	var audioFile = fs.readFileSync(source +  audioInput_Name);
	var videoAIRute = 'public/index.php';
	readScript(videoAIRute);
//	generateAudio(textFile);
//	generateText(audioFile);
	
});

app.listen(port, () => console.log(`Example app listening on port ${port}!` + '\n'));

