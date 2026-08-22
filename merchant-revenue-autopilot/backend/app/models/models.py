from datetime import datetime, date
from typing import Optional
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_order=True, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    stores = relationship("Store", back_populates="merchant", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="merchant", cascade="all, delete-orphan")

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    name = Column(String(100), nullable=False)
    location_type = Column(String(50), nullable=False) # IT_PARK, RESIDENTIAL, COMMERCIAL
    city = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="stores")
    daily_sales = relationship("DailySales", back_populates="store", cascade="all, delete-orphan")
    inventory_snapshots = relationship("InventorySnapshot", back_populates="store", cascade="all, delete-orphan")
    discounts = relationship("Discount", back_populates="store", cascade="all, delete-orphan")
    business_events = relationship("BusinessEvent", back_populates="store", cascade="all, delete-orphan")
    forecasts = relationship("Forecast", back_populates="store", cascade="all, delete-orphan")
    profit_leaks = relationship("ProfitLeak", back_populates="store", cascade="all, delete-orphan")

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    contact_email = Column(String(100), nullable=True)
    lead_time_days = Column(Integer, default=2)
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="supplier")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    unit_cost = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    shelf_life_days = Column(Integer, nullable=False, default=30)
    created_at = Column(DateTime, default=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="products")
    supplier = relationship("Supplier", back_populates="products")
    daily_sales = relationship("DailySales", back_populates="product", cascade="all, delete-orphan")
    inventory_snapshots = relationship("InventorySnapshot", back_populates="product", cascade="all, delete-orphan")
    discounts = relationship("Discount", back_populates="product", cascade="all, delete-orphan")
    forecasts = relationship("Forecast", back_populates="product", cascade="all, delete-orphan")
    profit_leaks = relationship("ProfitLeak", back_populates="product", cascade="all, delete-orphan")

class DailySales(Base):
    __tablename__ = "daily_sales"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    quantity_sold = Column(Integer, nullable=False, default=0)
    selling_price = Column(Float, nullable=False)
    unit_cost = Column(Float, nullable=False)
    discount = Column(Float, nullable=False, default=0.0)
    revenue = Column(Float, nullable=False, default=0.0)
    gross_profit = Column(Float, nullable=False, default=0.0)

    store = relationship("Store", back_populates="daily_sales")
    product = relationship("Product", back_populates="daily_sales")

class InventorySnapshot(Base):
    __tablename__ = "inventory_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    opening_inventory = Column(Integer, nullable=False, default=0)
    received_quantity = Column(Integer, nullable=False, default=0)
    closing_inventory = Column(Integer, nullable=False, default=0)
    stockout_flag = Column(Boolean, nullable=False, default=False)

    store = relationship("Store", back_populates="inventory_snapshots")
    product = relationship("Product", back_populates="inventory_snapshots")

class Discount(Base):
    __tablename__ = "discounts"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    discount_percent = Column(Float, nullable=False)
    reason = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)

    store = relationship("Store", back_populates="discounts")
    product = relationship("Product", back_populates="discounts")

class BusinessEvent(Base):
    __tablename__ = "business_events"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)
    date = Column(Date, nullable=False, index=True)
    event_type = Column(String(50), nullable=False) # holiday, festival, office_closed, rain, heatwave, weekend
    severity = Column(Integer, default=1)
    description = Column(String(200), nullable=True)

    store = relationship("Store", back_populates="business_events")

class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    forecast_date = Column(Date, nullable=False, index=True)
    expected_demand = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=False)
    upper_bound = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    explanation = Column(Text, nullable=True)
    is_stockout_adjusted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    store = relationship("Store", back_populates="forecasts")
    product = relationship("Product", back_populates="forecasts")

class ProfitLeak(Base):
    __tablename__ = "profit_leaks"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    category = Column(String(50), nullable=False) # STOCKOUT, OVERSTOCK, EXPIRY, DISCOUNT_INEFFICIENCY, SUPPLIER_COST, DEMAND_MISMATCH
    estimated_impact = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    evidence = Column(JSON, nullable=True)
    explanation = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    store = relationship("Store", back_populates="profit_leaks")
    product = relationship("Product", back_populates="profit_leaks")

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    simulation_type = Column(String(50), nullable=False) # ORDER, DISCOUNT
    parameters = Column(JSON, nullable=False)
    expected_sales = Column(Float, nullable=False)
    expected_revenue = Column(Float, nullable=False)
    expected_gross_profit = Column(Float, nullable=False)
    stockout_probability = Column(Float, nullable=False)
    leftover_inventory = Column(Float, nullable=False)
    expiry_risk = Column(Float, nullable=False)
    cash_locked = Column(Float, nullable=False)
    expected_waste = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AgentAction(Base):
    __tablename__ = "agent_actions"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    action_type = Column(String(50), nullable=False)
    recommendation = Column(Text, nullable=False)
    agent_reasoning = Column(Text, nullable=False)
    tool_calls = Column(JSON, nullable=True)
    evidence = Column(JSON, nullable=True)
    expected_outcome = Column(JSON, nullable=True)
    confidence = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False, default="LOW") # LOW, MEDIUM, HIGH
    status = Column(String(20), nullable=False, default="PENDING") # PENDING, APPROVED, REJECTED, EXECUTED, FAILED
    created_at = Column(DateTime, default=datetime.utcnow)

    approval = relationship("ActionApproval", back_populates="action", uselist=False)
    outcome = relationship("ActionOutcome", back_populates="action", uselist=False)

class ActionApproval(Base):
    __tablename__ = "action_approvals"

    id = Column(Integer, primary_key=True, index=True)
    action_id = Column(Integer, ForeignKey("agent_actions.id"), nullable=False, unique=True)
    approved = Column(Boolean, nullable=False)
    merchant_notes = Column(Text, nullable=True)
    approved_at = Column(DateTime, default=datetime.utcnow)

    action = relationship("AgentAction", back_populates="approval")

class ActionOutcome(Base):
    __tablename__ = "action_outcomes"

    id = Column(Integer, primary_key=True, index=True)
    action_id = Column(Integer, ForeignKey("agent_actions.id"), nullable=False, unique=True)
    actual_impact = Column(Float, nullable=False)
    predicted_impact = Column(Float, nullable=False)
    variance = Column(Float, nullable=False)
    details = Column(JSON, nullable=True)
    evaluated_at = Column(DateTime, default=datetime.utcnow)

    action = relationship("AgentAction", back_populates="outcome")

class FailureEvent(Base):
    __tablename__ = "failure_events"

    id = Column(Integer, primary_key=True, index=True)
    failure_type = Column(String(50), nullable=False) # FORECAST_ERROR, API_TIMEOUT, INVALID_TOOL_CALL, MISSING_DATA, UNEXPECTED_SPIKE, RAZORPAY_API_FAILURE, WEBHOOK_FAILURE
    predicted_value = Column(Float, nullable=True)
    actual_value = Column(Float, nullable=True)
    error_percentage = Column(Float, nullable=True)
    possible_cause = Column(Text, nullable=False)
    recovery_action = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
