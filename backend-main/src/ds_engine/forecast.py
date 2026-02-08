import sys
import json
import pandas as pd
import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.metrics import mean_squared_error

def perform_forecast(data):
    try:
        orders_df = pd.DataFrame(data.get('orders', []))
        
        if orders_df.empty:
             return {"error": "No order data for forecasting"}

        # Preprocessing
        orders_df['totalPrice'] = pd.to_numeric(orders_df['totalPrice'], errors='coerce')
        orders_df['createdAt'] = pd.to_datetime(orders_df['createdAt'])
        
        # Aggregate by day
        daily_sales = orders_df.set_index('createdAt').resample('D')['totalPrice'].sum().fillna(0)
        
        if len(daily_sales) < 7:
             return {"error": "Not enough data points for forecasting (need at least 7 days)"}

        # Train/Test Split (last 7 days as test if enough data, else just train on all)
        # For this demo, we'll train on all and forecast next 30 days
        
        # Model: Holt-Winters (Triple Exponential Smoothing) if we have enough data (2 seasons), else Double or Simple
        # We'll use additive trend and seasonality if possible
        try:
            model = ExponentialSmoothing(
                daily_sales, 
                trend='add', 
                seasonal='add', 
                seasonal_periods=7
            ).fit()
        except:
            # Fallback to simple exponential smoothing if HW fails (e.g. not enough data)
            try:
                model = ExponentialSmoothing(daily_sales, trend='add').fit()
            except:
                 model = ExponentialSmoothing(daily_sales).fit()

        # Forecast
        forecast_days = 30
        forecast = model.forecast(forecast_days)
        
        # Evaluation (in-sample)
        predictions = model.fittedvalues
        rmse = np.sqrt(mean_squared_error(daily_sales, predictions))
        mape = np.mean(np.abs((daily_sales - predictions) / daily_sales)) * 100
        
        # Replace inf MAPE (if actual is 0)
        if np.isinf(mape):
            mape = None

        # Prepare result
        history = [{'date': str(d.date()), 'value': float(v), 'type': 'history'} for d, v in daily_sales.items()]
        future = [{'date': str(d.date()), 'value': float(v), 'type': 'forecast'} for d, v in forecast.items()]
        
        result = {
            'data': history + future,
            'metrics': {
                'RMSE': float(rmse),
                'MAPE': float(mape) if mape is not None else "N/A"
            }
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
        results = perform_forecast(data)
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
