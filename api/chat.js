export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const userMessage = req.body.message;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(401).json({ error: "Missing GEMINI_API_KEY in Vercel settings." });
  }

  const systemPrompt = `You are ArcAi, an expert developer assistant for the Arc blockchain, Circle infrastructure, and Arbitrum.
  
  CORE TECHNICAL DATA:
  - Arc Testnet Chain ID: 5042002
  - Primary RPC: https://rpc.testnet.arc.network
  - Fallback RPC (Thirdweb): https://5042002.rpc.thirdweb.com
  - Faucet Limit: 20 testnet USDC every 2 hours via faucet.circle.com.
  
  CIRCLE APP KIT:
  - Do not use raw ethers.js contract calls for swaps/bridges on Arc. Use the Circle App Kit SDK (@circle-fin/app-kit).
  - Initialization requires a KIT_KEY from the Circle Console: \`const kit = new AppKit();\`
  - Swap command: \`await kit.swap({ from: {adapter, chain}, tokenIn, tokenOut, amountIn, config: { kitKey } })\`
  - Bridge command uses CCTP natively.
  
  Format answers using HTML tags like <b>, <code>, and <br>. Keep answers builder-focused and highly technical.`;

  try {
    // Calling Google Gemini 1.5 Flash (Fast and Free Tier Available)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: { text: systemPrompt } },
        contents: [{ parts: [{ text: userMessage }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: `Gemini Error: ${data.error?.message || 'Unknown'}` });
    }

    // Parse the Gemini response structure
    const reply = data.candidates[0].content.parts[0].text;
    
    // Convert markdown bold to HTML for your frontend
    const formattedReply = reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');

    res.status(200).json({ reply: formattedReply, raw: reply });
    
  } catch (error) {
    res.status(500).json({ error: `Server Crash: ${error.message}` });
  }
}
