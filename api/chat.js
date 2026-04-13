export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const userMessage = req.body.message;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(401).json({ error: "Missing OPENAI_API_KEY in Vercel settings." });
  }

  const systemPrompt = `You are ArcAi, an expert developer assistant for Arc, Circle, and Arbitrum.
  - Arc Testnet RPC: https://rpc.testnet.arc.network | Chain ID: 5042002
  - CCTP bridges USDC natively. 
  - USYC requires Circle KYC on Entitlements Contract.
  Format answers using HTML tags like <b> and <br>.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();

    // If OpenAI rejects the request (e.g., out of credits or bad key), send the exact error back
    if (!response.ok) {
      return res.status(response.status).json({ error: `OpenAI Error: ${data.error?.message || 'Unknown'}` });
    }

    const reply = data.choices[0].message.content;
    res.status(200).json({ reply: reply, raw: reply });
    
  } catch (error) {
    res.status(500).json({ error: `Server Crash: ${error.message}` });
  }
            }
