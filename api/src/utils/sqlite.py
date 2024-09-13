from http.client import HTTPException
import sqlite3


def save_to_sqlite(data):
    conn = sqlite3.connect('./labels_data.db')
    cursor = conn.cursor()

    try:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS labels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_uuid TEXT,
                label TEXT,
                start_time REAL,
                end_time REAL
            )
        ''')

        # Insertar los datos en la tabla
        video_uuid = data.get('uuid')
        for label, segments in data.get('labels', {}).items():
            for segment in segments:
                cursor.execute('''
                    INSERT INTO labels (video_uuid, label, start_time, end_time)
                    VALUES (?, ?, ?, ?)
                ''', (
                    video_uuid,
                    label,
                    segment['start_time'],
                    segment['end_time']
                ))

        conn.commit()
    
    except Exception as e:
        print(f"An error occurred while saving to SQLite: {e}")
    
    finally:
        conn.close()

import sqlite3
from fastapi import HTTPException

def get_all_labels(db_path: str = './labels_data.db'):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='labels'")
        table_exists = cursor.fetchone() is not None

        if not table_exists:
            return []

        cursor.execute('SELECT * FROM labels')
        rows = cursor.fetchall()

        data = []
        for row in rows:
            data.append({
                'id': row[0],
                'video_uuid': row[1],
                'label': row[2],
                'start_time': row[3],
                'end_time': row[4]
            })

        return data

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving data from SQLite: {e}")

    finally:
        conn.close()
