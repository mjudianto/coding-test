# Coding Challenge: Sales Dashboard with Next.js & FastAPI

## Getting Started

1. **Clone or Download** this repository (or fork it, as described above).
2. **Backend Setup**  
   - Navigate to the `backend` directory.  
   - Make Sure python3 is installed
   - Create a virtual environment (optional but recommended).  
   - Create virtual environment
      ```bash
     python3 -m venv env
     ```  
   - Activate virtual environment (for mac)
      ```bash
     source env/bin/activate
     ```
   - Activate virtual environment (for windows)
      ```bash
     env\Scripts\activate
     ```  
   - Install dependencies:  
     ```bash
     pip install -r requirements.txt
     ```  
   - Run the server:  
     ```bash
     uvicorn main:app --host 0.0.0.0 --port 8000 --reload
     ```  
   - Confirm the API works by visiting `http://localhost:8000/docs`.

3. **Frontend Setup**  
   - Navigate to the `frontend` directory.  
   - Create a virtual environment (optional but recommended).  
   - Create virtual environment
      ```bash
     python3 -m venv env
     ```  
   - Activate virtual environment (for mac)
      ```bash
     source env/bin/activate
     ```
   - Activate virtual environment (for windows)
      ```bash
     env\Scripts\activate
     ```  
   - Install dependencies:  
     ```bash
     npm install
     ``` 
   - Start the development server:  
     ```bash
     npm run dev
     ```  
   - Open `http://localhost:3000` to view your Next.js app.

---

**Design Choice**
Main Page
- Interactive world map with clickable user location dots
- Clicking a dot filters the data panel to show users in that region
Includes:
  - Search bar
  - Filters synced with the map
  - Ask AI panel using Google Gemini AI for questions about the data
  - Custom loading animation and no-data animation
  - A 1-second delay is added to simulate data fetching and show the loading effect

Displays detailed user profile information
Tabs for:
  - User’s clients
  - User’s deals

Clients Page
  - Lists all clients and their company information
  - Includes badge-based filtering system

Deals Page
Mini-dashboard includes:
  - Deal status classification
  - Total count and value of deals
  - Interactive table supports:
    - Column sorting
    - Search
    - Filtering

**Improvement That Can Be Made**
- UI/UX Enhancements: More engaging animations and transitions
- Data Enrichment: Add timestamps to deals to unlock time-based filtering and analytics
- Advanced Filtering: Group and filter data by date ranges or custom criteria
- AI-Powered Insights: Use modern AI to:
  - Forecast sales
  - Predict customer churn
  - Provide automated insights and summaries


**Thank You**
