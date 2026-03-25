const axios = require('axios');

const API_URL = 'http://localhost:5004/api';

async function testCreateContractRequest() {
  try {
    console.log('=== Testing Contract Request Creation ===\n');

    // Step 1: Login as buyer
    console.log('1. Logging in as BUYER...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'buyer@test.com',
      password: 'password123'
    });

    const buyerToken = loginRes.data.token;
    const buyerId = loginRes.data.user.id;
    console.log('✓ Logged in as Buyer:', loginRes.data.user.name);
    console.log('  Token:', buyerToken.substring(0, 50) + '...\n');

    // Step 2: Get farmers
    console.log('2. Fetching FARMERS...');
    const farmersRes = await axios.get(`${API_URL}/users/by-role/FARMER`, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });

    if (farmersRes.data.users.length === 0) {
      console.log('❌ No farmers found! Please register a farmer first.');
      return;
    }

    const farmer = farmersRes.data.users[0];
    console.log('✓ Found Farmer:', farmer.name, '(', farmer.id, ')');

    // Step 3: Get products
    console.log('\n3. Fetching PRODUCTS...');
    const productsRes = await axios.get(`${API_URL}/products`);

    if (productsRes.data.products.length === 0) {
      console.log('❌ No products found! Please add products first.');
      return;
    }

    const product = productsRes.data.products[0];
    console.log('✓ Found Product:', product.name, '(', product.id, ')');

    // Step 4: Create contract request
    console.log('\n4. Creating CONTRACT REQUEST...');
    const requestData = {
      farmerId: farmer.id,
      productId: product.id,
      quantity: 100,
      unit: 'kg',
      proposedPrice: 25.5,
      startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      deliveryDate: new Date(Date.now() + 1209600000).toISOString(), // 14 days later
      location: 'Bangalore',
      area: 'Indiranagar',
      terms: 'Test contract request from automated test'
    };

    console.log('Request Data:', JSON.stringify(requestData, null, 2));

    const createRes = await axios.post(`${API_URL}/contract-requests`, requestData, {
      headers: { 
        Authorization: `Bearer ${buyerToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ SUCCESS! Contract request created!');
    console.log('Response:', JSON.stringify(createRes.data, null, 2));

    // Step 5: Verify request was created
    console.log('\n5. Verifying request creation...');
    const getRequestsRes = await axios.get(`${API_URL}/contract-requests`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
      params: { status: 'PENDING' }
    });

    const pendingRequests = getRequestsRes.data.requests;
    console.log(`✓ Found ${pendingRequests.length} pending request(s)`);
    
    const newRequest = pendingRequests.find(r => 
      r.farmerId === farmer.id && 
      r.productId === product.id
    );

    if (newRequest) {
      console.log('\n✅ VERIFIED! Request found in database:');
      console.log('  ID:', newRequest.id);
      console.log('  Status:', newRequest.status);
      console.log('  Buyer:', newRequest.buyer.name);
      console.log('  Farmer:', newRequest.farmer.name);
      console.log('  Product:', newRequest.product.name);
      console.log('  Quantity:', newRequest.quantity, newRequest.unit);
      console.log('  Price: ₹', newRequest.proposedPrice, '/', newRequest.unit);
      console.log('  Total Value: ₹', (newRequest.quantity * newRequest.proposedPrice).toLocaleString());
    } else {
      console.log('❌ Request not found in list!');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testCreateContractRequest();
