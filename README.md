# Telangana Today — AI Reader Comment Moderation Assistant

A complete, high-fidelity AI-assisted editorial tool built for *Telangana Today* newspaper to scan, moderate, and analyze reader comments using the Gemini 1.5 Pro API. The platform features an editorial workbench, a detailed historical audit log, preset testing templates, and an analytics dashboard with custom SVG charting (no dependencies).

## Project Structure

```text
telangana-comment-moderator/
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── generate.py
│   │   ├── history.py
│   │   ├── feedback.py
│   │   └── analytics.py
│   ├── gemini_client.py
│   ├── prompt_engine.py
│   ├── config.py
│   ├── requirements.txt
│   ├── db_setup.sql
│   └── .env.example
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── ModerationForm.jsx
        │   ├── OutputDisplay.jsx
        │   ├── HistoryPanel.jsx
        │   ├── AnalyticsDashboard.jsx
        │   ├── FeedbackWidget.jsx
        │   └── TemplatePresets.jsx
        └── api/
            └── client.js
```

---

## 1. Database Setup (MySQL)

1. Connect to your local MySQL instance.
2. Run the `backend/db_setup.sql` script to create the database, table schema, pre-populate default editorial templates, and seed historical moderation logs for the 14-day analytics timeline:
   ```bash
   mysql -u root -p < backend/db_setup.sql
   ```

---

## 2. Backend Setup (Flask)

1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy the `.env.example` file to create your environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Edit the `.env` file and enter your Gemini API Key and MySQL database credentials:
   ```ini
   GEMINI_API_KEY=AIzaSyYourGeminiAPIKeyHere
   USE_MYSQL=true
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DB=telangana_moderation
   SECRET_KEY=generate_a_random_secret_string
   ```
   You can also use one connection string instead of the `MYSQL_*` fields:
   ```ini
   DATABASE_URL=mysql+pymysql://root:your_mysql_password@localhost:3306/telangana_moderation
   ```
   *Note: If no Gemini API Key is provided or left as default, the backend will auto-detect this and fall back to a high-fidelity local mock simulator so you can test all interface features immediately without an active API key.*

5. Start the backend Flask server:
   ```bash
   python app.py
   ```
   The API server runs on [http://localhost:5000](http://localhost:5000). You can check its health at [http://localhost:5000/api/health](http://localhost:5000/api/health). The health response includes the active database engine and whether the database connection is working.

---

## 3. Frontend Setup (React & Vite)

1. Open a new terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install the Node.js packages:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file (if present) or create a `.env` file in the `frontend/` directory to point to the backend URL:
   ```ini
   VITE_API_URL=http://localhost:5000
   ```
4. Start the Vite React development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the workbench at [http://localhost:5173](http://localhost:5173).

---

## Key Features

1. **Automated Content Scans (Workbench)**: Detects abusive content, defamation, political triggers, legal risk, spam, and fake news. Features word limits and warnings.
2. **Circular Conic Confidence Gauge**: Interactive, pure-CSS conic gradient scores matching the verdict color.
3. **Editor Ratings & Action Plans**: Stars (1-5) and comment forms to record editorial alignment, coupled with actionable text recommendations.
4. **PDF Reports Generation**: Uses the `jsPDF` package natively on the frontend to compile and download comprehensive report summaries.
5. **No Charting Libraries**: The entire analytics dashboard uses dynamically computed SVG line charts, area charts, and segmented tracks built directly from React state datasets.
6. **Telangana Contextual Awareness**: Seeded with templates and examples addressing Warangal rallies, Hyderabad real estate, IPL SRH Uppal matches, and TSPSC Group-1 exams.
"# telangana_comment_moderator" 
"# telangana_comment_moderator" 
