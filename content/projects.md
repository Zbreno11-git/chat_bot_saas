# Projects

All repos at github.com/Zbreno11-git unless noted otherwise. "Source" lists where each claim was checked (CV section, repo README, live demo).

## SaaS Communications — Customer Churn Analysis (End-to-End)
**Stack:** Python, XGBoost, SHAP, Tableau, Jira/Scrum, Google Slides
**Type:** EDA + machine learning + KPI dashboard + project management + executive deck
Full churn analysis simulating a SaaS Communications business unit, from raw data to an executive recommendation. KPIs include total MRR of $316K, MRR at risk of $178K, a 26.54% churn rate, and 620 customers classified as high risk. Trained an XGBoost model (AUC-ROC 0.84, recall 77%); used SHAP to identify Contract, Tenure and MonthlyCharges as top features. Estimated $642K/year in savings from retaining 30% of high-risk customers. Built a Tableau dashboard and a 5-slide executive deck. Project managed in Jira with Scrum: 4 epics, 16 user stories, 3 sprints.
Repo: https://github.com/Zbreno11-git/Saas_Comunnications
Source: CV §3.1, README

## Austin 311 — End-to-End Analytics Pipeline
**Stack:** BigQuery, SQL, Python, Pandas, XGBoost, Scikit-Learn, Tableau
**Type:** Analytics + machine learning + dashboard
End-to-end pipeline: extraction via BigQuery/SQL, processing in Pandas, predictive modeling, visualization. Categorized 255+ complaint types and analyzed resolution time by category. Built an XGBoost model (ROC AUC 0.785). Built a Tableau dashboard with operational insights.
Repo: https://github.com/Zbreno11-git/Austin_311
Source: CV §3.2, README

## Smart Store — IoT + Data Engineering Pipeline
**Stack:** Arduino, Python, PostgreSQL, dbt, SQL, Evidence
**Type:** IoT + data engineering + analytics engineering + dashboard
End-to-end pipeline connecting physical hardware to an analytics layer. Arduino with ultrasonic, LDR and NTC sensors captures distance, luminosity and temperature. Python ingests serial readings into PostgreSQL; dbt transforms with staging and fact layers. Analytical logic converts sensor distance into an estimated shelf item count, and flags likely theft when stock disappears under low light. Evidence dashboard for near-real-time stock and event tracking. Architecture: Arduino → Python → PostgreSQL → dbt → Evidence. **Functional portfolio project, not presented as a production corporate system.**
Repo: https://github.com/Zbreno11-git/smart-store-dbt
Source: CV §3.3, README

## Business Card Scanner — AI Document Processing for Teen Health Inc.
**Stack:** Python, Streamlit, Pandas, Google Gemini API, Anthropic Claude API, Google Drive API, Pydantic, openpyxl
**Type:** AI application + multimodal LLM + automation + document processing
Built for Teen Health Inc. to turn business cards collected at outreach events, conferences and partner meetings into a structured contact database. Batch-processes up to 20 images per run. Integrates Google Gemini and Anthropic Claude, selectable at runtime. Structured schema extracts company, contact, role, email, phone, address and website, leaving missing fields empty rather than letting the model invent data. Exports to CSV and Excel. Limited retries with backoff for transient API errors; isolates failures so one unreadable image doesn't stop the whole batch. Optional Google Drive Picker integration scoped only to user-selected files. CSV exports are protected against spreadsheet formula injection. Runs locally or on Streamlit Community Cloud.
Repo: https://github.com/Zbreno11-git/business-card-scanner
Source: CV §3.4, README

## Wine Quality Predictor — ML + SHAP + AI Sommelier
**Stack:** Python, XGBoost Regressor, SHAP, joblib, Streamlit, Plotly, Google Gemini API
**Type:** Machine learning + explainable AI + LLM + web app
Regression model on the Wine Quality dataset; compared algorithms and selected XGBoost Regressor. Feature engineering added 3 derived variables (acidity_ratio, sulfur_ratio, alcohol_density) for 14 features total. Feature importance and SHAP for interpretability; model serialized with joblib. Computes SHAP values per prediction in real time and visualizes top positive/negative drivers with Plotly. Uses Gemini to turn chemical features and SHAP values into a natural-language "sommelier" explanation — combining predictive ML, explainable AI and generative AI in one app.
Repo: https://github.com/Zbreno11-git/Wine_Quality
Source: CV §3.5, README

## AI Financial Agent — WhatsApp + n8n + Gemini
**Stack:** n8n, Google Gemini API, Google Sheets, AWS EC2, Evolution API
**Type:** AI agent + automation + production
Production system integrating WhatsApp → n8n → Gemini → Google Sheets. Uses natural language to log and automatically categorize financial entries. Prompt engineering for interpreting and classifying input. Combines five distinct technologies in one flow, running on AWS EC2.
Evidence: n8n workflow, not on GitHub — no public link. Contact Breno for a walkthrough.
Source: CV §3.6 only

## Adaptive Résumé App (Adaptador de Currículo Inteligente)
**Stack:** Python, Streamlit, Google Gemini 2.5 Pro API, pypdf, WeasyPrint, Markdown
**Type:** AI-powered web app + LLM + document processing + deploy
Web app that takes a PDF résumé and a job description and uses Gemini 2.5 Pro to adapt the résumé's content automatically. Extracts PDF text with pypdf; generates a structured Markdown résumé via LLM; converts Markdown → HTML → PDF with WeasyPrint. Auto-detects the job posting's language to generate the résumé in Portuguese or English. Prompt engineering includes explicit constraints against inventing information and a length limit. Manages app state with `st.session_state`. Deployed on Streamlit Cloud with secrets management.
Evidence: Streamlit app, not on GitHub — no public link. Contact Breno for a walkthrough.
Source: CV §3.7 only

## Telco Churn — Churn Analysis & Prediction
**Stack:** Python, Pandas, Scikit-Learn, Random Forest, Tableau
**Type:** EDA + machine learning + executive dashboard
Random Forest model with AUC 0.857. Identified 474 customers as high-risk, and roughly $35K/month in potentially recoverable revenue. Found ~43% churn among monthly contracts, and close to 50% churn among Fiber customers without Tech Support.
Repo: https://github.com/Zbreno11-git/Telco_Churn_EDA_DASH
Source: CV §3.8, README

## Vitality Compass — Health Scoring App
**Stack:** Python, Streamlit, Plotly, Supabase/PostgreSQL, Streamlit Cloud
**Type:** Full-stack web app + analytics + data collection
Health and longevity scoring platform inspired by Blue Zones research and evidence-based lifestyle factors (sleep & recovery, physical activity, nutrition quality, mental wellbeing, longevity risk factors). Weighted scoring system with an interactive Plotly radar chart. Persists data with Supabase/PostgreSQL. Goal beyond the scoring UX is building a structured dataset for future analytics/ML.
Repo: https://github.com/Zbreno11-git/Blue_app
Live demo: https://vitality-compass-demo.streamlit.app
Source: CV §3.9, README

## Banco Central — Live Macroeconomic Metrics
**Stack:** Python, Banco Central do Brasil API, Power BI
**Type:** API integration + dashboard
Automated pipeline consuming the Brazilian Central Bank's REST API. Self-updating Power BI dashboard tracking indicators like IPCA, SELIC, USD/BRL and unemployment, with no manual intervention needed to refresh.
Evidence: Power BI report, not on GitHub — no public link. Contact Breno for a walkthrough.
Source: CV §3.10 only

## Uber NYC 2015 — Demand Analysis & Operations Dashboard
**Stack:** Python, Pandas, Plotly, Matplotlib, Tableau
**Type:** EDA + operational analysis + dashboard
Analyzed transport demand by time and day; compared operations across JFK, LGA and EWR airports; ran a Pareto analysis on dispatch data; produced four operational recommendations via a Tableau dashboard.
Repo: https://github.com/Zbreno11-git/Uber_NYC
Source: CV §3.11, README

## Olist E-Commerce — Freight Cost vs. GMV Analysis
**Stack:** Python, Pandas, Plotly, Looker Studio
**Type:** EDA + operational metrics + dashboard
Built a Freight Cost Index (freight / GMV) by state for the 2018 Olist dataset. Found São Paulo at ~39% of total GMV, and the only state efficient by this metric, with a freight index near 0.84.
Repo: https://github.com/Zbreno11-git/E_Commerce_Olist_2018
Source: CV §3.12, README

## Chinook SQL — Sales & Revenue EDA
**Stack:** SQL, Looker Studio
**Type:** SQL analysis + business intelligence
Analyzed artists by revenue, countries by volume, and performance by music genre using SQL; built interactive Looker Studio dashboards for commercial analysis.
Repo: https://github.com/Zbreno11-git/Chinook_EDA_SQL
Source: CV §3.13, README

## Movie Recommendation System — MovieLens 1M
**Stack:** Python, Pandas, NumPy, Scikit-Learn, collaborative filtering
**Type:** EDA + feature engineering + machine learning + recommendation system
EDA over ~1M ratings. Compared Linear Regression and Random Forest; Linear Regression won with RMSE 0.93. Built a collaborative filtering system using a user-item matrix and movie-to-movie correlation.
Repo: https://github.com/Zbreno11-git/RecommendWithMovielens1
Source: CV §3.14, README

## Failed Banks EDA — FDIC Dataset
**Stack:** Python, Pandas, Seaborn, Plotly
**Type:** EDA + financial trend analysis
Analyzed FDIC bank-failure data; identified a failure peak in 2010 following the 2008 financial crisis. Interactive visualization published via GitHub Pages.
Repo: https://github.com/Zbreno11-git/failed_banks_EDA
Live chart: https://zbreno11-git.github.io/failed_banks_EDA/failed_banksplotly.html
Source: CV §3.15, README

## AAPL vs. MSFT — Stock Data Analysis
**Stack:** Python, Pandas, Plotly, yFinance
**Type:** EDA + financial data
Collected and analyzed historical AAPL and MSFT data; restructured a MultiIndex for preparation; compared volatility and trends between the two stocks with interactive Plotly visualizations.
Repo: https://github.com/Zbreno11-git/AAPLvsMSTF_finance
Live charts: https://zbreno11-git.github.io/AAPLvsMSTF_finance/closing_values_finance.html, https://zbreno11-git.github.io/AAPLvsMSTF_finance/volume_changes_finance.html
Source: CV §3.16, README

## Initial Franchise Cost Prediction (Previsão Inicial de Custo para Franquia)
**Stack:** Python, Streamlit, Pandas, Scikit-Learn, Matplotlib, Seaborn
**Type:** Machine learning + regression + web app
Streamlit app estimating a franchise's initial cost from its annual revenue. Reads/prepares data from CSV; trains a simple linear regression model with Scikit-Learn; plots the fitted regression line; lets users enter new values for an automatic prediction.
Repo: https://github.com/Zbreno11-git/previsao_custo_inicial
Source: CV §3.17, README

## Spotify Data Analysis
**Stack:** Python, Pandas, Matplotlib
**Type:** Exploratory data analysis
EDA on real Spotify data: BPM and key distribution, most popular tracks and popularity-score distribution, duration-vs-popularity relationship (found ~zero correlation in this dataset), album analysis and a singles classifier, text processing of titles for most frequent words, and genre distribution.
Evidence: not on GitHub — no public link. Contact Breno for a walkthrough.
Source: CV §3.18 only

## Viking (Life OS) — Personal Assistant
**Stack:** Python 3.12, MCP server, Google Calendar API, Gemini API
**Type:** Personal productivity assistant (CLI + MCP server)
Unified personal assistant for calendar, web browsing and reminders via chat, run as a local Python workspace with a `viking` CLI and an MCP server. Tech stack and vision are public; implementation details (Breno's own calendar data, credentials, personal content) are not. **Not in the master CV.**
Evidence: Local Workspace — see `projects/lifeos-readme.md`. Contact Breno for a walkthrough.
Source: `projects/lifeos-readme.md`

## Altiva Serra — Real-Estate Marketplace Platform (private, in progress)
**Stack:** TypeScript (web) + Python (scraping/processing), Postgres with RLS, Stripe billing, GCP/Cloud Build deploy, PDF generation
**Type:** Multi-tenant SaaS platform (in development, not launched)
An in-progress real-estate marketplace: a shared market dataset with broker-specific data isolated by row-level security, a TypeScript web app, Python scraping/processing services, PDF generation, and Stripe subscriptions for both the platform owner and broker accounts. Billing is currently in Stripe's sandbox/test mode only — the product has not gone live. Tech stack and vision are public; business specifics (scraped sources, real customer/broker names, pricing, financial details) are not. **Not in the master CV.**
Evidence: Local Workspace — see `projects/altiva-serra-readme.md`. Contact Breno for a walkthrough.
Source: `projects/altiva-serra-readme.md`
