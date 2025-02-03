from fastapi import FastAPI, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os 
import cv2
from fastapi.responses import StreamingResponse
import numpy as np
import io 
from ultralytics import YOLO
from typing_extensions import Annotated, Optional
from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException, Query, UploadFile
from database import create_db_and_table, get_db, Detector
from sqlalchemy.orm import Session
from datetime import datetime, time
from pydantic import BaseModel, Field
from sqlalchemy import and_

@asynccontextmanager
async def lifespan(app: FastAPI):  
  global model
  model = YOLO('yolov8n_fp16.engine', task='detect')
  model.predict('init.png',  device=0, imgsz=640, classes=[0], data='coco128.yaml')[0]
  create_db_and_table()
  yield 
  model = None

app = FastAPI(lifespan=lifespan)


origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/image")
async def image_predict(file: Annotated[bytes, File()], time: Annotated[str, Form()],  session: Session =  Depends(get_db)):
  try:
    np_array = np.frombuffer(file, np.uint8)
    img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    height, width = img.shape[:2]
    sanitized_time = time.replace("/", "-").replace(":", "-").replace(" ", "_")

    results = model.predict(img,  device=0, imgsz=640, classes=[0], data='coco128.yaml')[0]
    if not os.path.exists("result"):
      os.makedirs("result")  # Creates all intermediate directories if needed
    results.save(f"/result/{sanitized_time}_detect.png")
    
    datetime_obj = datetime.strptime(sanitized_time, "%d-%m-%Y-%H-%M-%S")
    date_part = datetime_obj.date()  # Extracts the date (YYYY-MM-DD)
    time_part = datetime_obj.time()  # Extracts the time (HH:MM:SS)
    
    if (results.boxes.shape[0] > 0):
    
      new_predict = Detector(date=date_part, time=time_part, number_of_detected_box=results.boxes.shape[0],path = f"D://test_fastAPI_nextjs/result/{sanitized_time}_detect.png")
      session.add(new_predict)
      session.commit()
      session.refresh(new_predict)
      
      results_img = cv2.imread(f"/result/{sanitized_time}_detect.png", cv2.IMREAD_COLOR)
      processed_img = cv2.resize(results_img, (width, height))
      _, processed_img_bytes = cv2.imencode('.png', processed_img)
      img_byte_arr = io.BytesIO(processed_img_bytes)
      return StreamingResponse(img_byte_arr, media_type="image/png")
    else:  
      return {"message": "No objects detected"}
  except Exception as e:
    raise HTTPException(status_code=400, detail=f"Error processing request: {str(e)}")
  
@app.get('/api/db_all')  
async def fetch_db(session: Session = Depends(get_db)):
  try: 
    data = session.query(Detector)
    return data.all()
  except Exception as e:
    raise HTTPException(status_code=400, detail=f"Error processing request: {str(e)}")

class QueryParam(BaseModel):
  model_config = {"extra": "forbid"}
  
  typeQuery: str
  query: str
  
@app.get('/api/db_query')
async def fetch_db_query(session: Session = Depends(get_db), filter_query : QueryParam = Depends()):
  try:
    if not filter_query.query or filter_query.query.strip() == "":
      return session.query(Detector).all()
    if filter_query.typeQuery == 'date':
      query_date = datetime.strptime(filter_query.query, "%Y-%m-%d").date()
      return session.query(Detector).filter(Detector.date==query_date).all()
    if filter_query.typeQuery == 'quantity':
      return session.query(Detector).filter(Detector.number_of_detected_box==filter_query.query).all()
    if filter_query.typeQuery == 'time':
      parts = filter_query.query.split(":")
      if len(parts) == 1:
          # Hour only (19 → 19:00:00 to 19:59:59)
          hour = int(parts[0])
          start_time = time(hour, 0, 0)
          end_time = time(hour, 59, 59)

      elif len(parts) == 2:
          # Hour & Minute (19:22 → 19:22:00 to 19:22:59)
          hour, minute = map(int, parts)
          start_time = time(hour, minute, 0)
          end_time = time(hour, minute, 59)

      elif len(parts) == 3:
          # Full time (19:22:23 → exact match)
          hour, minute, second = map(int, parts)
          start_time = time(hour, minute, second)
          end_time = start_time  # Exact match
      else:
          HTTPException(status_code=400, detail="Error processing request: Invalid time format. Use HH, HH:MM, or HH:MM:SS")
      # Query with time range filter
      results = session.query(Detector).filter(
          and_(Detector.time >= start_time, Detector.time <= end_time)
      ).all()

      return results

  except Exception as e:
    raise HTTPException(status_code=400, detail=f"Error processing request: {str(e)}")
  
  


  
