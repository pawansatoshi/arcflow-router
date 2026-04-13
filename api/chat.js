export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const userMessage = req.body.message;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(401).json({ error: "Missing OPENAI_API_KEY in Vercel settings." });
  }

  const systemPrompt = `You are ArcAi, an expert developer assistant for the Arc blockchain, Circle, and Arbitrum.

  CORE TECHNICAL DATA:
  - Arc Testnet RPC: https://rpc.testnet.arc.network | Chain ID: 5042002 | WSS: wss://rpc.testnet.arc.network
  - Gas Token: USDC (Stable Fee Design ensures predictable costs, no volatile tokens).
  - Finality: Deterministic Finality (sub-350ms, no chain re-orgs).
  - Security: Native Post-Quantum Security & Opt-in Privacy.
  - EVM Compatibility: Full support for Solidity, Hardhat, Ethers.js.
  - Account Abstraction: Natively supported at the protocol level.

  ARCHITECTS PROGRAM & COMMUNITY:
  - Tiers: Discoverer, Builder, Architect, Elite.
  - Rules: High-signal contributions only. Spamming or farming points is strictly prohibited and results in bans.
  - Goals: Testing, providing technical feedback, building sample apps, and growing the ecosystem organically.

  AI AGENTS (ERC-8183):
  - Arc supports registering on-chain AI agents using the ERC-8183 standard (Compute Jobs).

  CIRCLE INFRASTRUCTURE:
  - App Kits: Use @circle-fin/app-kit for swaps instead of raw contracts.
  - CCTP: Cross-Chain Transfer Protocol bridges USDC natively without wrapped tokens.
  - USYC: Yield-bearing treasury token requiring strict Circle KYC whitelisting on the Entitlements Contract.

  ERRORS:
  - Error 4902 / -32603: Call wallet_addEthereumChain.
  - UNPREDICTABLE_GAS_LIMIT: Automated market maker lacks liquidity.
  - CALL_EXCEPTION: Check address, chain ID, or USDC allowance.

  Format answers cleanly using HTML tags like <b>, <code>, and <br>. Be concise, technical, and builder-focused.`;

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
    if (!response.ok) return res.status(response.status).json({ error: `OpenAI Error: ${data.error?.message || 'Unknown'}` });

    const reply = data.choices[0].message.content;
    res.status(200).json({ reply: reply, raw: reply });
  } catch (error) {
    res.status(500).json({ error: `Server Crash: ${error.message}` });
  }
}
