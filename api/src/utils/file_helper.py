import sqlite3
import uuid
import random
import os
import json
from moviepy.editor import VideoFileClip
from PIL import Image
import io
from google.cloud import storage, videointelligence_v1 as videointelligence
from google.oauth2 import service_account
from fastapi import UploadFile, HTTPException, BackgroundTasks
from utils.sqlite import save_to_sqlite, get_all_labels

def upload_file(bucket_name: str, file: UploadFile, background_tasks: BackgroundTasks, credentials_file: str = './key.json'):
    video_uuid = str(uuid.uuid4())
    original_filename = file.filename
    if '.' in original_filename:
        file_extension = original_filename.rsplit('.', 1)[1].lower()
    else:
        file_extension = 'bin'

    valid_extensions = ['mp4', 'avi', 'mov', 'mkv']
    if file_extension not in valid_extensions:
        raise HTTPException(status_code=400, detail="Unsupported file extension")

    video_name = f"{video_uuid}/video.{file_extension}"
    image_name = f"{video_uuid}/image.jpg"
    labels_name = f"{video_uuid}/labels.json"

    temp_video_path = f"/tmp/{video_uuid}_video.{file_extension}"
    with open(temp_video_path, 'wb') as temp_file:
        temp_file.write(file.file.read())

    credentials = service_account.Credentials.from_service_account_file(credentials_file)
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.get_bucket(bucket_name)

    blob = bucket.blob(video_name)
    blob.chunk_size = 2 * 1024 * 1024
    blob.upload_from_filename(temp_video_path)

    with VideoFileClip(temp_video_path) as video_clip:
        random_time = video_clip.duration * random.random()
        frame = video_clip.get_frame(random_time)
        image = Image.fromarray(frame)

    image_io = io.BytesIO()
    image.save(image_io, format='JPEG')
    image_io.seek(0)

    image_blob = bucket.blob(image_name)
    image_blob.upload_from_file(image_io, content_type='image/jpeg')

    labels_initial = {
        "status": "processing",
        "labels": {}
    }
    labels_initial_json = json.dumps(labels_initial, indent=2)
    labels_io = io.BytesIO(labels_initial_json.encode('utf-8'))
    labels_blob = bucket.blob(labels_name)
    labels_blob.cache_control = 'no-cache'
    labels_blob.upload_from_file(labels_io, content_type='application/json')

    labels_blob.make_public()

    background_tasks.add_task(process_labels, bucket_name, video_name, credentials_file, labels_name, video_uuid)

    blob.make_public()
    image_blob.make_public()

    os.remove(temp_video_path)

    public_video_url = blob.public_url
    public_image_url = image_blob.public_url
    public_labels_url = labels_blob.public_url
    
    return {
        "message": "Video and image uploaded successfully",
        "video_url": public_video_url,
        "image_url": public_image_url,
        "labels_url": public_labels_url
    }


def process_labels(bucket_name: str, video_name: str, credentials_file: str, labels_name: str, video_uuid: str):
    credentials = service_account.Credentials.from_service_account_file(credentials_file)
    video_client = videointelligence.VideoIntelligenceServiceClient(credentials=credentials)
    gcs_uri = f"gs://{bucket_name}/{video_name}"
    features = [videointelligence.Feature.LABEL_DETECTION]

    mode = videointelligence.LabelDetectionMode.SHOT_AND_FRAME_MODE
    config = videointelligence.LabelDetectionConfig(label_detection_mode=mode)
    context = videointelligence.VideoContext(label_detection_config=config)

    try:
        operation = video_client.annotate_video(
            request={
                "features": features,
                "input_uri": gcs_uri,
                "video_context": context
            })
    
        result = operation.result(timeout=600)

        labels_dict = {}

        shot_labels = result.annotation_results[0].shot_label_annotations
        for shot_label in shot_labels:
            label_description = shot_label.entity.description
            if label_description not in labels_dict:
                labels_dict[label_description] = []

            for shot in shot_label.segments:
                start_time = (
                    shot.segment.start_time_offset.seconds
                    + shot.segment.start_time_offset.microseconds / 1e6
                )
                end_time = (
                    shot.segment.end_time_offset.seconds
                    + shot.segment.end_time_offset.microseconds / 1e6
                )

                if end_time - start_time > 0.75:  # Solo considerar segmentos con duración mayor a 0.75s
                    segment_info = {
                        "start_time": start_time,
                        "end_time": end_time,
                    }
                    labels_dict[label_description].append(segment_info)

        labels_dict = {k: v for k, v in labels_dict.items() if v}

        result_dict = {
            "status": "completed",
            "labels": labels_dict,
            "uuid": video_uuid
        }

    except Exception as e:
        print(f"An error occurred: {e}")
        result_dict = {
            "status": "error",
            "labels": {},
            "uuid": None
        }

    finally:
        labels_json = json.dumps(result_dict, indent=4)
        storage_client = storage.Client(credentials=credentials)
        bucket = storage_client.get_bucket(bucket_name)
        labels_io = io.BytesIO(labels_json.encode('utf-8'))
        labels_blob = bucket.blob(labels_name)
        labels_blob.cache_control = 'no-cache' 
        labels_blob.upload_from_file(labels_io, content_type='application/json')
        labels_blob.make_public()

        save_to_sqlite(result_dict)


def list_files(bucket_name: str, credentials_file: str = './key.json'):
    try:
        credentials = service_account.Credentials.from_service_account_file(credentials_file)
        storage_client = storage.Client(credentials=credentials)
        bucket = storage_client.get_bucket(bucket_name)
        blobs = list(bucket.list_blobs())

        blobs.sort(key=lambda blob: blob.updated, reverse=True)

        folder_names = []
        for blob in blobs:
            name = blob.name.split('/')[0]

            if not name in folder_names:
                folder_names.append(name)
   
        return list(folder_names)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving folders from bucket: {e}")
    
def list_json_contents():
    return get_all_labels()