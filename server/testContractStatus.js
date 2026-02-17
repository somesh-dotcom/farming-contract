const axios = require('axios');

async function testContractStatusChanges() {
  try {
    // Login as Test Buyer
    const loginRes = await axios.post('http://localhost:5004/api/auth/login', {
      email: 'buyer@test.com',
      password: 'buyer123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Logged in as Test Buyer');
    
    // Get contracts to see current status
    const contractsRes = await axios.get('http://localhost:5004/api/contracts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`\n📊 Buyer Contracts (${contractsRes.data.contracts.length} found):`);
    contractsRes.data.contracts.forEach(c => {
      console.log(`  - Contract: ${c.id.substring(0,8)}... Status: ${c.status}`);
      console.log(`    Product: ${c.product?.name}, Total Value: ₹${c.totalValue}`);
      console.log(`    Transactions: ${c.transactions?.length || 0}`);
      c.transactions?.forEach(t => {
        console.log(`      - Transaction: ${t.id.substring(0,8)}... Status: ${t.status}`);
      });
      console.log('---');
    });
    
    // Find a contract that is ACTIVE but has completed transactions to test status change
    const activeContract = contractsRes.data.contracts.find(c => 
      c.status === 'ACTIVE' && 
      c.transactions && 
      c.transactions.some(t => t.status === 'COMPLETED')
    );
    
    if (activeContract) {
      console.log(`\n🔍 Found ACTIVE contract with completed transactions: ${activeContract.id.substring(0,8)}...`);
      console.log(`   Product: ${activeContract.product?.name}, Status: ${activeContract.status}`);
      
      // Check if the contract status has been updated to COMPLETED now
      const contractDetails = await axios.get(`http://localhost:5004/api/contracts/${activeContract.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`   Updated Status: ${contractDetails.data.contract.status}`);
    } else {
      console.log('\n⚠️ No ACTIVE contracts with completed transactions found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testContractStatusChanges();