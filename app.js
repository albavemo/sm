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
		// Audio file configuration
		const config = {
			encoding: 'LINEAR16',
			languageCode: 'en-US'
		};
		// Prepare request
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
	console.log('Process started');
	// Execute the php script that is found on the route recived by parameter
	runner.exec("php "+ruta + " ", (error, stdout, stderr) => {
	if(error) {
		console.log(`exec errorern: ${error}`);
		return;
	}
	console.log(` ${stdout}`);
});
}

// Execute the upload method
// Used to actualize the content of the recieved file
app.use(upload())

// Routing of the '/' to procese the html file when you open the website
app.get('/', (req, res) => {
res.sendFile(index.html)
});

// When a query of '/upload' is recieved this method process the Speech to Text service:
app.post('/upload',(req, res) => {
	// Check if there's any input
	if(req.files){
		
		var file = req.files.filename;
		var filename = req.files.filename.name;
			// Saves the file that the user wants to upload locally on a determinated route
			file.mv("/home/albavemo11/git/sm/media/uploaded/"+filename, function(err){
				if(err){
					console.log(err);
					res.send("error occured")
				}
				else {
					var audioFile = fs.readFileSync("/home/albavemo11/git/sm/media/uploaded/"+filename);
					// Executes the Speech to Text method
					generateText(audioFile);
					// Downloads and serves to the client the resultant txt output
					res.download("/home/albavemo11/git/sm/media/s2t_output.txt");
				}
			});
	}
});

// When a query of '/apis' is recieved this method process the videoAI script
app.post('/apis', (req,res) => {
	// Check if there's any input
	if(req.files) {
		var file = req.files.filename;
		var filename = req.files.filename.name;
			// Saves the file that the user wants to upload locally on a determinated route
			file.mv("/home/albavemo11/git/sm/input/"+filename, function(err){
        			if(err){
					console.log(err);
					res.send("error, not file found");
				}
				else{
					var videoAIRute = "/home/albavemo11/git/sm/public/index.php";
					// Call the php that runs the python code
					readScript(videoAIRute);
					// Downloads and serves to the client the resultant mp4 output
					res.download("/home/albavemo11/git/sm/output/vd_output.mp4");
				}
			});
	}
});

// Initialization console message
app.listen(port, () => console.log(`Ap llistening on port ${port}!` + '\n'));


