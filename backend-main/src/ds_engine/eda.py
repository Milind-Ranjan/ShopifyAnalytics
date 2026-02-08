import sys
import json
import pandas as pd
import numpy as np

def perform_eda(data):
    try:
        orders_df = pd.DataFrame(data.get('orders', []))
        customers_df = pd.DataFrame(data.get('customers', []))
        products_df = pd.DataFrame(data.get('products', []))

        results = {}

        # Orders EDA
        if not orders_df.empty:
            # Convert numeric columns
            orders_df['totalPrice'] = pd.to_numeric(orders_df['totalPrice'], errors='coerce')
            orders_df['createdAt'] = pd.to_datetime(orders_df['createdAt'])
            
            # Basic stats
            results['total_revenue'] = float(orders_df['totalPrice'].sum())
            results['avg_order_value'] = float(orders_df['totalPrice'].mean())
            results['order_count'] = len(orders_df)
            
            # Trends (Monthly)
            orders_df['month'] = orders_df['createdAt'].dt.to_period('M').astype(str)
            monthly_sales = orders_df.groupby('month')['totalPrice'].sum().to_dict()
            results['monthly_sales'] = monthly_sales
            
            # Seasonality (Day of week)
            orders_df['day_of_week'] = orders_df['createdAt'].dt.day_name()
            dow_sales = orders_df.groupby('day_of_week')['totalPrice'].mean().to_dict()
            results['sales_by_dow'] = dow_sales

        # Customers EDA
        if not customers_df.empty:
            customers_df['totalSpent'] = pd.to_numeric(customers_df['totalSpent'], errors='coerce')
            results['customer_count'] = len(customers_df)
            results['avg_customer_ltv'] = float(customers_df['totalSpent'].mean())
            
            # Top Customers
            top_customers = customers_df.nlargest(5, 'totalSpent')[['firstName', 'lastName', 'totalSpent']]
            results['top_customers'] = top_customers.to_dict(orient='records')

        # Products EDA
        if not products_df.empty:
             # Just basic counts for now as price might be null or mixed
             results['product_count'] = len(products_df)

        return results

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        results = perform_eda(data)
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
