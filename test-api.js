import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let adminToken = '';

// Test data storage
let createdProductId;
let createdCategoryId;
let createdOrderId;

// Helper function to make requests with error handling
async function testEndpoint(name, method, url, data = null, token = null) {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const config = { method, url: `${BASE_URL}${url}`, headers, data };
    const response = await axios(config);
    
    console.log(`✅ ${name} - Status: ${response.status}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.log(`❌ ${name} - Status: ${error.response.status} - Error: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.log(`❌ ${name} - No response from server`);
    } else {
      console.log(`❌ ${name} - Error: ${error.message}`);
    }
    return null;
  }
}

// Test suites
async function testHealthCheck() {
  console.log('\n📊 TESTING HEALTH CHECK ENDPOINTS\n' + '='.repeat(50));
  
  try {
    const response = await axios.get('http://localhost:3000/health');
    console.log(`✅ Health Check - Status: ${response.status}`);
    console.log(`   Response:`, response.data);
  } catch (error) {
    console.log(`❌ Health Check - Failed:`, error.message);
  }
  
  try {
    const response = await axios.get('http://localhost:3000/');
    console.log(`✅ Root Endpoint - Status: ${response.status}`);
    console.log(`   Response:`, response.data);
  } catch (error) {
    console.log(`❌ Root Endpoint - Failed:`, error.message);
  }
}

async function testAuth() {
  console.log('\n🔐 TESTING AUTHENTICATION\n' + '='.repeat(50));
  
  // Test signup
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const signupData = {
    email: uniqueEmail,
    password: 'Test123456',
    role: 'USER'
  };
  
  const signupResult = await testEndpoint('User Signup', 'post', '/auth/signup', signupData);
  
  // Test duplicate email signup (should fail)
  await testEndpoint('Duplicate Signup (Should Fail)', 'post', '/auth/signup', signupData);
  
  // Test login with correct credentials
  const loginResult = await testEndpoint('User Login', 'post', '/auth/login', {
    email: uniqueEmail,
    password: 'Test123456'
  });
  
  if (loginResult && loginResult.accessToken) {
    authToken = loginResult.accessToken;
    console.log(`   ✅ Got user token`);
  }
  
  // Test login with wrong password (should fail)
  await testEndpoint('Login Wrong Password (Should Fail)', 'post', '/auth/login', {
    email: uniqueEmail,
    password: 'WrongPassword'
  });
  
  // Test admin login
  const adminLogin = await testEndpoint('Admin Login', 'post', '/auth/login', {
    email: 'admin@example.com',
    password: 'Admin123!'
  });
  
  if (adminLogin && adminLogin.accessToken) {
    adminToken = adminLogin.accessToken;
    console.log(`   ✅ Got admin token`);
  }
}

async function testCategories() {
  console.log('\n📁 TESTING CATEGORIES\n' + '='.repeat(50));
  
  // Get all categories (public)
  const categories = await testEndpoint('Get All Categories', 'get', '/categories');
  
  // Create category (admin only)
  const newCategory = await testEndpoint('Create Category (Admin)', 'post', '/categories', 
    { name: `Test Category ${Date.now()}` }, adminToken);
  
  if (newCategory && newCategory.id) {
    createdCategoryId = newCategory.id;
  }
  
  // Create category without auth (should fail)
  await testEndpoint('Create Category No Auth (Should Fail)', 'post', '/categories', 
    { name: 'Should Fail' });
  
  // Create category as user (should fail)
  await testEndpoint('Create Category as User (Should Fail)', 'post', '/categories', 
    { name: 'Should Fail' }, authToken);
  
  // Get single category
  if (createdCategoryId) {
    await testEndpoint('Get Category by ID', 'get', `/categories/${createdCategoryId}`);
  }
  
  // Update category (admin only)
  if (createdCategoryId) {
    await testEndpoint('Update Category (Admin)', 'put', `/categories/${createdCategoryId}`,
      { name: `Updated Category ${Date.now()}` }, adminToken);
  }
  
  // Try to delete non-existent category
  await testEndpoint('Delete Non-existent Category (Should Fail)', 'delete', '/categories/99999', null, adminToken);
}

async function testProducts() {
  console.log('\n📦 TESTING PRODUCTS\n' + '='.repeat(50));
  
  // Get all products (public)
  const products = await testEndpoint('Get All Products', 'get', '/products');
  
  // Get products with filters
  await testEndpoint('Get Products with Filters', 'get', 
    '/products?search=laptop&minPrice=10&maxPrice=1000&sortBy=price&order=desc');
  
  // Get single product (should fail - non-existent)
  await testEndpoint('Get Non-existent Product (Should Fail)', 'get', '/products/99999');
  
  // Create product (admin only)
  const newProduct = await testEndpoint('Create Product (Admin)', 'post', '/products',
    {
      name: `Test Product ${Date.now()}`,
      description: 'This is a test product',
      price: 99.99,
      categoryId: 1,
      stock: 50
    }, adminToken);
  
  if (newProduct && newProduct.id) {
    createdProductId = newProduct.id;
    await testEndpoint('Get Created Product', 'get', `/products/${createdProductId}`);
  }
  
  // Create product without auth (should fail)
  await testEndpoint('Create Product No Auth (Should Fail)', 'post', '/products',
    { name: 'Should Fail', price: 10, categoryId: 1 });
  
  // Create product as user (should fail)
  await testEndpoint('Create Product as User (Should Fail)', 'post', '/products',
    { name: 'Should Fail', price: 10, categoryId: 1 }, authToken);
  
  // Update product (admin only)
  if (createdProductId) {
    await testEndpoint('Update Product (Admin)', 'put', `/products/${createdProductId}`,
      { price: 89.99, stock: 45 }, adminToken);
  }
  
  // Create product with duplicate name (should fail)
  if (products && products[0]) {
    await testEndpoint('Create Duplicate Product (Should Fail)', 'post', '/products',
      {
        name: products[0].name,
        description: 'Duplicate',
        price: 10,
        categoryId: 1
      }, adminToken);
  }
}

async function testOrders() {
  console.log('\n🛒 TESTING ORDERS\n' + '='.repeat(50));
  
  // Get all orders (authenticated)
  const orders = await testEndpoint('Get All Orders', 'get', '/orders', null, authToken);
  
  // Create order
  const orderData = {
    items: [
      { productId: 1, quantity: 1 },
      { productId: 2, quantity: 2 }
    ]
  };
  
  const newOrder = await testEndpoint('Create Order', 'post', '/orders', orderData, authToken);
  
  if (newOrder && newOrder.id) {
    createdOrderId = newOrder.id;
    await testEndpoint('Get Created Order', 'get', `/orders/${createdOrderId}`, null, authToken);
  }
  
  // Create order with insufficient stock (should fail)
  await testEndpoint('Create Order with Large Quantity (Should Fail)', 'post', '/orders',
    { items: [{ productId: 1, quantity: 99999 }] }, authToken);
  
  // Create order with non-existent product (should fail)
  await testEndpoint('Create Order with Invalid Product (Should Fail)', 'post', '/orders',
    { items: [{ productId: 99999, quantity: 1 }] }, authToken);
  
  // Create order without items (should fail)
  await testEndpoint('Create Order Without Items (Should Fail)', 'post', '/orders',
    { items: [] }, authToken);
  
  // Update order status (admin only)
  if (createdOrderId) {
    await testEndpoint('Update Order Status (Admin)', 'put', `/orders/${createdOrderId}`,
      { status: 'COMPLETED' }, adminToken);
  }
  
  // Update order as user (should fail - cannot change status)
  if (createdOrderId) {
    await testEndpoint('Update Order as User (Should Fail)', 'put', `/orders/${createdOrderId}`,
      { status: 'CANCELLED' }, authToken);
  }
  
  // Get non-existent order
  await testEndpoint('Get Non-existent Order (Should Fail)', 'get', '/orders/99999', null, authToken);
}

async function testAuthorization() {
  console.log('\n🔒 TESTING AUTHORIZATION\n' + '='.repeat(50));
  
  // Try to delete product as user (should fail)
  if (createdProductId) {
    await testEndpoint('Delete Product as User (Should Fail)', 'delete', `/products/${createdProductId}`, null, authToken);
  }
  
  // Try to delete category as user (should fail)
  if (createdCategoryId) {
    await testEndpoint('Delete Category as User (Should Fail)', 'delete', `/categories/${createdCategoryId}`, null, authToken);
  }
  
  // Delete product as admin
  if (createdProductId) {
    await testEndpoint('Delete Product as Admin', 'delete', `/products/${createdProductId}`, null, adminToken);
    // Verify it's deleted
    await testEndpoint('Verify Product Deleted (Should Fail)', 'get', `/products/${createdProductId}`);
  }
  
  // Delete category as admin
  if (createdCategoryId) {
    await testEndpoint('Delete Category as Admin', 'delete', `/categories/${createdCategoryId}`, null, adminToken);
  }
  
  // Delete order as admin
  if (createdOrderId) {
    await testEndpoint('Delete Order as Admin', 'delete', `/orders/${createdOrderId}`, null, adminToken);
    await testEndpoint('Verify Order Deleted (Should Fail)', 'get', `/orders/${createdOrderId}`, null, authToken);
  }
}

async function testEdgeCases() {
  console.log('\n⚠️  TESTING EDGE CASES\n' + '='.repeat(50));
  
  // Test invalid ID formats
  await testEndpoint('Get Product with String ID', 'get', '/products/abc');
  await testEndpoint('Get Category with String ID', 'get', '/categories/abc');
  await testEndpoint('Get Order with String ID', 'get', '/orders/abc', null, authToken);
  
  // Test missing required fields
  await testEndpoint('Create Product Missing Price', 'post', '/products',
    { name: 'No Price', categoryId: 1 }, adminToken);
  
  await testEndpoint('Create Category Empty Name', 'post', '/categories',
    { name: '' }, adminToken);
  
  // Test invalid status update
  if (createdOrderId) {
    await testEndpoint('Update Order with Invalid Status', 'put', `/orders/${createdOrderId}`,
      { status: 'INVALID_STATUS' }, adminToken);
  }
  
  // Test accessing another user's order (if we have multiple users)
  // Create second user
  const secondUserEmail = `seconduser_${Date.now()}@example.com`;
  await testEndpoint('Create Second User', 'post', '/auth/signup', {
    email: secondUserEmail,
    password: 'Test123456'
  });
  
  const secondUserLogin = await testEndpoint('Login Second User', 'post', '/auth/login', {
    email: secondUserEmail,
    password: 'Test123456'
  });
  
  // Try to access first user's order with second user's token (should fail)
  if (secondUserLogin && secondUserLogin.accessToken && createdOrderId) {
    await testEndpoint('Access Another Users Order (Should Fail)', 'get', `/orders/${createdOrderId}`, 
      null, secondUserLogin.accessToken);
  }
}

async function runAllTests() {
  console.log('\n🚀 STARTING API TESTS\n' + '='.repeat(60));
  
  // First check if server is running
  try {
    await axios.get('http://localhost:3000/health');
  } catch (error) {
    console.log('\n❌ ERROR: Server is not running!');
    console.log('Please start your server first with: node src/server.js\n');
    process.exit(1);
  }
  
  await testHealthCheck();
  await testAuth();
  await testCategories();
  await testProducts();
  await testOrders();
  await testAuthorization();
  await testEdgeCases();
  
  console.log('\n✨ TESTING COMPLETED\n' + '='.repeat(60));
  console.log('\n📝 Summary:');
  console.log('   ✅ = Passed');
  console.log('   ❌ = Failed (Expected failures might be intentional)');
  console.log('\n💡 Note: Some failures are expected (authorization checks, validation errors)');
}

// Install axios first if not installed
console.log('\n📦 Make sure axios is installed: npm install axios\n');

runAllTests();