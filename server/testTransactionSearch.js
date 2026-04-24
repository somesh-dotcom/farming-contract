const axios = require('axios');

async function testTransactionSearch() {
  try {
    // First login to get token
    const loginRes = await axios.post('http://localhost:5004/api/auth/login', {
      email: 'admin@contractfarming.com',
      password: 'admin@3900'
    });
    
    const token = loginRes.data.token;
    console.log('Login successful');
    
    // Get a sample contract ID to test search
    const contractsRes = await axios.get('http://localhost:5004/api/contracts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const sampleContractId = contractsRes.data.contracts[0]?.id;
    console.log('Sample contract ID:', sampleContractId);
    
    if (!sampleContractId) {
      console.log('No contracts found');
      return;
    }
    
    // Test search by contract ID (order ID)
    console.log('\n--- Testing search by Order ID ---');
    const searchRes = await axios.get(`http://localhost:5004/api/transactions?search=${sampleContractId.substring(0, 10)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`Found ${searchRes.data.transactions.length} transactions matching order ID`);
    searchRes.data.transactions.forEach(t => {
      console.log(`  - Transaction ID: ${t.id.substring(0, 8)}...`);
      console.log(`    Order ID: ${t.contractId.substring(0, 8)}...`);
      console.log(`    Product: ${t.contract?.product?.name}`);
      console.log('---');
    });
    
    // Test exact contract ID search
    console.log('\n--- Testing exact Order ID search ---');
    const exactSearchRes = await axios.get(`http://localhost:5004/api/transactions?search=${sampleContractId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`Found ${exactSearchRes.data.transactions.length} transactions matching exact order ID`);
    exactSearchRes.data.transactions.forEach(t => {
      console.log(`  - Transaction ID: ${t.id.substring(0, 8)}...`);
      console.log(`    Order ID: ${t.contractId.substring(0, 8)}...`);
      console.log(`    Product: ${t.contract?.product?.name}`);
      console.log(`    Status: ${t.status}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testTransactionSearch();