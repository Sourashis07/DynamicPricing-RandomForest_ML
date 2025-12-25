from fastapi import FastAPI
import joblib
import os
from pydantic import BaseModel
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import random

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://*.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Load model once at startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
model = joblib.load(MODEL_PATH)

class FlightInput(BaseModel):
    airline: str
    route: str
    departure_time: str
    arrival_time: str
    class_: str
    days_left: int
    duration: float
    stops: int
    seats_left: int
    demand_index: float

class SearchInput(BaseModel):
    source: str
    destination: str
    flight_class: str 

def demand_pressure_adjustment(demand_index: float) -> float:
    if demand_index >= 1.4:
        return 1.25   # extreme surge
    elif demand_index >= 1.2:
        return 1.15   # high demand
    elif demand_index >= 1.0:
        return 1.05   # moderate demand
    else:
        return 1.00   # normal / low demand

def days_to_departure(date_str: str) -> int:
    travel_date = datetime.strptime(date_str, "%Y-%m-%d")
    today = datetime.today()
    return max((travel_date - today).days, 1)

def time_bucket_from_hour(hour: int) -> str:
    if hour < 6:
        return "Early_Morning"
    elif hour < 12:
        return "Morning"
    elif hour < 18:
        return "Afternoon"
    else:
        return "Evening"


def seat_pressure_adjustment(seats_left: int) -> float:
    if seats_left <= 10:
        return 1.20
    elif seats_left <= 20:
        return 1.10
    elif seats_left <= 50:
        return 1.05
    else:
        return 1.00


BASE_FARE_TABLE = {
    ("Delhi_Mumbai", "Economy"): 5000,
    ("Delhi_Mumbai", "Business"): 12000,
    ("Mumbai_Bangalore", "Economy"): 4500,
    ("Mumbai_Bangalore", "Business"): 11000,
    ("Delhi_Bangalore", "Economy"): 6000,
    ("Delhi_Bangalore", "Business"): 14000
}


@app.get("/")
def root():
    return {"status": "backend working, model loaded"}

@app.post("/search")
def search_flights(query: SearchInput):
    route = f"{query.source}_{query.destination}"
    
    flight_templates = [
        {"airline": "IndiGo", "dep": 6,  "arr": 8},
        {"airline": "Vistara", "dep": 9, "arr": 11},
        {"airline": "Air India", "dep": 13, "arr": 15},
        {"airline": "IndiGo", "dep": 18, "arr": 20},
        {"airline": "Akasa", "dep": 22, "arr": 0},
    ]

    results = []

    for f in flight_templates:
        seats_left = random.randint(3, 60)
        demand_index = random.uniform(0.9, 1.4)

        input_dict = {
            "airline": f["airline"],
            "route": route,
            "departure_time": time_bucket_from_hour(f["dep"]),
            "arrival_time": time_bucket_from_hour(f["arr"]),
            "class": query.flight_class,
            "days_left": 10,  # Default days
            "duration": 2.1,
            "stops": 0,
            "seats_left": seats_left,
            "demand_index": demand_index
        }

        X = pd.DataFrame([input_dict])
        ml_multiplier = model.predict(X)[0]
        seat_factor = seat_pressure_adjustment(seats_left)
        demand_factor = demand_pressure_adjustment(demand_index)
        base_fare = BASE_FARE_TABLE.get((route, query.flight_class), 5000)
        final_price = base_fare * ml_multiplier * seat_factor * demand_factor

        results.append({
            "airline": f["airline"],
            "departure_time": f"{f['dep']:02d}:00",
            "arrival_time": f"{f['arr']:02d}:00",
            "duration": "2h 10m",
            "stops": "Non-stop",
            "seats_left": seats_left,
            "price": round(final_price, 2)
        })

    results.sort(key=lambda x: x["price"])

    return {
        "route": route,
        "class": query.flight_class,
        "flights": results
    }



@app.post("/predict")
def predict_price(data: FlightInput):
    input_dict = {
        "airline": data.airline,
        "route": data.route,
        "departure_time": data.departure_time,
        "arrival_time": data.arrival_time,
        "class": data.class_,
        "days_left": data.days_left,
        "duration": data.duration,
        "stops": data.stops,
        "seats_left": data.seats_left,
        "demand_index": data.demand_index
    }

    X = pd.DataFrame([input_dict])
    multiplier = model.predict(X)[0]

    # Get base fare
    base_fare = BASE_FARE_TABLE.get(
        (data.route, data.class_),
        5000  # fallback default
    )

    final_price = base_fare * multiplier

    return {
        "route": data.route,
        "class": data.class_,
        "base_fare": base_fare,
        "price_multiplier": round(float(multiplier), 3),
        "final_price": round(final_price, 2)
    }

@app.post("/simulate")
def simulate_pricing(data: FlightInput):
    results = []

    # Simulate price change as days_left decreases
    for d in [30, 14, 7, 3, 1]:
        input_dict = {
            "airline": data.airline,
            "route": data.route,
            "departure_time": data.departure_time,
            "arrival_time": data.arrival_time,
            "class": data.class_,
            "days_left": d,
            "duration": data.duration,
            "stops": data.stops,
            "seats_left": data.seats_left,
            "demand_index": data.demand_index
        }

        X = pd.DataFrame([input_dict])
        multiplier = model.predict(X)[0]

        base_fare = BASE_FARE_TABLE.get(
            (data.route, data.class_),
            5000
        )

        results.append({
            "days_left": d,
            "price": round(base_fare * multiplier, 2)
        })

    return {
        "route": data.route,
        "class": data.class_,
        "simulation": results
    }

@app.post("/simulate/seats")
def simulate_seat_pressure(data: FlightInput):
    results = []

    seat_levels = [150, 100, 50, 20, 5]

    for seats in seat_levels:
        input_dict = {
            "airline": data.airline,
            "route": data.route,
            "departure_time": data.departure_time,
            "arrival_time": data.arrival_time,
            "class": data.class_,
            "days_left": data.days_left,
            "duration": data.duration,
            "stops": data.stops,
            "seats_left": seats,
            "demand_index": data.demand_index
        }

        X = pd.DataFrame([input_dict])

        # ML prediction
        ml_multiplier = model.predict(X)[0]

        # Business rule adjustment
        seat_factor = seat_pressure_adjustment(seats)

        # Base fare lookup
        base_fare = BASE_FARE_TABLE.get(
            (data.route, data.class_),
            5000
        )

        final_price = base_fare * ml_multiplier * seat_factor

        results.append({
            "seats_left": seats,
            "ml_multiplier": round(float(ml_multiplier), 3),
            "seat_factor": seat_factor,
            "final_price": round(final_price, 2)
        })

    return {
        "route": data.route,
        "class": data.class_,
        "seat_pressure_simulation": results
    }

@app.post("/simulate/demand")
def simulate_demand_shock(data: FlightInput):
    results = []

    demand_levels = [0.7, 0.9, 1.0, 1.2, 1.4]

    for demand in demand_levels:
        input_dict = {
            "airline": data.airline,
            "route": data.route,
            "departure_time": data.departure_time,
            "arrival_time": data.arrival_time,
            "class": data.class_,
            "days_left": data.days_left,
            "duration": data.duration,
            "stops": data.stops,
            "seats_left": data.seats_left,
            "demand_index": demand
        }

        X = pd.DataFrame([input_dict])

        # ML prediction
        ml_multiplier = model.predict(X)[0]

        # Business rule adjustment
        demand_factor = demand_pressure_adjustment(demand)

        # Base fare lookup
        base_fare = BASE_FARE_TABLE.get(
            (data.route, data.class_),
            5000
        )

        final_price = base_fare * ml_multiplier * demand_factor

        results.append({
            "demand_index": demand,
            "ml_multiplier": round(float(ml_multiplier), 3),
            "demand_factor": demand_factor,
            "final_price": round(final_price, 2)
        })

    return {
        "route": data.route,
        "class": data.class_,
        "demand_simulation": results
    }

@app.post("/explain")
def explain_price(data: FlightInput):
    try:
        input_dict = {
        "airline": data.airline,
        "route": data.route,
        "departure_time": data.departure_time,
        "arrival_time": data.arrival_time,
        "class": data.class_,
        "days_left": data.days_left,
        "duration": data.duration,
        "stops": data.stops,
        "seats_left": data.seats_left,
        "demand_index": data.demand_index
        }

        X = pd.DataFrame([input_dict])

        ml_multiplier = model.predict(X)[0]
        seat_factor = seat_pressure_adjustment(data.seats_left)
        demand_factor = demand_pressure_adjustment(data.demand_index)

        base_fare = BASE_FARE_TABLE.get(
            (data.route, data.class_),
            5000
        )

        final_price = base_fare * ml_multiplier * seat_factor * demand_factor

        return {
        "base_fare": base_fare,
        "ml_multiplier": round(float(ml_multiplier), 3),
        "seat_factor": seat_factor,
        "demand_factor": demand_factor,
        "final_price": round(final_price, 2),
        "explanation": [
            "Base fare determined by route and class",
            "ML model estimates demand pressure",
            "Seat scarcity rule increases price as seats reduce",
            "Demand surge rule amplifies high demand situations"
        ]
        }
    except Exception as e:
        return {"error": str(e)}

