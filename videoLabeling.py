#!/usr/bin/python

import os
import io
from google.cloud import videointelligence as vi
from moviepy.editor import *
import Text2Speech

video_client = vi.VideoIntelligenceServiceClient()


PATH = os.path.dirname(__file__) + "/"
INPUT = PATH + "input/"
OUTPUT = PATH + "output/"
SCENES = PATH + "scenes/"
AUDIOS = PATH + "audios/"

def getScenes(videoName):
    with io.open(videoName, 'rb') as movie:
        video = movie.read()

    features = [vi.enums.Feature.SHOT_CHANGE_DETECTION]

    operation = video_client.annotate_video(input_content=video, features=features)
    print("\nProcessing video *" + videoName[:-4].upper() + "* for shot change annotations:")

    result = operation.result(timeout=1000)
    print('\nFinished processing.')

    scenesTime = []

    for shot in result.annotation_results[0].shot_annotations:
        start_time = shot.start_time_offset.seconds + shot.start_time_offset.nanos / 1e9
        end_time = shot.end_time_offset.seconds + shot.end_time_offset.nanos / 1e9
        scenesTime.append([start_time, end_time])

    return scenesTime

def getLabels(videoName):
    with io.open(videoName, 'rb') as movie:
        video = movie.read()

    print(type(video))

    features = [vi.enums.Feature.LABEL_DETECTION]

    operation = video_client.annotate_video(input_content=video, features=features)
    print("\nProcessing video *" + videoName.upper() + "* for labels in scene:")

    result = operation.result(timeout=120)
    AR = result.annotation_results[0]

    labels = ""
    for i in range(len(AR.segment_label_annotations)):        
        text = AR.segment_label_annotations[i].entity.description
        print(text)
        labels += text + "\n"
    print('\nFinished processing.')

    if ( labels == "" ):
        labels = "No labels found"

    return labels


if __name__ == "__main__":
    file_names = os.listdir(INPUT)
    for videoName in file_names:
        if ".mp4" in videoName:
            video = VideoFileClip(INPUT + videoName)

            fps = round(video.reader.fps)
            width = round(video.w)
            height = round(video.h)

            scenes = getScenes(INPUT + videoName)
            labels = []

            sceneClips = []
            labelClips = []
            for i, scene in enumerate(scenes):
                sceneName = "scene_" + str(i) + ".mp4"
                video.subclip(scene[0], scene[1]).write_videofile( SCENES + sceneName)
                labels = getLabels(SCENES + sceneName)

                audioName = "Audio_" + str(i) + ".mp3"
                Text2Speech.synthesize_text(labels, AUDIOS + audioName)
                
                audioClip = AudioFileClip(AUDIOS + audioName)
                ColorClip((round(width), round(height)), (0, 0, 0), duration=audioClip.duration + 1).write_videofile(AUDIOS + audioName[:-4] + ".mp4", fps=fps, audio=AUDIOS + audioName)

            previousVideo = concatenate_videoclips([VideoFileClip(AUDIOS + "audio_0.mp4"), VideoFileClip(SCENES + "scene_0.mp4")])
            for i in range(1, len(scenes)):
                currentVideo = VideoFileClip(SCENES + "scene_" + str(i) + ".mp4")        
                currentLabels = VideoFileClip(AUDIOS + "audio_" + str(i) + ".mp4")
                previousVideo = concatenate_videoclips([previousVideo, currentLabels, currentVideo])
            previousVideo.write_videofile(OUTPUT + videoName)
