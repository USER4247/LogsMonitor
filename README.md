# 🚀 Log Monitor Demo

A lightweight and efficient log monitoring system designed for quick local deployment and effective log analysis. This demo showcases a full-stack application built with **Express.js** for the backend and **React** for the frontend, providing a robust solution for managing and searching structured log data.

---

## ✨ Features

- **Structured Log Ingestion**  
  Easily add new log entries with predefined metadata (level, message, timestamp, etc.) via a dedicated POST endpoint.

- **Keyword-Based Search**  
  Leverage a reverse index (powered by `wordEngine.json`) for lightning-fast, keyword-based log searching.

- **Categorized Filters**  
  The GET endpoint not only retrieves all logs but also provides categorized filters for easy navigation and analysis.

- **File-Based "Database"**  
  Utilizes simple JSON files (`db.json` for logs and `wordEngine.json` for the reverse index) as a lightweight, no-setup database solution. Ideal for local development and demos.

- **Fast & Lightweight**  
  Designed for minimal overhead, ensuring quick startup and responsive performance.

---

## 🛠️ Technologies Used

- **Backend:** Express.js  
- **Frontend:** React  
- **Data Storage:** JSON files (`db.json`, `wordEngine.json`)

---

## 🏗️ Project Structure

- `db.json`  
  Stores all log entries with their associated metadata.

- `wordEngine.json`  
  Acts as a reverse index, mapping keywords to log IDs for efficient search.

- **Backend** (`server.js` inside backend folder)  
  Handles API requests, log ingestion, tokenization, indexing, and data retrieval.  
  Specifically, it extracts the log message from each POST request, tokenizes the message into individual words, normalizes these words (e.g., lowercasing, removing punctuation), and then updates `wordEngine.json` — a JSON-based inverted index where each keyword (key) maps to a list of log entry IDs (values). This structure enables fast and   efficient keyword-based searching. The logs are being stored inside of `backend/database/db.json` . The 0th index inside `backend/database/db.json` holds reference to all types of messages such as `error` , `message` , `info` , `warn` and all logs are stored in jsonified format starting from index 1.


- **Frontend** (`src/` and `frontend`)  
  Provides a user interface for viewing logs, applying filters, and performing searches.

---

## 🚀 Getting Started

Follow these steps to get the Log Monitor Demo up and running on your local machine.

### Prerequisites

- Node.js (LTS version recommended)  
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/USER4247/LogsMonitor.git
cd log-monitor-demo

# Install backend dependencies
cd backend # or wherever your Express.js app is located
npm install
# or
yarn install

# Install frontend dependencies
cd ../frontend # or wherever your React app is located
npm install
# or
yarn install
```
### Running The Application 
```
# go to the main folder of project inside of your desired code editor and write the following commands
npm run dev
# to run the website

cd backend
node server.js

# to run the express server!
```
## 💡 API Endpoints

### POST `/logs`  
Create a new structured log entry by sending log data to this endpoint.

### GET `/logs`  
Retrieve all stored log entries along with categorized filters for easy browsing.

### GET `/logs/search`  
Search logs by keyword or criteria to find specific log entries.




