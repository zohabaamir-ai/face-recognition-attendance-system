from app.db.database import engine
from app.db.db_models import Base

Base.metadata.create_all(bind=engine)
print("Tables created successfully.")