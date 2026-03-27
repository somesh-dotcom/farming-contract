const fetch = require('node-fetch');

async function testEndpoint() {
  try {
    // First login to get a token
    const loginRes = await fetch('http://localhost:5004/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'buyer@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login response:', loginData);
    
    if (loginData.token) {
      // Now test the rejected requests endpoint
      const requestsRes = await fetch('http://localhost:5004/api/contract-requests?status=REJECTED', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      const requestsData = await requestsRes.json();
      console.log('Rejected requests:', requestsData);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testEndpoint();
