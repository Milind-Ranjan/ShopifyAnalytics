import { spawn } from 'child_process';
import path from 'path';
import prisma from '../config/database';

// Helper to handle BigInt and Decimal for JSON serialization
const jsonReplacer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (value && typeof value === 'object' && value.constructor.name === 'Decimal') {
    return value.toString();
  }
  return value;
};

export class DSService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private async runPythonScript(scriptName: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // Adjust paths based on environment. 
      // Assuming running from project root (xenofde-backend-main)
      const pythonPath = path.join(process.cwd(), 'src', 'ds_engine', 'venv', 'bin', 'python3');
      const scriptPath = path.join(process.cwd(), 'src', 'ds_engine', scriptName);
      
      const pythonProcess = spawn(pythonPath, [scriptPath]);
      
      let result = '';
      let error = '';

      // Send data to stdin
      pythonProcess.stdin.write(JSON.stringify(data, jsonReplacer));
      pythonProcess.stdin.end();

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python Error for ${scriptName}:`, error);
          reject(new Error(`Python script exited with code ${code}: ${error}`));
        } else {
          try {
            resolve(JSON.parse(result));
          } catch (e) {
             console.error(`Python Output Parse Error for ${scriptName}:`, result);
            reject(new Error(`Failed to parse Python output: ${result}`));
          }
        }
      });
    });
  }

  async getEDA() {
    const orders = await prisma.order.findMany({ 
        where: { tenantId: this.tenantId },
        select: {
            totalPrice: true,
            createdAt: true,
            customerId: true
        }
    });
    const customers = await prisma.customer.findMany({ 
        where: { tenantId: this.tenantId },
        select: {
            totalSpent: true,
            ordersCount: true,
            firstName: true,
            lastName: true
        }
    });
    const products = await prisma.product.findMany({ where: { tenantId: this.tenantId } });
    
    return this.runPythonScript('eda.py', { orders, customers, products });
  }

  async getSegmentation() {
    const orders = await prisma.order.findMany({ 
        where: { tenantId: this.tenantId },
        select: {
            id: true,
            totalPrice: true,
            createdAt: true,
            customerId: true
        }
    });
    return this.runPythonScript('segmentation.py', { orders });
  }

  async getForecast() {
    const orders = await prisma.order.findMany({ 
        where: { tenantId: this.tenantId },
        select: {
            totalPrice: true,
            createdAt: true
        }
    });
    return this.runPythonScript('forecast.py', { orders });
  }
}
