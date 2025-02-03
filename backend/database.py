from sqlalchemy import create_engine, Column, Integer, String, Date, Time, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

postgres_url = "postgresql://example_user:example_password@db:5432/example_db"

# Create the database engine
engine = create_engine(postgres_url)

# Define the Base class for ORM models
Base = declarative_base()

# Define the table model
class Detector(Base):
    __tablename__ = 'detect_table'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False, server_default=func.current_date())  # Stores only the date
    time = Column(Time, nullable=False, server_default=func.current_time())  # Stores only the time
    number_of_detected_box = Column(Integer, index=True, nullable=False, default=0)
    path = Column(String, nullable=False)
    
def create_db_and_table():
    # Create the table if it does not exist
    Base.metadata.create_all(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
def get_db():
    db = SessionLocal()  # Create a new session
    try:
        yield db  # Provide session to the request
    finally:
        db.close()  # Close session after request

