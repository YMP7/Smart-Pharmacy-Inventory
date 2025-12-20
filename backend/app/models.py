from sqlalchemy import Column, Integer, String, Float, Date
from .database import Base

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    medicine = Column(String, index=True)
    batch = Column(String)
    quantity = Column(Integer)
    expiry_date = Column(Date)
    mrp = Column(Float)
    supplier = Column(String)
