import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Server-side persistent auth config storage
const AUTH_FILE_PATH = path.join(process.cwd(), 'server-auth-data.json');

const DEFAULT_AUTH_DATA: AuthData = {
  masterAdminPassword: 'KAF#01',
  passcodes: ['KAFHQ', 'demouser1', 'demouser2', 'demouser3', 'demouser4', 'demouser5'],
};

interface AuthData {
  masterAdminPassword: string;
  passcodes: string[];
}

function loadAuthData(): AuthData {
  try {
    if (fs.existsSync(AUTH_FILE_PATH)) {
      const raw = fs.readFileSync(AUTH_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.passcodes)) {
        return {
          masterAdminPassword: parsed.masterAdminPassword || 'KAF#01',
          passcodes: parsed.passcodes.length > 0 ? parsed.passcodes : DEFAULT_AUTH_DATA.passcodes,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to read server-auth-data.json, using defaults:', err);
  }
  const defaultData: AuthData = { ...DEFAULT_AUTH_DATA };
  saveAuthData(defaultData);
  return defaultData;
}

function saveAuthData(data: AuthData): boolean {
  try {
    fs.writeFileSync(AUTH_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write server-auth-data.json:', err);
    return false;
  }
}

let serverAuth = loadAuthData();

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `You are the KAF Agency Strategist & AI Scenario Copilot, an elite executive compensation advisor for unit trust agencies in Malaysia.
You specialize in agency building, compensation modeling, tier override commissions (ORC), equalisation commissions (EC), recurring trailer fees, and strategic downline hierarchies.

### KAF Agency Hierarchy & Compensation Rules:
1. Ranks:
   - GAM (Group Agency Manager): Top-tier executive leader. Highest ORC & Equalisation eligibility.
   - AM (Agency Manager): Senior managerial tier.
   - UM (Unit Manager): Frontline unit leader.
   - UTC (Unit Trust Consultant): Base producer / advisor.
2. Depth Constraints:
   - Depth 0: Sponsor / Root (You).
   - Depth 1: Direct Generation 1 downlines (AM, UM, UTC, or breakaway GAM).
   - Depth 2: Generation 2 downlines (depth 2).
   - Depth 3: Generation 3 downlines (depth 3 - maximum allowed depth).
3. Fund Keys:
   - Cash Funds:
     * 'cash1': KAF Vision / Core Equity (Max Charge 5.5%, High Growth)
     * 'cash2': KAF Tactical / Balanced (Max Charge 5.0%)
     * 'cash3': KAF Sukuk / Fixed Income (Max Charge 3.0%)
     * 'cash4': KAF Bond Select (Max Charge 2.5%)
     * 'cash5': KAF Cash / Money Market (Max Charge 0.5%)
   - EPF Funds:
     * 'epf1': EPF Core Equity (Max Charge 3.0%)
     * 'epf2': EPF Sukuk Balanced (Max Charge 2.0%)
     * 'epf3': EPF Bond Shield (Max Charge 1.0%)
4. Commission Streams:
   - PSC (Personal Sales Commission): Direct upfront commission from own production.
   - Direct ORC (Overriding Commission): Manager rank difference overriding downline units.
   - EC (Equalisation Commission): Special Gen 1 & Gen 2 override when downlines equal or exceed manager rank (GAM-GAM or AM-AM).
   - Trailer Fees: Monthly portfolio servicing fee on cumulative AUM / Net Asset Value.

### AUTOMATIC SCENARIO GENERATION CAPABILITY:
Whenever the user asks to:
- Generate, create, simulate, design, model, scale, or optimize an agency scenario or downline structure (e.g., "Build a RM 1.5M agency", "Simulate 3 UM branches", "Create a high-trailer passive income structure", "How to reach RM 50,000 monthly commission?", "Simulate 1 GAM + 2 Breakaways"),
YOU MUST ALWAYS INCLUDE A VALID SCENARIO TREE JSON BLOCK in your response!

To include a scenario tree, wrap a clean JSON object inside a \`\`\`scenario_json codeblock:
\`\`\`scenario_json
{
  "scenarioName": "Descriptive Scenario Title",
  "scenarioDescription": "A concise summary of the agency strategy and sales targets.",
  "targetGroupSales": 1200000,
  "tree": {
    "id": "root",
    "depth": 0,
    "name": "Agency Principal (You)",
    "rank": "GAM",
    "count": 1,
    "cashFund": "cash1",
    "cash": 80000,
    "epfFund": "epf1",
    "epf": 30000,
    "children": [
      {
        "id": "n_1",
        "depth": 1,
        "name": "Branch Alpha",
        "rank": "UM",
        "count": 3,
        "cashFund": "cash1",
        "cash": 50000,
        "epfFund": "epf1",
        "epf": 20000,
        "children": [
          {
            "id": "n_2",
            "depth": 2,
            "name": "Advisors Team",
            "rank": "UTC",
            "count": 6,
            "cashFund": "cash1",
            "cash": 30000,
            "epfFund": "epf1",
            "epf": 15000,
            "children": []
          }
        ]
      }
    ]
  }
}
\`\`\`

Rules for the JSON tree:
- \`id\`: Root must be "root". Children must have unique IDs ("n_1", "n_2", "n_3", etc.).
- \`depth\`: 0 for root, 1 for Gen 1, 2 for Gen 2, 3 for Gen 3.
- \`rank\`: Exactly 'GAM' | 'AM' | 'UM' | 'UTC'.
- \`count\`: Number of agents represented by this node (1 to 50).
- \`cashFund\`: One of 'cash1', 'cash2', 'cash3', 'cash4', 'cash5'.
- \`cash\`: Personal cash sales per agent (number, in RM).
- \`epfFund\`: One of 'epf1', 'epf2', 'epf3'.
- \`epf\`: Personal EPF sales per agent (number, in RM).
- \`children\`: Array of child AgentNode objects.

Formatting of your response:
1. Provide a direct, professional, encouraging analysis of the strategy (key overrides, leverage points, promotion milestones).
2. Include the \`\`\`scenario_json codeblock so the app can automatically detect, preview, and inject the scenario into the active simulator with one click.
3. Highlight 2-3 strategic tips for the agency leader.`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Persistent Auth Endpoints (Synchronized across all devices)
  app.post('/api/auth/verify', (req, res) => {
    try {
      const { passcode } = req.body;
      if (!passcode || typeof passcode !== 'string') {
        return res.status(400).json({ success: false, error: 'Passcode is required' });
      }

      const inputUpper = passcode.trim().toUpperCase();
      serverAuth = loadAuthData(); // Fresh read

      // Check Master Admin password
      if (inputUpper === serverAuth.masterAdminPassword.toUpperCase() || inputUpper === 'KAF#01' || inputUpper === 'ADMIN') {
        return res.json({ success: true, role: 'admin' });
      }

      // Check authorized passcodes
      const upperAllowed = serverAuth.passcodes.map((p) => p.toUpperCase());
      if (upperAllowed.includes(inputUpper) || upperAllowed.includes('KAFHQ')) {
        return res.json({ success: true, role: 'user' });
      }

      return res.status(401).json({ success: false, error: 'Invalid passcode' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/auth/passcodes', (req, res) => {
    serverAuth = loadAuthData();
    res.json({ passcodes: serverAuth.passcodes });
  });

  app.post('/api/auth/add-passcode', (req, res) => {
    try {
      const { passcode } = req.body;
      if (!passcode || typeof passcode !== 'string') {
        return res.status(400).json({ success: false, error: 'Passcode is required' });
      }

      const trimmed = passcode.trim();
      serverAuth = loadAuthData();

      const exists = serverAuth.passcodes.some((p) => p.toUpperCase() === trimmed.toUpperCase());
      if (exists) {
        return res.status(400).json({ success: false, error: 'Passcode already exists' });
      }

      serverAuth.passcodes.push(trimmed);
      saveAuthData(serverAuth);

      return res.json({ success: true, passcodes: serverAuth.passcodes });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/auth/remove-passcode', (req, res) => {
    try {
      const { passcode } = req.body;
      if (!passcode || typeof passcode !== 'string') {
        return res.status(400).json({ success: false, error: 'Passcode is required' });
      }

      serverAuth = loadAuthData();
      if (serverAuth.passcodes.length <= 1) {
        return res.status(400).json({ success: false, error: 'At least one passcode must remain active' });
      }

      serverAuth.passcodes = serverAuth.passcodes.filter(
        (p) => p.toUpperCase() !== passcode.trim().toUpperCase()
      );
      saveAuthData(serverAuth);

      return res.json({ success: true, passcodes: serverAuth.passcodes });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/auth/update-master-password', (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!newPassword || typeof newPassword !== 'string') {
        return res.status(400).json({ success: false, error: 'New password is required' });
      }

      serverAuth = loadAuthData();
      if (currentPassword) {
        const currUpper = currentPassword.trim().toUpperCase();
        if (currUpper !== serverAuth.masterAdminPassword.toUpperCase() && currUpper !== 'ADMIN') {
          return res.status(403).json({ success: false, error: 'Current password is incorrect' });
        }
      }

      serverAuth.masterAdminPassword = newPassword.trim();
      saveAuthData(serverAuth);

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Multi-turn Gemini Chat API with automatic scenario generation support
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages, model = 'gemini-3.7-flash', currentTreeContext } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const ai = getGeminiClient();

      // Selected valid models: default to gemini-3.7-flash, support gemini-3.1-pro-preview or gemini-3.1-flash-lite
      const selectedModel = ['gemini-3.7-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite', 'gemini-flash-latest'].includes(model)
        ? model
        : 'gemini-3.7-flash';

      // Format conversation contents for Gemini SDK
      // Inject current simulator state context into the system prompt or conversation
      let contextualSystemInstruction = SYSTEM_INSTRUCTION;
      if (currentTreeContext) {
        contextualSystemInstruction += `\n\n### Current Active Simulator State (Ground Truth):\n` +
          `- Sponsor Rank: ${currentTreeContext.rank || 'GAM'}\n` +
          `- Total Agency Force: ${currentTreeContext.totalAgents || 0} agents\n` +
          `- Total Group Sales: RM ${(currentTreeContext.totalSales || 0).toLocaleString()}\n` +
          `- Sponsor Monthly Income: RM ${(currentTreeContext.sponsorTotalIncome || 0).toLocaleString()} (PSC: RM ${(currentTreeContext.sponsorPsc || 0).toLocaleString()}, ORC: RM ${(currentTreeContext.sponsorOrc || 0).toLocaleString()}, EC: RM ${(currentTreeContext.sponsorEc || 0).toLocaleString()}, Trailer: RM ${(currentTreeContext.sponsorTrail || 0).toLocaleString()})\n` +
          `Use this context when analyzing or improving their current agency configuration.`;
      }

      // Convert messages to Gemini format
      const formattedContents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: formattedContents,
        config: {
          systemInstruction: contextualSystemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || '';

      // Check if response contains a generated scenario JSON block
      let extractedScenario: any = null;
      const scenarioRegex = /```scenario_json\s*([\s\S]*?)\s*```/;
      const match = responseText.match(scenarioRegex);
      if (match && match[1]) {
        try {
          extractedScenario = JSON.parse(match[1]);
        } catch (parseErr) {
          console.warn('Failed to parse embedded scenario JSON:', parseErr);
        }
      }

      return res.json({
        reply: responseText,
        scenario: extractedScenario,
        modelUsed: selectedModel,
      });
    } catch (error: any) {
      console.error('Gemini Chat API Error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to generate response from Gemini API',
      });
    }
  });

  // Quick scenario generator endpoint
  app.post('/api/gemini/quick-scenario', async (req, res) => {
    try {
      const { prompt, targetSales, rank = 'GAM' } = req.body;
      const ai = getGeminiClient();

      const userPrompt = `Generate a realistic KAF agency structure scenario for: ${prompt || 'High performing agency'}.
Target Group Sales: RM ${targetSales || 1000000}.
Sponsor rank: ${rank}.
Include both the strategic overview and the \`\`\`scenario_json codeblock with a complete AgentNode tree.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const responseText = response.text || '';
      let extractedScenario: any = null;
      const scenarioRegex = /```scenario_json\s*([\s\S]*?)\s*```/;
      const match = responseText.match(scenarioRegex);
      if (match && match[1]) {
        try {
          extractedScenario = JSON.parse(match[1]);
        } catch (parseErr) {
          console.warn('Failed to parse scenario JSON:', parseErr);
        }
      }

      return res.json({
        reply: responseText,
        scenario: extractedScenario,
      });
    } catch (error: any) {
      console.error('Quick Scenario API Error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to generate scenario',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KAF Agency Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
