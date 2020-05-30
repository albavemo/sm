#!/usr/bin/python

import os
import io
from google.cloud import videointelligence as vi
from moviepy.editor import *
import Text2Speech

# Init the video labelling variables
video_client = vi.VideoIntelligenceServiceClient()

# Usefull constants
PATH = os.path.dirname(__file__) + "/"
INPUT = PATH + "Input/"
OUTPUT = PATH + "Output/"
SCENES = PATH + "Scenes/"
AUDIOS = PATH + "Audios/"

# Get scenes returns the timestamps of the shot changes
def getScenes(videoName):

    # Here we read the binary data of the video
    with io.open(videoName, 'rb') as movie:
        video = movie.read()

    # Here we tell google we want the shot changes of the video
    features = [vi.enums.Feature.SHOT_CHANGE_DETECTION]

    # Here we send the video to google and wait for the result
    operation = video_client.annotate_video(input_content=video, features=features)
    print("\nProcessing video *" + videoName[:-4].upper() + "* for shot change annotations:")

    result = operation.result(timeout=1000)
    print('\nFinished processing.')

    # Here we store the data in a list of pairs [start, end]
    scenesTime = []
    for shot in result.annotation_results[0].shot_annotations:
        start_time = shot.start_time_offset.seconds + shot.start_time_offset.nanos / 1e9
        end_time = shot.end_time_offset.seconds + shot.end_time_offset.nanos / 1e9
        scenesTime.append([start_time, end_time])

    return scenesTime

# This function returns the labels detected in a scene
def getLabels(videoName):

    # Here we read the binary data of the video
    with io.open(videoName, 'rb') as movie:
        video = movie.read()

    # Here we tell google we want the labels of a video
    features = [vi.enums.Feature.LABEL_DETECTION]

    # Here we send the video to google and wait for the result
    operation = video_client.annotate_video(input_content=video, features=features)
    print("\nProcessing video *" + videoName.upper() + "* for labels in scene:")

    result = operation.result(timeout=120)
    AR = result.annotation_results[0]

    # Here we store the labels in a string
    labels = ""
    for i in range(len(AR.segment_label_annotations)):
        text = AR.segment_label_annotations[i].entity.description
        print(text)
        labels += text + "\n"
    print('\nFinished processing.')

    # If no labels found we set the return string to "Not labels found"
    if ( labels == "" ):
        labels = "No labels found"

    return labels


if __name__ == "__main__":
    # Here we get all the videos in the input folder
    file_names = os.listdir(INPUT)

    # We will process every .mp4 or .avi file in the input folder
    for videoName in file_names:
        if ".mp4" in videoName:

            # We read the video file into a VideoFileClip object from the moviepy library
            video = VideoFileClip(INPUT + videoName)

            # We store usefull data from the video
            fps = round(video.reader.fps)
            width = round(video.w)
            height = round(video.h)

            # Then we process the video to get the shot changes
            scenes = getScenes(INPUT + videoName)

            # After getting the shot changes we iterate for every scene...
            for i, scene in enumerate(scenes):
                # ... and we render a different video for every scene in the SCENES folder
                sceneName = "scene_" + str(i) + ".mp4"
                video.subclip(scene[0], scene[1]).write_videofile( SCENES + sceneName)

                # Then we get the labels for every scene
                labels = getLabels(SCENES + sceneName)

                # Then the video with the voice of the labels is generated
                audioName = "Audio_" + str(i) + ".mp3"
                Text2Speech.synthesize_text(labels, AUDIOS + audioName)
                audioClip = AudioFileClip(AUDIOS + audioName)
                ColorClip((width, height), (0, 0, 0), duration=audioClip.duration + 1).write_videofile(AUDIOS + audioName[:-4] + ".mp4", fps=fps, audio=AUDIOS + audioName)

            # Lastly we concatenate every audio description + scene to get the final video
            previousVideo = concatenate_videoclips([VideoFileClip(AUDIOS + "audio_0.mp4"), VideoFileClip(SCENES + "scene_0.mp4")])
            for i in range(1, len(scenes)):
                currentVideo = VideoFileClip(SCENES + "scene_" + str(i) + ".mp4")
                currentLabels = VideoFileClip(AUDIOS + "audio_" + str(i) + ".mp4")
                previousVideo = concatenate_videoclips([previousVideo, currentLabels, currentVideo])

            # Rendering of the final video
            previousVideo.write_videofile(OUTPUT + "vd_output")
