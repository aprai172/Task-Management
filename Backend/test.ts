import 'dotenv/config';

async function runTests() {
    const base = 'http://localhost:3000';
    let email = `test_${Date.now()}@example.com`;
    let password = 'password123';
    let accessToken = '';

    console.log('Testing Registration...');
    const regRes = await fetch(`${base}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const regBody = await regRes.json();
    console.log('Register Res:', regBody);

    if (!regBody.success) throw new Error('Registration failed');

    console.log('\nTesting Login...');
    const loginRes = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const loginBody = await loginRes.json();
    console.log('Login Res:', loginBody);
    accessToken = loginBody.accessToken;

    if (!loginBody.success) throw new Error('Login failed');

    console.log('\nTesting Create Task...');
    const tskRes = await fetch(`${base}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ title: 'Finish backend', description: 'Complete the Node and Prisma backend' })
    });
    const tskBody = await tskRes.json();
    console.log('Task Create Res:', tskBody);

    console.log('\nTesting Get Tasks...');
    const getRes = await fetch(`${base}/tasks`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const getBody = await getRes.json();
    console.log('Get Tasks Res:', getBody.data.length, 'tasks found.');
}

runTests().catch(console.error);
