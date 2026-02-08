# Shopify Analytics Platform

A powerful, multi-tenant analytics platform designed to ingest, process, and visualize Shopify store data. This application combines a robust Node.js backend, a modern Next.js frontend, and a specialized Python Data Science engine to provide predictive analytics, customer segmentation, and sales forecasting.

## 🎥 Demo Video
<video src="https://raw.githubusercontent.com/Milind-Ranjan/ShopifyAnalytics/main/demo.mov"
       controls
       width="100%">
</video>

## 🚀 Key Features

*   **Multi-Tenancy Support**: Securely manage multiple Shopify stores with isolated data and authentication.
*   **Comprehensive Dashboard**: Real-time overview of total revenue, orders, customers, and product performance.
*   **Advanced Analytics**:
    *   **Sales Forecasting**: 30-day sales predictions using Holt-Winters Exponential Smoothing.
    *   **Customer Segmentation**: RFM (Recency, Frequency, Monetary) analysis to identify High, Mid, and Low-value customers.
    *   **Exploratory Data Analysis (EDA)**: Deep dives into data distributions and trends.
*   **Data Ingestion**: Automated syncing of Orders, Products, and Customers from Shopify via the Admin API.
*   **Interactive Visualizations**: Beautiful, responsive charts built with Recharts.

## 📖 How It Works

### 1. Registration & Onboarding
To start using the dashboard, you need to register a new tenant account. This links your user account to a specific Shopify store.

1.  Navigate to the **Register** page.
2.  Provide your **Email** and **Password**.
3.  Enter your **Shopify Store Domain** (e.g., `my-store.myshopify.com`).
4.  Enter your **Shopify Access Token**.
    *   *Note: You need to generate an Admin API Access Token from your Shopify Partner Dashboard or Store Settings with `read_orders`, `read_products`, and `read_customers` scopes.*
5.  Click **Register**. This creates a secure, isolated tenant environment for your store.

### 2. Data Synchronization
Once registered and logged in, you need to ingest data from Shopify to populate the dashboard.

1.  Click the **Sync Data** button in the top-right corner of the Dashboard.
2.  **Behind the Scenes**:
    *   The frontend calls the backend `ingestion` service.
    *   The **ShopifyService** connects to your store using the provided Access Token and the Shopify Admin REST API (`2024-01` version).
    *   It systematically fetches:
        *   **Customers**: Profiles, total spend, order counts.
        *   **Products**: Titles, variants, prices, inventory.
        *   **Orders**: Financial status, line items, customer associations.
    *   The **IngestionService** handles pagination (fetching all pages of data) and performs an "upsert" operation (update if exists, insert if new) into the local database.
3.  Once the sync is complete, the dashboard metrics and charts will automatically update with the latest data.

### 3. Analytics Engine
*   **Python Integration**: When you view the Forecast or Segmentation tabs, the Node.js backend spawns a Python child process.
*   **Data Transfer**: Cleaned data is piped from the database to the Python script via standard input (stdin).
*   **Processing**: The Python script runs statistical models (like Holt-Winters for forecasting) and returns the results via standard output (stdout) to be rendered by the frontend.

## 🛠 Tech Stack

### Backend (`/backend-main`)
*   **Runtime**: Node.js & Express.js
*   **Database**: SQLite (Local Dev) / PostgreSQL (Production ready)
*   **ORM**: Prisma
*   **Authentication**: JWT & BCrypt
*   **Data Science Engine**: Python 3, Pandas, NumPy, Statsmodels, Scikit-learn
*   **Scheduling**: Node-cron

### Frontend (`/frontend-main`)
*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS
*   **Charts**: Recharts
*   **HTTP Client**: Axios

## 📂 Project Structure

```
ShopifyAnalytics/
├── backend-main/           # Node.js API Server
│   ├── src/
│   │   ├── config/        # Database & Env config
│   │   ├── ds_engine/     # Python scripts for ML/Analytics
│   │   ├── middleware/    # Auth & Tenant isolation
│   │   ├── routes/        # API Endpoints
│   │   ├── services/      # Business logic & DS integration
│   │   └── server.ts      # Entry point
│   ├── prisma/            # Database schema & migrations
│   └── ...
├── frontend-main/          # Next.js Dashboard
│   ├── app/               # App Router pages
│   ├── components/        # Reusable UI components & Charts
│   ├── lib/               # API client configuration
│   └── ...
└── README.md
```

## ⚡ Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)
*   Python 3.8+ (for DS Engine)
*   Git

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Milind-Ranjan/ShopifyAnalytics.git
    cd ShopifyAnalytics
    ```

2.  **Setup Backend**
    ```bash
    cd backend-main
    
    # Install dependencies
    npm install
    
    # Install Python dependencies
    pip3 install -r src/ds_engine/requirements.txt
    
    # Setup Database (SQLite)
    npx prisma migrate dev --name init
    
    # Start Development Server
    npm run dev
    ```
    The backend will start on `http://localhost:3001`.

3.  **Setup Frontend**
    Open a new terminal window:
    ```bash
    cd frontend-main
    
    # Install dependencies
    npm install
    
    # Start Development Server
    npm run dev
    ```
    The frontend will start on `http://localhost:3000`.

### Configuration (`.env`)

**Backend** (`backend-main/.env`)
```env
DATABASE_URL="file:./dev.db"
PORT=3001
```

**Frontend** (`frontend-main/.env`)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 🔜 Future Enhancements
*   Live Shopify Webhook integration.
*   Advanced user permission roles (Admin vs Viewer).
*   Exportable reports (PDF/CSV).
*   AI-powered text-to-insight query interface.
