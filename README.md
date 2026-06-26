# Telangana Today — AI Reader Comment Moderation Assistant (v5)

A complete, high-fidelity AI-assisted editorial tool built for *Telangana Today* newspaper to scan, moderate, and analyze reader comments using the Gemini 1.5 Pro API. The platform features an editorial workbench, a detailed historical audit log, preset testing templates, and an analytics dashboard with custom SVG charting (no dependencies).

## Project Structure

```text
telangana-comment-moderator/
├── vercel.json
├── README.md
├── .gitignore
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

## 1. Local Database Setup (MySQL)

1. Connect to your local MySQL instance.
2. Run the SQL script to configure the database:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS telangana_moderation;"
   ```

---

## 2. Local Backend Setup (Flask)

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # or source .venv/bin/activate  # macOS/Linux
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the `.env.example` file to create your environment configuration:
   ```bash
   cp .env.example .env
   ```
5. Edit the `.env` file and enter your Gemini API Key and MySQL database credentials:
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
   *Note: If no Gemini API Key is provided, the backend automatically runs in mock mode for offline local testing.*
6. Start the backend Flask server:
   ```bash
   python app.py
   ```
   The API server runs on [http://localhost:5000](http://localhost:5000).

---

## 3. Local Frontend Setup (React & Vite)

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install the packages:
   ```bash
   npm install
   ```
3. Build the static production bundle:
   ```bash
   npm run build
   ```
   The Flask server automatically serves these compiled assets at the root URL: [http://localhost:5000/](http://localhost:5000/).

---

## 4. Production Deployment (Vercel)

The repository includes a [vercel.json](vercel.json) file configured for a unified deployment:
1. Deploy the code via Vercel CLI or by linking your Git repository.
2. Set `USE_MYSQL=true` in Vercel project environment variables, and configure a remote MySQL database (e.g., Clever Cloud, AWS RDS) since serverless filesystems are read-only.

---

## Key Features

1. **Strict 3-Verdict Taxonomy**: Evaluates comments into exactly `ALLOW`, `NEEDS_REVIEW`, and `REJECT` categories.
2. **Mount-Animated Circular SVG Gauge**: Displays AI confidence score using pure SVG circle dash offsets animating on load.
3. **Comment Phrase Highlighting**: Safely matches and highlights policy violation phrases inside reader comments.
4. **Editor Override Console**: Interactive controls for editors to override borderline content and submit notes.
5. **No Charting Libraries**: Custom SVG daily volume line graphs, quality area graphs, and category breakdowns built directly from raw React coordinates.
6. **Mobile Responsive Navigation**: Sidebar scales down to a sticky bottom tab bar indicator on mobile device sizes (<768px).
