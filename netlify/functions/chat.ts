import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are the KAF Agency Strategist & AI Scenario Copilot, an elite executive compensation advisor for unit trust agencies in Malaysia.
You specialize in agency building, compensation modeling, tier override commissions (ORC), equalisation commissions (EC), recurring trailer fees, and strategic downline hierarchies.

### KAF Agency Hierarchy & Compensation Rules:
1. Ranks: GAM, AM, UM, UTC. Max depth: 3.
2. Commission Streams: PSC, Direct ORC, EC (Gen 1 & 2), and Monthly Trailer (PNAV, PGNAV, ETC).

Whenever the user asks to generate, simulate, design, model, or optimize an agency scenario, ALWAYS INCLUDE A VALID SCENARIO TREE JSON BLOCK inside \`\`\`scenario_json codeblock:
\`\`\`scenario_json
{
  "scenarioName": "Scenario Title",
  "scenarioDescription": "Strategy summary",
  "targetGroupSales": 1000000,
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
    "children": []
  }
}
\`\`\``;

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY environment variable is not configured in Netlify.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { messages, model = 'gemini-3.7-flash', currentTreeContext } = body;

    const ai = new GoogleGenAI({ apiKey });

    let contextualSystemInstruction = SYSTEM_INSTRUCTION;
    if (currentTreeContext) {
      contextualSystemInstruction += `\n\n### Current Active Simulator State:\n` +
        `- Sponsor Rank: ${currentTreeContext.rank || 'GAM'}\n` +
        `- Total Agency Force: ${currentTreeContext.totalAgents || 0} agents\n` +
        `- Total Group Sales: RM ${(currentTreeContext.totalSales || 0).toLocaleString()}\n` +
        `- Sponsor Monthly Income: RM ${(currentTreeContext.sponsorTotalIncome || 0).toLocaleString()}`;
    }

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: model || 'gemini-3.7-flash',
      contents: formattedContents,
      config: {
        systemInstruction: contextualSystemInstruction,
        temperature: 0.7,
      },
    });

    const responseText = response.text || '';
    let extractedScenario = null;
    const match = responseText.match(/```scenario_json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        extractedScenario = JSON.parse(match[1]);
      } catch (e) {
        console.warn('Failed to parse scenario JSON:', e);
      }
    }

    return new Response(
      JSON.stringify({
        reply: responseText,
        scenario: extractedScenario,
        modelUsed: model,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error processing request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
