#!/usr/bin/python

import os
import sys
from google.cloud import videointelligence as vi
from googletrans import Translator
import io
import numpy as np
import cv2

video_client = vi.VideoIntelligenceServiceClient()

def getScenes(video, framerate, name = ""):
    features = [vi.enums.Feature.SHOT_CHANGE_DETECTION]

    operation = video_client.annotate_video(input_content=video, features=features)
    print("\nProcessing video *" + name.upper() + "* for shot change annotations:")

    result = operation.result(timeout=1000)
    print('\nFinished processing.')

    scenesTime = []

    for shot in result.annotation_results[0].shot_annotations:
        start_time = shot.start_time_offset.seconds + shot.start_time_offset.nanos / 1e9
        end_time = shot.end_time_offset.seconds + shot.end_time_offset.nanos / 1e9
        scenesTime.append([round(start_time*framerate), round(end_time*framerate)])

    return scenesTime

def getLabels(video, name = ""):
    features = [vi.enums.Feature.LABEL_DETECTION]

    operation = video_client.annotate_video(input_content=video, features=features)
    print("\nProcessing video *" + name.upper() + "* for shot change annotations:")

    result = operation.result(timeout=120)
    print('\nFinished processing.')
    AR = result.annotation_results[0]

    translator = Translator()
    text_file = open("videoOutput.txt", "w")
    for i in range(len(AR.segment_label_annotations)-1):        
        text = translator.translate(AR.segment_label_annotations[i].entity.description, dest='es').text
        text_file.write( text + "\n")
    text = translator.translate(AR.segment_label_annotations[i+1].entity.description, dest='es').text
    text_file.write(text)
    text_file.close()


if __name__ == "__main__":
    videoName = "input/fancy.mp4"

    
    video = cv2.VideoCapture(videoName)

    fps = round(video.get(cv2.CAP_PROP_FPS))
    width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

    with io.open(videoName, 'rb') as movie:
        videoBin = movie.read()

    scenes = getScenes(videoBin, fps, videoName)

    fourcc = cv2.VideoWriter_fourcc(*'MP4V')
    sceneIdx = 0
    currentFrame = 0

    while(video.isOpened()):
        scene = scenes[sceneIdx]

        if ( currentFrame == scene[0] ):
            out = cv2.VideoWriter("scenes/scene_" + str(sceneIdx) + ".mp4", fourcc, fps, (width,height))
        elif ( currentFrame == scene[1] ):
            out.release()
            sceneIdx += 1

        ret, frame = video.read()

        out.write(frame)
        currentFrame += 1

    video.release()

    cv2.destroyAllWindows()
