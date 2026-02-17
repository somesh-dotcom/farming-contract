const axios = require('axios');

async function testAdminContractStatusChanges() {
  try {
    // Login as Admin
    const adminLoginRes = await axios.post('http://localhost:5004/api/auth/login', {
      email: 'admin@contractfarming.com',
      password: 'admin123'
    });
    
    const adminToken = adminLoginRes.data.token;
    console.log('✅ Logged in as Admin');
    
    // Get all contracts to find one to test with
    const contractsRes = await axios.get('http://localhost:5004/api/contracts', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`\n📊 Found ${contractsRes.data.contracts.length} total contracts`);
    
    // Find a COMPLETED contract to change to PENDING
    const completedContract = contractsRes.data.contracts.find(c => c.status === 'COMPLETED');
    if (completedContract) {
      console.log(`\n🎯 Testing: Change COMPLETED → PENDING`);
      console.log(`   Contract: ${completedContract.id.substring(0,8)}...`);
      console.log(`   Current status: ${completedContract.status}`);
      
      try {
        const update1Res = await axios.patch(
          `http://localhost:5004/api/contracts/${completedContract.id}/status`,
          { status: 'PENDING' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log(`   ✅ Successfully changed to: ${update1Res.data.contract.status}`);
        
        // Change it back to COMPLETED
        const update2Res = await axios.patch(
          `http://localhost:5004/api/contracts/${completedContract.id}/status`,
          { status: 'COMPLETED' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log(`   ✅ Changed back to: ${update2Res.data.contract.status}`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.log('\n⚠️ No COMPLETED contracts found to test COMPLETED → PENDING');
    }
    
    // Find a PENDING contract to change to COMPLETED
    const pendingContract = contractsRes.data.contracts.find(c => c.status === 'PENDING');
    if (pendingContract) {
      console.log(`\n🎯 Testing: Change PENDING → COMPLETED`);
      console.log(`   Contract: ${pendingContract.id.substring(0,8)}...`);
      console.log(`   Current status: ${pendingContract.status}`);
      
      try {
        const update3Res = await axios.patch(
          `http://localhost:5004/api/contracts/${pendingContract.id}/status`,
          { status: 'COMPLETED' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log(`   ✅ Successfully changed to: ${update3Res.data.contract.status}`);
        
        // Change it back to PENDING
        const update4Res = await axios.patch(
          `http://localhost:5004/api/contracts/${pendingContract.id}/status`,
          { status: 'PENDING' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log(`   ✅ Changed back to: ${update4Res.data.contract.status}`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.log('\n⚠️ No PENDING contracts found to test PENDING → COMPLETED');
    }
    
    // Find an ACTIVE contract to change to COMPLETED (this would normally happen via transactions)
    const activeContract = contractsRes.data.contracts.find(c => c.status === 'ACTIVE');
    if (activeContract) {
      console.log(`\n🎯 Testing: Change ACTIVE → COMPLETED`);
      console.log(`   Contract: ${activeContract.id.substring(0,8)}...`);
      console.log(`   Current status: ${activeContract.status}`);
      
      try {
        const update5Res = await axios.patch(
          `http://localhost:5004/api/contracts/${activeContract.id}/status`,
          { status: 'COMPLETED' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log(`   ✅ Successfully changed to: ${update5Res.data.contract.status}`);
        
        // Change it back to ACTIVE
        const update6Res = await axios.patch(
          `http://localhost:5004/api/contracts/${activeContract.id}/status`,
          { status: 'ACTIVE' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log(`   ✅ Changed back to: ${update6Res.data.contract.status}`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.log('\n⚠️ No ACTIVE contracts found to test ACTIVE → COMPLETED');
    }
    
    console.log('\n🎉 Admin contract status change tests completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminContractStatusChanges();