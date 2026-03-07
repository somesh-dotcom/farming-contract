/**
 * File-Based Database Demo
 * Demonstrates how to use JSON files as a database alternative
 */

const { dbFileManager } = require('./config/dbFileManager');

console.log('========================================');
console.log('FILE-BASED DATABASE DEMO');
console.log('========================================\n');

// Initialize data files
dbFileManager.initializeDataFiles();

// 1. Display statistics
console.log('1. Database Statistics (File-Based):');
console.log('----------------------------------------');
const stats = dbFileManager.getStats();
Object.entries(stats).forEach(([model, stat]) => {
  console.log(`${model.padEnd(15)}: ${stat.count} records`);
});
console.log('');

// 2. Create new users
console.log('2. Creating New Users:');
console.log('----------------------------------------');
const newUser = dbFileManager.create('users', {
  name: 'John Farmer',
  email: 'john@farmer.com',
  password: '$2b$10$HashedPassword123',
  role: 'FARMER',
  phone: '+919876543999',
  location: 'Bangalore'
});
console.log(`✓ Created user: ${newUser.name} (${newUser.email})`);
console.log(`  ID: ${newUser.id}`);
console.log('');

// 3. Find users
console.log('3. Finding Users:');
console.log('----------------------------------------');
const allUsers = dbFileManager.findMany('users');
console.log(`Total users: ${allUsers.length}`);
allUsers.forEach(user => {
  console.log(`  - ${user.name} (${user.role}) - ${user.email}`);
});
console.log('');

// 4. Find specific user
console.log('4. Find Specific User:');
console.log('----------------------------------------');
const adminUser = dbFileManager.findFirst('users', { role: 'ADMIN' });
if (adminUser) {
  console.log(`✓ Found admin: ${adminUser.name}`);
  console.log(`  Email: ${adminUser.email}`);
  console.log(`  Location: ${adminUser.location}`);
}
console.log('');

// 5. Update user
console.log('5. Updating User:');
console.log('----------------------------------------');
const updatedUser = dbFileManager.update(
  'users',
  { email: 'john@farmer.com' },
  { phone: '+919999999999' }
);
if (updatedUser) {
  console.log(`✓ Updated user phone: ${updatedUser.name}`);
  console.log(`  New phone: ${updatedUser.phone}`);
}
console.log('');

// 6. Load products
console.log('6. Working with Products:');
console.log('----------------------------------------');
const products = dbFileManager.findMany('products');
console.log(`Available products: ${products.length}`);
products.slice(0, 3).forEach(product => {
  console.log(`  - ${product.name} (${product.category}) - ${product.unit}`);
});
console.log('');

// 7. Load locations
console.log('7. Working with Locations:');
console.log('----------------------------------------');
const locations = dbFileManager.findMany('locations');
console.log(`Available locations: ${locations.length}`);
locations.slice(0, 3).forEach(loc => {
  console.log(`  - ${loc.area}, ${loc.city} - ${loc.pincode}`);
});
console.log('');

// 8. Create contract
console.log('8. Creating Contract:');
console.log('----------------------------------------');
const farmer = dbFileManager.findFirst('users', { role: 'FARMER' });
const buyer = dbFileManager.findFirst('users', { role: 'BUYER' });
const product = dbFileManager.findFirst('products', {});

if (farmer && buyer && product) {
  const contract = dbFileManager.create('contracts', {
    farmerId: farmer.id,
    buyerId: buyer.id,
    productId: product.id,
    quantity: 1000,
    pricePerUnit: 2500,
    totalPrice: 2500000,
    unit: 'kg',
    startDate: '2025-03-01',
    deliveryDate: '2025-04-01',
    location: 'Bangalore',
    area: 'Yeshwanthpur',
    status: 'PENDING'
  });
  console.log(`✓ Created contract: ${contract.id}`);
  console.log(`  Product: ${product.name}`);
  console.log(`  Quantity: ${contract.quantity} ${contract.unit}`);
  console.log(`  Total Price: ₹${contract.totalPrice.toLocaleString()}`);
}
console.log('');

// 9. Query contracts
console.log('9. Querying Contracts:');
console.log('----------------------------------------');
const allContracts = dbFileManager.findMany('contracts');
console.log(`Total contracts: ${allContracts.length}`);
allContracts.forEach(contract => {
  console.log(`  - ${contract.id}: ${contract.status} - ₹${contract.totalPrice.toLocaleString()}`);
});
console.log('');

// 10. Advanced queries
console.log('10. Advanced Queries:');
console.log('----------------------------------------');

// Find users by role
const farmers = dbFileManager.findMany('users', { role: 'FARMER' });
console.log(`Farmers: ${farmers.length}`);

// Find active contracts
const activeContracts = dbFileManager.findMany('contracts', { status: 'ACTIVE' });
console.log(`Active contracts: ${activeContracts.length}`);

// Find contracts in specific location
const bangaloreContracts = dbFileManager.findMany('contracts', { 
  location: 'Bangalore' 
});
console.log(`Bangalore contracts: ${bangaloreContracts.length}`);
console.log('');

// 11. Delete operation
console.log('11. Delete Operation:');
console.log('----------------------------------------');
const deletedUser = dbFileManager.delete('users', { email: 'john@farmer.com' });
if (deletedUser) {
  console.log(`✓ Deleted user: ${deletedUser.name}`);
}
console.log('');

// 12. Export/Import demo
console.log('12. Backup & Restore:');
console.log('----------------------------------------');
const backupPath = './config/backup_all_data.json';
dbFileManager.exportAll(backupPath);
console.log(`✓ All data exported to: ${backupPath}`);
console.log('  (You can import it back using dbFileManager.importAll())');
console.log('');

// 13. Usage example for routes
console.log('13. How to Use in Routes:');
console.log('----------------------------------------');
console.log(`
// In your route files (e.g., src/routes/users.ts):

const { dbFileManager } = require('../config/dbFileManager');

// GET /api/users - Get all users
export const getAllUsers = async (req, res) => {
  const users = dbFileManager.findMany('users');
  res.json(users);
};

// POST /api/users - Create user
export const createUser = async (req, res) => {
  const user = dbFileManager.create('users', req.body);
  res.json(user);
};

// PUT /api/users/:id - Update user
export const updateUser = async (req, res) => {
  const user = dbFileManager.update(
    'users',
    { id: req.params.id },
    req.body
  );
  res.json(user);
};

// DELETE /api/users/:id - Delete user
export const deleteUser = async (req, res) => {
  const user = dbFileManager.delete('users', { id: req.params.id });
  res.json(user);
};
`);
console.log('');

// Final statistics
console.log('========================================');
console.log('FINAL STATISTICS');
console.log('========================================');
const finalStats = dbFileManager.getStats();
Object.entries(finalStats).forEach(([model, stat]) => {
  console.log(`${model.padEnd(15)}: ${stat.count} records (file: ${stat.file.replace(__dirname + '/../', '')})`);
});
console.log('');

console.log('✅ File-Based Database Demo Complete!');
console.log('\nKey Benefits:');
console.log('  ✓ No database setup required');
console.log('  ✓ All data stored in JSON files');
console.log('  ✓ Easy to backup and restore');
console.log('  ✓ Simple to edit and manage');
console.log('  ✓ Version control friendly');
console.log('  ✓ Perfect for development/testing');
console.log('\nTo enable file-based database:');
console.log('  Set USE_FILE_DATABASE=true in your .env file');
