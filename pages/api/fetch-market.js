// pages/api/fetch-market.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `日経225先物の最新データを検索して、以下のJSON形式のみで返してください。説明は不要です。

{
  "futuresNight": 数値（日経225先物の最新値/夜間終値）,
  "cme": 数値（CME日経先物の最新値）,
  "usdjpy": 数値（ドル円レート）,
  "vix": 数値（VIX指数）,
  "nikkei225": 数値（日経平均株価）
}

数値のみ、カンマや円記号なしで返してください。`
        }]
      })
    });

    const result = await response.json();
    
    // レスポンスからテキストを抽出
    const textContent = result.content
      ?.filter(item => item.type === 'text')
      ?.map(item => item.text)
      ?.join('') || '';
    
    // JSONを抽出してパース
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return res.status(200).json({ success: true, data: parsed });
    }
    
    return res.status(200).json({ success: false, error: 'No data found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
