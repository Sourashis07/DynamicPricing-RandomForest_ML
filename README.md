# ✈️ Flight Dynamic Pricing System

A full-stack flight pricing simulator that combines machine learning with business rules to predict and explain flight prices dynamically. Built with FastAPI backend and React frontend.

## 🚀 Live Demo

- **Frontend**: [Deployed on Vercel](your-vercel-url)
- **Backend API**: [Deployed on Render](your-render-url)

## 📋 Features

### 🎯 Core Functionality
- **Dynamic Flight Search**: Search flights by route and class
- **Interactive Price Simulator**: Real-time price adjustments with sliders
- **ML-Powered Pricing**: Random Forest model predicts price multipliers
- **Business Rules Engine**: Seat scarcity and demand surge adjustments
- **Price Explanation**: Transparent breakdown of pricing factors

### 🔧 Technical Features
- **Real-time Updates**: Instant price recalculation
- **Date-based Pricing**: Calendar picker for travel dates
- **Multiple Airlines**: IndiGo, Vistara, Air India, Akasa
- **Route Support**: Delhi-Mumbai, Mumbai-Bangalore, Delhi-Bangalore
- **Class Options**: Economy and Business class

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐
│   React Frontend │ ◄──────────────► │  FastAPI Backend │
│   (Vercel)      │                 │   (Render)      │
└─────────────────┘                 └─────────────────┘
                                            │
                                            ▼
                                    ┌─────────────────┐
                                    │  ML Model (.pkl) │
                                    │ Random Forest   │
                                    └─────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **scikit-learn** - Machine learning model
- **pandas** - Data processing
- **joblib** - Model serialization
- **uvicorn** - ASGI server

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Vanilla CSS** - Styling

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm/yarn

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📡 API Endpoints

### Search Flights
```http
POST /search
Content-Type: application/json

{
  "source": "Delhi",
  "destination": "Mumbai", 
  "flight_class": "Economy"
}
```

### Price Explanation
```http
POST /explain
Content-Type: application/json

{
  "airline": "IndiGo",
  "route": "Delhi_Mumbai",
  "departure_time": "Morning",
  "arrival_time": "Afternoon", 
  "class_": "Economy",
  "days_left": 10,
  "duration": 2.1,
  "stops": 0,
  "seats_left": 45,
  "demand_index": 1.2
}
```

## 🎮 How to Use

1. **Search Flights**
   - Select source and destination cities
   - Choose flight class (Economy/Business)
   - Click "Search" to view available flights

2. **Simulate Pricing**
   - Click on any flight card to expand
   - Select travel date or use days slider
   - Adjust seats left and demand index
   - Click "Recalculate" for new pricing

3. **View Explanation**
   - See breakdown of base fare, ML multiplier, seat factor, demand factor
   - Understand how each factor affects final price

## 💰 Pricing Logic

### Base Fares (₹)
| Route | Economy | Business |
|-------|---------|----------|
| Delhi-Mumbai | 5,000 | 12,000 |
| Mumbai-Bangalore | 4,500 | 11,000 |
| Delhi-Bangalore | 6,000 | 14,000 |

### Dynamic Adjustments
- **ML Multiplier**: 0.8x - 2.5x based on historical patterns
- **Seat Pressure**: Up to 1.2x when ≤10 seats left
- **Demand Surge**: Up to 1.25x for high demand (≥1.4 index)

**Final Price = Base Fare × ML Multiplier × Seat Factor × Demand Factor**

## 🌐 Deployment

### Backend (Render)
1. Connect GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Deploy from `backend` folder

### Frontend (Vercel)
1. Connect GitHub repository
2. Set framework preset: Vite
3. Set root directory: `frontend`
4. Update API base URL in `src/services/api.js`
5. Deploy

## 🔧 Environment Variables

### Backend (Render)
```env
PORT=8000
PYTHON_VERSION=3.9.0
```

### Frontend (Vercel)
```env
VITE_API_BASE_URL=https://your-render-backend-url.com
```

## 📁 Project Structure

```
flight-dynamic-pricing/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── model.pkl            # Trained ML model
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API calls
│   │   └── main.jsx         # Entry point
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Flight data patterns based on Indian aviation industry
- ML model trained on synthetic flight pricing data
- UI inspired by modern flight booking platforms

---

**Built with ❤️ for transparent flight pricing**