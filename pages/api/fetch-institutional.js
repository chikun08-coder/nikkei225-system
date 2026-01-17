// pages/api/fetch-institutional.js
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
        max_tokens: 2000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `nikkeiyosoku.com（投資の森）で日経225先物の外資系証券の手口データを検索してください。

以下のJSON形式のみで返してください。説明は不要です。

{
  "foreignDaily": {
    "goldman": { "weeklyOI": 数値, "todayVol": 数値, "callSell": 数値, "putSell": 数値, "comment": "コメント文字列" },
    "jpmorgan": { "weeklyOI": 数値, "todayVol": 数値, "callSell": 数値, "putSell": 数値, "comment": "コメント文字列" },
    "nomura": { "weeklyOI": 数値, "todayVol": 数値, "callSell": 数値, "putSell": 数値, "comment": "コメント文字列" },
    "barclays": { "weeklyOI": 数値, "todayVol": 数値, "callSell": 数値, "putSell": 数値, "comment": "コメント文字列" },
    "societe": { "weeklyOI": 数値, "todayVol": 数値, "callSell": 数値, "putSell": 数値, "comment": "コメント文字列" },
    "abn": { "weeklyOI": 数値, "todayVol": 数値, "callSell": 数値, "putSell": 数値, "comment": "コメント文字列" }
  },
  "optionData": {
    "callConcentration": [{ "strike": 数値, "oi": 数値 }],
    "putConcentration": [{ "strike": 数値, "oi": 数値 }],
    "atmIV": 数値
  }
}

weeklyOI=週次建玉（買い越しは+、売り越しは-）
todayVol=本日出来高
callSell/putSell=オプション売り枚数（売りは-）
comment=その証券会社の動向コメント
数値のみ、カンマなしで返してください。`
        }]
      })
    });

    const result = await response.json();
    
    const textContent = result.content
      ?.filter(item => item.type === 'text')
      ?.map(item => item.text)
      ?.join('') || '';
    
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
