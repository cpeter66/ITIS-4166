
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

let swaggerDocument;
try {
  swaggerDocument = yaml.load(fs.readFileSync('./docs/openapi.yaml', 'utf8'));
} catch (error) {
  console.log('Swagger documentation not found, skipping...');
}

app.use(express.json());
app.use(morgan('tiny'));

if (swaggerDocument) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'E-Commerce API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      docs: '/api-docs',
      health: '/health'
    }
  });
});

app.use((req, res, next) => {
  const err = new Error(`Cannot ${req.method} ${req.url}`);
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.message && err.message.includes('foreign key constraint')) {
    return res.status(409).json({ 
      error: 'Cannot delete product because it has existing orders' 
    });
  }
  
  if (err.code === 'P2003' || (err.message && err.message.includes('P2003'))) {
    return res.status(409).json({ 
      error: 'Cannot delete resource because it has existing relationships' 
    });
  }
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`\n Server is running on http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(` Health Check: http://localhost:${PORT}/health`);
});

export default app;