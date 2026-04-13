// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userMessage = req.body.message;

  // The Master System Prompt - This is where you put ALL your Arc/Circle knowledge
  const systemPrompt = `You are the ArcFlow Pro AI Agent, an expert developer assistant for the Arc blockchain, Circle, and Arbitrum.
  You must answer questions accurately, concisely, and in the language the user asks.
  
  CORE KNOWLEDGE:
  - Arc is a Layer 1 blockchain by Circle using USDC as native gas. Chain ID: 5042002. RPC: https://rpc.testnet.arc.network
  - Arbitrum Sepolia is an L2 used for cross-chain coordination via CCTP.
  - CCTP burns USDC on the source chain and mints natively on the destination.
  - USYC is a yield-bearing Treasury token requiring Circle KYC/Whitelisting on the Entitlements Contract.
  - Error 4902 / -32603: Wallet doesn't have the network. Prompt wallet_addEthereumChain.
  - UNPREDICTABLE_GAS_LIMIT: The DEX/Router lacks liquidity.
  - Arc House Points: Earned by real insights, posting code, and testing. Farming is discouraged.
  
  Format answers neatly using HTML tags like <b> and <br> for the frontend.`;

  try {
    // This securely calls OpenAI from Vercel's servers, hiding your key!
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Protected key
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Fast and cheap
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 300
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    
    res.status(200).json({ reply: reply, raw: reply });
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to AI Brain' });
  }
}
