from flask import Flask, request, jsonify
import config
import mysql.connector as connector
from werkzeug.utils import secure_filename
import os
import uuid
from ultralytics import YOLO
import bcrypt
from collections import Counter
from dotenv import load_dotenv
from flask_cors import CORS
from itsdangerous import URLSafeTimedSerializer
from functools import wraps

load_dotenv()

app = Flask(__name__)
app.secret_key = "vehicle_damage_detection_secret"

# Enable CORS for React frontend running on port 5173 and optional FRONTEND_URL environment variable
frontend_url = os.environ.get('FRONTEND_URL')
cors_origins = ["http://localhost:5173"]
if frontend_url:
    cors_origins.append(frontend_url.rstrip('/'))
CORS(app, supports_credentials=True, origins=cors_origins)

serializer = URLSafeTimedSerializer(app.secret_key)

def connect_to_db():
    try:
        print("CONFIG =", config.mysql_credentials)
        connection = connector.connect(**config.mysql_credentials)
        print("Database connected successfully")
        return connection
    except connector.Error as e:
        print(f"Error connecting to database: {e}")
        return None

def init_db():
    import json
    connection = connect_to_db()
    if not connection:
        print("Database not reachable. Auto-initialization skipped.")
        return
    try:
        cursor = connection.cursor()
        
        # Create user_info table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_info (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                password VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                vehicle_id VARCHAR(50) NOT NULL UNIQUE,
                contact_number VARCHAR(10) NOT NULL,
                address VARCHAR(100) NOT NULL,
                car_brand VARCHAR(100) NOT NULL,
                model VARCHAR(100) NOT NULL,
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create car_models table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS car_models (
                brand VARCHAR(50) NOT NULL,
                model VARCHAR(50) NOT NULL,
                part VARCHAR(50) NOT NULL,
                price INT NOT NULL
            )
        """)
        
        # Create detections table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS detections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL,
                uploaded_image VARCHAR(255) NOT NULL,
                detected_image VARCHAR(255) NOT NULL,
                parts_summary TEXT NOT NULL,
                total_cost INT NOT NULL DEFAULT 0,
                detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email)
            )
        """)
        
        connection.commit()
        
        # Seed database if car_models is empty
        cursor.execute("SELECT COUNT(*) FROM car_models")
        count = cursor.fetchone()[0]
        if count == 0:
            print("Table 'car_models' is empty. Seeding car parts pricing data...")
            prices_path = os.path.join(os.path.dirname(__file__), 'car_parts_prices.json')
            if os.path.exists(prices_path):
                with open(prices_path, 'r') as f:
                    car_parts = json.load(f)
                    
                for brand, models in car_parts.items():
                    for model, parts in models.items():
                        for part, price in parts.items():
                            cursor.execute(
                                "INSERT INTO car_models (brand, model, part, price) VALUES (%s, %s, %s, %s)",
                                (brand, model, part, price)
                            )
                connection.commit()
                print("Database seeding completed successfully.")
            else:
                print(f"Warning: Seed file not found at {prices_path}")
        else:
            print(f"Table 'car_models' already has {count} records. Skipping seeding.")
            
        cursor.close()
    except Exception as e:
        print(f"Database initialization failed: {e}")
    finally:
        connection.close()

# Auto-initialize database on application startup
init_db()

# Token validation decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'error': 'Authentication token is missing!'}), 401
            
        try:
            email = serializer.loads(token, max_age=86400) # Valid for 1 day
        except Exception:
            return jsonify({'error': 'Token is invalid or has expired!'}), 401
            
        return f(email, *args, **kwargs)
    return decorated

@app.route('/')
def home():
    return jsonify({'status': 'Accident Damage Detection API is running'}), 200

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    name = data.get('name')
    password = data.get('password')
    email = data.get('email')
    vehicle_id = data.get('vehicleId')
    contact_number = data.get('phoneNumber')
    address = data.get('address')
    car_brand = data.get('carBrand')
    model = data.get('carModel')

    if not all([name, password, email, vehicle_id, contact_number, address, car_brand, model]):
        return jsonify({'error': 'All fields are required!'}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    connection = connect_to_db()
    if connection:
        try:
            with connection.cursor() as cursor:
                query = '''
                INSERT INTO user_info (name, password, email, vehicle_id, contact_number, address, car_brand, model)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                '''
                cursor.execute(query, (name, hashed_password, email, vehicle_id, contact_number, address, car_brand, model))
                connection.commit()
            
            token = serializer.dumps(email)
            return jsonify({
                'message': 'Signup successful!',
                'token': token,
                'user': {
                    'name': name,
                    'email': email,
                    'carBrand': car_brand,
                    'carModel': model
                }
            }), 201
        except connector.IntegrityError as e:
            if 'Duplicate entry' in str(e):
                return jsonify({'error': 'Email or Vehicle ID already exists!'}), 409
            else:
                return jsonify({'error': 'An error occurred during signup. Please try again.'}), 500
        except connector.Error as e:
            print(f"Error executing query: {e}")
            return jsonify({'error': 'Database error. Please try again.'}), 500
        finally:
            connection.close()
    else:
        return jsonify({'error': 'Database connection failed.'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required!'}), 400

    connection = connect_to_db()
    if connection:
        try:
            with connection.cursor(dictionary=True) as cursor:
                query = "SELECT password, name, car_brand, model FROM user_info WHERE email = %s"
                cursor.execute(query, (email,))
                result = cursor.fetchone()
                if result and bcrypt.checkpw(password.encode('utf-8'), result['password'].encode('utf-8')):
                    token = serializer.dumps(email)
                    return jsonify({
                        'message': 'Login successful!',
                        'token': token,
                        'user': {
                            'name': result['name'],
                            'email': email,
                            'carBrand': result['car_brand'],
                            'carModel': result['model']
                        }
                    }), 200
                else:
                    return jsonify({'error': 'Invalid email or password.'}), 401
        except connector.Error as e:
            print(f"Error executing query: {e}")
            return jsonify({'error': 'An error occurred during login.'}), 500
        finally:
            connection.close()
    else:
        return jsonify({'error': 'Database connection failed.'}), 500

# Load YOLO model
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "models", "model weights", "best.pt")
model = YOLO(model_path)

@app.route('/api/detect', methods=['POST'])
@token_required
def detect(email):
    file = request.files.get('image')
    if not file:
        return jsonify({'error': 'Please upload an image.'}), 400

    filename = secure_filename(file.filename)
    if not filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        return jsonify({'error': 'Invalid file type. Please upload a PNG, JPG, or JPEG image.'}), 400
    
    # Create static/uploads directory if it doesn't exist
    uploads_dir = os.path.join('static', 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    
    # Generate unique filenames using uuid
    unique_id = str(uuid.uuid4())
    ext = os.path.splitext(filename)[1] or '.jpg'
    uploaded_filename = f"{unique_id}_uploaded{ext}"
    detected_filename = f"{unique_id}_detected{ext}"
    
    uploaded_path = os.path.join(uploads_dir, uploaded_filename)
    detected_path = os.path.join(uploads_dir, detected_filename)
    
    file.save(uploaded_path)
    
    # Make predictions using YOLO (conf=0.20 to capture detections just below the default 0.25 threshold)
    result = model(uploaded_path, conf=0.20)
    detected_objects = result[0].boxes
    class_ids = [box.cls.item() for box in detected_objects]
    class_counts = Counter(class_ids)
    
    # Save the image with detections
    result[0].save(detected_path)
    
    # Fetch part prices from the database
    part_prices = get_part_prices(email, class_counts)
    
    total_cost = sum(v['total'] for v in part_prices.values())
    
    # Persist detection record for history
    save_detection(email, f'/static/uploads/{uploaded_filename}', f'/static/uploads/{detected_filename}', part_prices, total_cost)
    
    return jsonify({
        'originalImage': f'/static/uploads/{uploaded_filename}',
        'detectedImage': f'/static/uploads/{detected_filename}',
        'partPrices': part_prices
    }), 200

def get_part_prices(email, class_counts):
    connection = connect_to_db()
    if connection:
        try:
            with connection.cursor(dictionary=True) as cursor:
                # Get user's car brand and model
                cursor.execute("SELECT car_brand, model FROM user_info WHERE email = %s", (email,))
                user_data = cursor.fetchone()
                if not user_data:
                    print("User not found")
                    return {}

                car_brand = user_data['car_brand']
                car_model = user_data['model']

                # Fetch part prices – use UPPER() on both sides for case-insensitive match
                prices = {}
                for class_id, count in class_counts.items():
                    part_name = get_part_name_from_id(class_id)
                    if part_name:
                        cursor.execute(
                            """SELECT price FROM car_models
                               WHERE UPPER(brand) = UPPER(%s)
                                 AND UPPER(model) = UPPER(%s)
                                 AND UPPER(part)  = UPPER(%s)""",
                            (car_brand, car_model, part_name)
                        )
                        price_data = cursor.fetchone()
                        if price_data:
                            price_per_part = price_data['price']
                            total_price = price_per_part * count
                            prices[part_name] = {'count': count, 'price': price_per_part, 'total': total_price}
                        else:
                            # Still record the part even if no price found
                            prices[part_name] = {'count': count, 'price': 0, 'total': 0}
                return prices
        except connector.Error as e:
            print(f"Error executing query: {e}")
            return {}
        finally:
            connection.close()
    print("Connection failed")
    return {}

def get_part_name_from_id(class_id):
    class_names = ['Bonnet', 'Bumper', 'Dickey', 'Door', 'Fender', 'Light', 'Windshield']
    if 0 <= class_id < len(class_names):
        return class_names[int(class_id)]
    return None

def save_detection(email, uploaded_image, detected_image, part_prices, total_cost):
    """Persist a detection result to the detections table."""
    import json
    connection = connect_to_db()
    if not connection:
        return
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """INSERT INTO detections (email, uploaded_image, detected_image, parts_summary, total_cost)
                   VALUES (%s, %s, %s, %s, %s)""",
                (email, uploaded_image, detected_image, json.dumps(part_prices), int(total_cost))
            )
            connection.commit()
    except connector.Error as e:
        print(f"Error saving detection: {e}")
    finally:
        connection.close()

@app.route('/api/uploads', methods=['GET'])
@token_required
def get_uploads(email):
    """Return the 10 most recent detection records for the authenticated user."""
    import json
    connection = connect_to_db()
    if not connection:
        return jsonify({'error': 'Database connection failed.'}), 500
    try:
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute(
                """SELECT id, uploaded_image, detected_image, parts_summary, total_cost, detected_at
                   FROM detections WHERE email = %s ORDER BY detected_at DESC LIMIT 5""",
                (email,)
            )
            rows = cursor.fetchall()
            results = []
            for row in rows:
                results.append({
                    'id': row['id'],
                    'uploadedImage': row['uploaded_image'],
                    'detectedImage': row['detected_image'],
                    'partPrices': json.loads(row['parts_summary']),
                    'totalCost': row['total_cost'],
                    'detectedAt': row['detected_at'].isoformat() if row['detected_at'] else None
                })
            return jsonify({'uploads': results}), 200
    except connector.Error as e:
        print(f"Error fetching uploads: {e}")
        return jsonify({'error': 'Database error.'}), 500
    finally:
        connection.close()

@app.route('/api/profile', methods=['GET', 'PUT'])
@token_required
def profile_route(email):
    connection = connect_to_db()
    if not connection:
        return jsonify({'error': 'Database connection failed.'}), 500
        
    try:
        with connection.cursor(dictionary=True) as cursor:
            if request.method == 'GET':
                # Fetch profile using email
                cursor.execute(
                    "SELECT name, email, vehicle_id, contact_number, address, car_brand, model FROM user_info WHERE email = %s",
                    (email,)
                )
                user_info = cursor.fetchone()
                if not user_info:
                    return jsonify({'error': 'User not found.'}), 404
                
                formatted_info = {
                    'name': user_info['name'],
                    'email': user_info['email'],
                    'vehicleId': user_info['vehicle_id'],
                    'phoneNumber': user_info['contact_number'],
                    'address': user_info['address'],
                    'carBrand': user_info['car_brand'],
                    'carModel': user_info['model']
                }
                return jsonify(formatted_info), 200
                
            elif request.method == 'POST' or request.method == 'PUT':
                data = request.get_json() or {}
                name = data.get('name')
                new_email = data.get('email')
                vehicle_id = data.get('vehicleId')
                contact_number = data.get('phoneNumber')
                address = data.get('address')
                car_brand = data.get('carBrand')
                model = data.get('carModel')
                
                if not all([name, new_email, vehicle_id, contact_number, address, car_brand, model]):
                    return jsonify({'error': 'All fields are required!'}), 400
                
                query = '''
                UPDATE user_info
                SET name = %s, email = %s, vehicle_id = %s, contact_number = %s, 
                    address = %s, car_brand = %s, model = %s
                WHERE email = %s
                '''
                cursor.execute(query, (name, new_email, vehicle_id, contact_number, address, car_brand, model, email))
                connection.commit()
                
                # If email changed, generate a new token
                token = serializer.dumps(new_email) if new_email != email else None
                
                return jsonify({
                    'message': 'Profile updated successfully!',
                    'token': token,
                    'user': {
                        'name': name,
                        'email': new_email,
                        'carBrand': car_brand,
                        'carModel': model
                    }
                }), 200
    except connector.Error as e:
        print(f"Error executing query: {e}")
        return jsonify({'error': 'Database error occurred.'}), 500
    finally:
        connection.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)