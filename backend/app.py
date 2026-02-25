from flask import Flask, render_template, request, jsonify
from geopy.distance import geodesic
import math

app = Flask(__name__)

# Функція для розрахунку азимута (напрямку)
def calculate_bearing(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    diff_lon = lon2 - lon1
    x = math.sin(diff_lon) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - (math.sin(lat1) * math.cos(lat2) * math.cos(diff_lon))
    initial_bearing = math.atan2(x, y)
    return (math.degrees(initial_bearing) + 360) % 360

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate_shot', methods=['POST'])
def calculate_shot():
    data = request.json
    
    cannon_coords = (data['cannon_lat'], data['cannon_lng'])
    target_coords = (data['target_lat'], data['target_lng'])
    velocity = data['velocity']
    max_range = data['max_range']

    # 1. Відстань
    distance_meters = geodesic(cannon_coords, target_coords).meters
    
    # Перевірка, чи взагалі дострілює
    if distance_meters > max_range:
        return jsonify({"status": "error", "message": f"Ціль за межами досяжності! Максимальна дальність: {max_range} м. Відстань до цілі: {round(distance_meters)} м."})

    # 2. Азимут
    azimuth = calculate_bearing(cannon_coords[0], cannon_coords[1], target_coords[0], target_coords[1])
    
    # 3. Кут підйому гармати
    g = 9.81
    val = (distance_meters * g) / (velocity ** 2)
    
    if val > 1:
        return jsonify({"status": "error", "message": "Фізично неможливо докинути снаряд з такою швидкістю на таку відстань."})
        
    elevation_angle = math.degrees(math.asin(val) / 2)

    return jsonify({
        "status": "success",
        "distance": round(distance_meters, 2),
        "azimuth": round(azimuth, 2),
        "elevation": round(elevation_angle, 2)
    })

if __name__ == '__main__':
    app.run(debug=True)