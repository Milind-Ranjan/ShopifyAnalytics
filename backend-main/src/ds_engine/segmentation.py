import sys
import json
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def perform_segmentation(data):
    try:
        orders_df = pd.DataFrame(data.get('orders', []))
        
        if orders_df.empty:
             return {"error": "No order data for segmentation"}

        # Preprocessing
        orders_df['totalPrice'] = pd.to_numeric(orders_df['totalPrice'], errors='coerce')
        orders_df['createdAt'] = pd.to_datetime(orders_df['createdAt'])
        
        # RFM Calculation
        # Assume 'now' is the max date in the dataset + 1 day
        now_date = orders_df['createdAt'].max() + pd.Timedelta(days=1)
        
        rfm = orders_df.groupby('customerId').agg({
            'createdAt': lambda x: (now_date - x.max()).days, # Recency
            'id': 'count', # Frequency
            'totalPrice': 'sum' # Monetary
        }).reset_index()
        
        rfm.columns = ['customerId', 'Recency', 'Frequency', 'Monetary']
        
        # K-Means Clustering
        # We need to handle potential NaN or infinite values
        rfm_clean = rfm.dropna()
        if len(rfm_clean) < 3:
             return {"error": "Not enough data points for clustering"}
             
        features = rfm_clean[['Recency', 'Frequency', 'Monetary']]
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(features)
        
        # Determine optimal clusters? For simplicity, we'll use 3 segments (Low, Mid, High value)
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        rfm_clean['Cluster'] = kmeans.fit_predict(scaled_features)
        
        # Analyze clusters
        cluster_summary = rfm_clean.groupby('Cluster').agg({
            'Recency': 'mean',
            'Frequency': 'mean',
            'Monetary': 'mean',
            'customerId': 'count'
        }).reset_index()
        
        # Map clusters to meaningful names based on Monetary value
        cluster_summary = cluster_summary.sort_values('Monetary')
        cluster_mapping = {
            cluster_summary.iloc[0]['Cluster']: 'Low Value',
            cluster_summary.iloc[1]['Cluster']: 'Mid Value',
            cluster_summary.iloc[2]['Cluster']: 'High Value'
        }
        
        rfm_clean['Segment'] = rfm_clean['Cluster'].map(cluster_mapping)
        
        # Prepare result
        result = {
            'segments_summary': cluster_summary.to_dict(orient='records'),
            'customer_segments': rfm_clean[['customerId', 'Recency', 'Frequency', 'Monetary', 'Segment']].to_dict(orient='records')
        }
        
        return result

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        results = perform_segmentation(data)
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
