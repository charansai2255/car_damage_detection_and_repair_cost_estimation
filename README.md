# 🤖 Accident Damage Detection and Repair Cost Estimation

[Accident Damage Detection and Repair Cost Estimation](https://github.com/user-attachments/assets/5b6b8a1d-cb9c-4b57-87a5-dc80ceeb955e)

An AI-powered **Vehicle Damage Detection System** designed to detect and estimate repair costs for damaged car parts based on uploaded images. The system uses **YOLOv8** for object detection and a modern **React SPA** frontend with a **Flask REST API** backend for seamless user interaction. This project helps automate the process of assessing vehicle damage, making it efficient for insurance companies and repair centers to evaluate repair costs quickly.

---

## Table of Contents

- 🚗 [Project Overview](#project-overview)
- ⚙️ [Features](#features)
- 🛠️ [Technologies Used](#technologies-used)
- 📁 [Project Structure](#project-structure)
- 📝 [Setup and Installation](#setup-and-installation)
- 💻 [Usage](#usage)
- 🤖 [Model Information](#model-information)
- 🚀 [Future Improvements](#future-improvements)

---

## 🚗 Project Overview

The **Vehicle Damage Detection System** helps users upload car images and detect damaged parts, including:
- **Bonnet**
- **Bumper**
- **Dickey**
- **Door**
- **Fender**
- **Light**
- **Windshield**

The detected parts are highlighted in the image, and the system estimates repair costs based on the detected damage.

---

## ⚙️ Features

- **Object Detection**: Detect damaged car parts using YOLOv8, optimized with a fine-tuned confidence threshold (`conf=0.20`) to capture minor/moderate damage accurately without background noise.
- **Cost Estimation**: Automatically estimates repair costs for detected parts using dynamic lookup based on your car's specific brand and model.
- **Case-Insensitive DB Queries**: Queries utilize database normalization (`UPPER()`) to resolve casing mismatches between signup values (e.g. `'alto'`, `'SKODA'`) and database pricing registers (e.g. `'ALTO'`, `'SKODA'`).
- **Interactive Glassmorphism UI**: Beautiful, modern dark UI styling featuring transparent panels, smooth hover animations, tailored color systems (purple, emerald, glass borders), and responsive elements.
- **Side-by-Side Visual Comparison**: Displays the original uploaded image and the AI scan output side-by-side on the estimate breakdown screen, allowing users to compare damages directly.
- **📄 PDF Report Generator**: Generate premium A4 PDF reports directly on the client side using `jsPDF` and `jspdf-autotable`. The report includes:
  - Vehicle owner name, email, car brand/model, and registration ID.
  - Date and time of the scan.
  - Original vs. Scan Output side-by-side images.
  - Clean tabular breakdown of parts, quantities, unit prices, and sub-totals.
  - Highlighted green grand total estimation banner.
- **Inspection History (Recent Uploads)**: A dashboard history panel tracking the last **5 inspection uploads** for the user's specific vehicle, keeping histories stored in MySQL with a quick re-view button.
- **Secure Authentication**: Token-based JSON web authentication (`itsdangerous` bearer token auth) with client-side local storage routing guards (`ProtectedRoute`).

---

## 🛠️ Technologies Used

- **Backend**: 
  - Flask (Python REST API)
  - YOLOv8 (for object detection)
  - MySQL (for database management)
  - flask-cors (cross-origin support)
  - itsdangerous (token-based authentication)
- **Frontend**: 
  - React + TypeScript (Vite)
  - jsPDF + jspdf-autotable (PDF report generation)
  - Lucide React (icons)
  - React Router DOM (SPA navigation)
- **Libraries**: 
  - OpenCV (for image processing)
  - Ultralytics (YOLOv8 integration)
  - bcrypt (password hashing)

---

## 📁 Project Structure

```
accident-damage-detection/
├── backend/                    # Flask REST API
│   ├── .venv/                  # Python virtual environment
│   ├── models/                 # YOLOv8 model weights
│   ├── static/                 # Uploaded & detected images
│   ├── templates/              # Legacy HTML templates
│   ├── app.py                  # Main Flask application
│   ├── config.py               # Database credentials
│   ├── requirements.txt        # Python dependencies
│   ├── db_schema.sql           # MySQL schema
│   ├── car_parts_prices.json   # Part pricing data
│   └── insert_data_into_db.py  # DB seeding script
├── frontend/                   # React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── components/         # Navbar, ProtectedRoute
│   │   ├── pages/              # Home, Login, Signup, Dashboard, Estimate, Profile
│   │   ├── utils/              # PDF generator helper
│   │   ├── api.ts              # API helper utilities
│   │   ├── App.tsx             # Router configuration
│   │   ├── index.css           # Global design system
│   │   └── main.tsx            # Entry point
│   ├── index.html              # HTML shell
│   ├── package.json            # Node dependencies
│   └── vite.config.ts          # Vite configuration
└── README.md                   # This file
```

---

## 📝 Setup and Installation

### Prerequisites
- Python 3.11.8
- Node.js 18+ and npm
- MySQL Server

### Backend Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/sahilkhan-7/accident-damage-detection.git
   cd accident-damage-detection
   ```

2. **Set up Python virtual environment**:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate     # Windows
   # source .venv/bin/activate  # macOS/Linux
   ```

3. **Install Required Packages**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set Up MySQL Database**:
   - Create a new MySQL database.
   - Run the schema: `mysql -u root -p < db_schema.sql`
   - Seed pricing data: `python insert_data_into_db.py`
   - Update the database credentials in `config.py`:
     ```python
     mysql_credentials = {
         'host': 'localhost',
         'user': 'root',
         'password': 'yourpassword',
         'database': 'car_damage_detection'
      }
     ```

5. **Start the Backend Server**:
   ```bash
   python app.py
   ```
   The API will run on `http://localhost:5000`.

### Frontend Setup

1. **Install Node dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The React app will run on `http://localhost:5173`.

---

## 💻 Usage
- **Sign Up**: Create an account by filling out your personal details and vehicle information.
- **Log In**: Use your credentials to log in to the system.
- **Upload Image**: Upload an image of the damaged vehicle via drag-and-drop.
- **View Results**: Compare original and scanned images side-by-side, check repair price breakdowns, and review vehicle profiles.
- **Download PDF**: Generate and download a formatted PDF damage report for insurance or workshop use.
- **History Logs**: Browse the dashboard history cards to quickly view any of your last 5 inspections.

---

## 🤖 Model Information
- **YOLOv8 Object Detection**: The model was trained on a custom dataset of vehicle parts, including the bonnet, bumper, dickey, door, fender, light, and windshield.
- **Confidence Calibration**: The inference code has been calibrated to use a threshold of `0.20` (from `0.25`) to catch damage with low confidence output, ensuring robust detection.

---

## 🚀 Future Improvements
- **Multi-language Support**: Extend the system to support multiple languages.
- **Damage Severity Analysis**: Improve the system to estimate the extent of damage in more detail.
- **Insurance Integration**: Allow integration with insurance companies for seamless claim processing.
- **Mobile App**: Develop a mobile app version for on-the-go damage detection.
