const { GoogleAuth } = require('google-auth-library');
const serviceAccount = require('./serviceAccount.json');

async function testAuth() {
    try {
        const auth = new GoogleAuth({
            credentials: serviceAccount,
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        const client = await auth.getClient();
        const res = await client.getAccessToken();
        console.log('✅ OAuth Token obtained successfully! Token length:', res.token.length);

        // Test Vertex AI Gemini endpoint
        const projectId = serviceAccount.project_id;
        const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent`;
        const fetchRes = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${res.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'Hello, respond with "Gemini Vertex AI is active!"' }] }]
            })
        });

        if (fetchRes.ok) {
            const json = await fetchRes.json();
            console.log('✨ Vertex AI Response:', json.candidates[0].content.parts[0].text);
        } else {
            console.log('Vertex AI status:', fetchRes.status, await fetchRes.text());
        }
    } catch (e) {
        console.error('Auth test error:', e);
    }
}

testAuth();
