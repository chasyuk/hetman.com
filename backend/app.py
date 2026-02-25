import math
from fastapi import FastAPI
from pydantic import BaseModel
from geopy.distance import geodesic


app = FastAPI()


class ShotRequest(BaseModel):
    cannon_lat: float
    cannon_lng: float
    target_lat: float
    target_lng: float
    velocity: float
    max_range: float


def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate azimuth (bearing) between two geographic points."""
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    diff_lon = lon2 - lon1
    x = math.sin(diff_lon) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - (
        math.sin(lat1) * math.cos(lat2) * math.cos(diff_lon)
    )
    initial_bearing = math.atan2(x, y)
    return (math.degrees(initial_bearing) + 360) % 360


@app.route("/")
def index():
    return {"message": "Fire Control API"}


@app.post("/calculate_shot")
def calculate_shot(data: ShotRequest):
    cannon_coords = (data.cannon_lat, data.cannon_lng)
    target_coords = (data.target_lat, data.target_lng)

    # 1. Distance
    distance_meters = geodesic(cannon_coords, target_coords).meters

    # Check if target is within range
    if distance_meters > data.max_range:
        return {
            "status": "error",
            "message": (
                f"Ціль за межами досяжності! "
                f"Максимальна дальність: {data.max_range} м. "
                f"Відстань до цілі: {round(distance_meters)} м."
            ),
        }

    # 2. Azimuth
    azimuth = calculate_bearing(
        cannon_coords[0], cannon_coords[1],
        target_coords[0], target_coords[1],
    )

    # 3. Elevation angle
    g = 9.81
    val = (distance_meters * g) / (data.velocity ** 2)

    if val > 1:
        return {
            "status": "error",
            "message": "Фізично неможливо докинути снаряд з такою швидкістю на таку відстань.",
        }

    elevation_angle = math.degrees(math.asin(val) / 2)

    return {
        "status": "success",
        "distance": round(distance_meters, 2),
        "azimuth": round(azimuth, 2),
        "elevation": round(elevation_angle, 2),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
