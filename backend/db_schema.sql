CREATE DATABASE IF NOT EXISTS car_damage_detection;

USE car_damage_detection;

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
);

CREATE TABLE IF NOT EXISTS car_models (
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    part VARCHAR(50) NOT NULL,
    price INT NOT NULL
);

-- Stores each detection result per user for recent-uploads history
CREATE TABLE IF NOT EXISTS detections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    uploaded_image VARCHAR(255) NOT NULL,
    detected_image VARCHAR(255) NOT NULL,
    parts_summary TEXT NOT NULL,
    total_cost INT NOT NULL DEFAULT 0,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

SELECT * FROM user_info;
SELECT * FROM car_models;
SELECT COUNT(*) FROM car_models;

-- DROP TABLE user_info;
-- DROP TABLE car_models;
-- DROP TABLE detections;