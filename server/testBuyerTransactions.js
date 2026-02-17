const axios = require('axios');

async function testBuyerTransactions() {
  try {
    // Login as Test Buyer
    const loginRes = await axios.post('http://localhost:5004/api/auth/login', {
      email: 'buyer@test.com',
      password: 'buyer123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Logged in as Test Buyer');
    
    // Get transactions for buyer
    const transactionsRes = await axios.get('http://localhost:5004/api/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`\n📊 Buyer Transactions (${transactionsRes.data.transactions.length} found):`);
    transactionsRes.data.transactions.forEach(t => {
      console.log(`  - ID: ${t.id.substring(0,8)}... Status: ${t.status}`);
      console.log(`    Product: ${t.contract?.product?.name}`);
      console.log(`    Contract Buyer: ${t.contract?.buyer?.name}`);
      console.log(`    Contract Farmer: ${t.contract?.farmer?.name}`);
      console.log(`    Transaction User: ${t.userId === 'd58bb0c3-d269-4929-8246-654c4e8f97b3' ? 'YES (created by buyer)' : 'NO (created by farmer)'}`);
      console.log('---');
    });
    
    // Check completed transactions specifically
    const completedTransactions = transactionsRes.data.transactions.filter(t => t.status === 'COMPLETED');
    console.log(`\n✅ Completed Transactions: ${completedTransactions.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testBuyerTransactions();