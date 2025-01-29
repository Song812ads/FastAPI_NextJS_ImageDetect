from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
import os 
import cv2
from fastapi.responses import StreamingResponse
import numpy as np
import torch
import io 
from ultralytics import YOLO
from typing_extensions import Annotated, Optional
from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select

postgres_url = "postgresql://example_user:example_password@postgres_container:5432/example_db"

# Create the engine for PostgreSQL
engine = create_engine(postgres_url)

def create_db_and_tables():
  SQLModel.metadata.create_all(engine)


def get_session():
  with Session(engine) as session:
    yield session

SessionDep = Annotated[Session, Depends(get_session)]


class Detector(SQLModel, table=True):
  __tablename__ = "detect_table" 
  id:int = Field(primary_key=True)
  time:str
  number_of_detected_box:int = Field(default=0, index=True)
  path:str
    

@asynccontextmanager
async def lifespan(app: FastAPI):  
  create_db_and_tables()
  global model 
  model = YOLO('yolov8n_fp16.engine', task='detect')
  model.predict('init.png',  device=0, imgsz=640, classes=[0], data='coco128.yaml')[0]
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
async def image_predict(file: Annotated[bytes, File()], time: Annotated[str, Form()], session: SessionDep):
  try:
    np_array = np.frombuffer(file, np.uint8)
    img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    height, width = img.shape[:2]
    sanitized_time = time.replace("/", "-").replace(":", "-").replace(" ", "_")
    
    results = model.predict(img,  device=0, imgsz=640, classes=[0], data='coco128.yaml')[0]
    if not os.path.exists("result"):
      os.makedirs("result")  # Creates all intermediate directories if needed
    results.save(f"/result/{sanitized_time}_detect.png")
    
    new_predict = Detector(time=time, number_of_detected_box=results.boxes.shape[0],path = f"D://test_fastAPI_nextjs/result/{sanitized_time}_detect.png")
    session.add(new_predict)
    session.commit()
    session.refresh(new_predict)
    
    results_img = cv2.imread(f"/result/{sanitized_time}_detect.png", cv2.IMREAD_COLOR)
    processed_img = cv2.resize(results_img, (width, height))
    _, processed_img_bytes = cv2.imencode('.png', processed_img)
    img_byte_arr = io.BytesIO(processed_img_bytes)
    return StreamingResponse(img_byte_arr, media_type="image/png")
  
  except Exception as e:
    raise HTTPException(status_code=400, detail=f"Error processing request: {str(e)}")


  
