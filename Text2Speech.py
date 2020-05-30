import os
from google.cloud import texttospeech

def synthesize_text(text, location):

    # Instantiates a client
    client = texttospeech.TextToSpeechClient()

    # Set the text input to be synthesized
    synthesis_input  = texttospeech.types.SynthesisInput(text=text)

    # Build of the voice request
    voice = texttospeech.types.VoiceSelectionParams(
        language_code='en-GB',
        ssml_gender=texttospeech.enums.SsmlVoiceGender.FEMALE)

    # Type of audio file returned
    audio_config = texttospeech.types.AudioConfig(
        audio_encoding=texttospeech.enums.AudioEncoding.MP3)
    
    # Perform the text-to-speech request on the text input with the selected
    # voice parameters and audio file type
    response = client.synthesize_speech(synthesis_input , voice, audio_config)

    # The response's audio_content is binary.
    with open(location, 'wb') as out:
        # Write the response to the output file.
        out.write(response.audio_content)
