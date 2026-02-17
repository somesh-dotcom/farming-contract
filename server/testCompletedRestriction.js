const axios = require('axios');

async function testCompletedContractRestriction() {
  try {
    // Login as Test Farmer (not admin)
    const loginRes = await axios.post('http://localhost:5004/api/auth/login', {
      email: 'farmer@test.com',
      password: 'farmer123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Logged in as Test Farmer');
    
    // Get a completed contract to try to update
    const contractsRes = await axios.get('http://localhost:5004/api/contracts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const completedContract = contractsRes.data.contracts.find(c => c.status === 'COMPLETED');
    
    if (completedContract) {
      console.log(`\n🎯 Testing update on completed contract: ${completedContract.id.substring(0,8)}...`);
      
      // Try to update the completed contract status (should fail)
      try {
        const updateRes = await axios.patch(
          `http://localhost:5004/api/contracts/${completedContract.id}/status`,
          { status: 'ACTIVE' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('❌ UNEXPECTED: Was able to update completed contract as non-admin');
      } catch (updateError) {
        if (updateError.response?.status === 403) {
          console.log('✅ CORRECT: Non-admin cannot update completed contract');
          console.log(`   Error: ${updateError.response.data.message}`);
        } else {
          console.log(`❓ Different error: ${updateError.response?.data?.message || updateError.message}`);
        }
      }
    } else {
      console.log('\n⚠️ No completed contracts found to test');
    }
    
    // Test that admin can update completed contracts
    console.log('\n🎯 Testing admin can update completed contracts...');
    
    // Login as Admin
    const adminLoginRes = await axios.post('http://localhost:5004/api/auth/login', {
      email: 'admin@contractfarming.com',
      password: 'admin123'
    });
    
    const adminToken = adminLoginRes.data.token;
    console.log('✅ Logged in as Admin');
    
    // Get a completed contract
    const adminContractsRes = await axios.get('http://localhost:5004/api/contracts', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const adminCompletedContract = adminContractsRes.data.contracts.find(c => c.status === 'COMPLETED');
    
    if (adminCompletedContract) {
      console.log(`\n🎯 Admin updating completed contract: ${adminCompletedContract.id.substring(0,8)}...`);
      
      // Admin should be able to update completed contract
      try {
        const adminUpdateRes = await axios.patch(
          `http://localhost:5004/api/contracts/${adminCompletedContract.id}/status`,
          { status: 'ACTIVE' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('✅ CORRECT: Admin can update completed contract');
        console.log(`   Updated status: ${adminUpdateRes.data.contract.status}`);
        
        // Reset it back to COMPLETED for testing
        await axios.patch(
          `http://localhost:5004/api/contracts/${adminCompletedContract.id}/status`,
          { status: 'COMPLETED' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('   Reset status back to COMPLETED');
        
      } catch (adminUpdateError) {
        console.log(`❌ Error updating as admin: ${adminUpdateError.response?.data?.message || adminUpdateError.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCompletedContractRestriction();