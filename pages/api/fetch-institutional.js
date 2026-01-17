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
        max_tokens: 4000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `以下のURLにアクセスして、外資系証券の手口データを取得してください：

1. https://nikkeiyosoku.com/teguchi/ （先物手口）
2. https://nikkeiyosoku.com/op_teguchi/ （オプション手口）

これらのページから、ゴールドマン・サックス、JPモルガン、野村證券、バークレイズ、ソシエテ・ジェネラル、ABNアムロの建玉データを読み取ってください。

読み取った実際の数値を使って、以下のJSON形式で返してください：

{"foreignDaily":{"goldman":{"weeklyOI":数値,"callSell":数値,"putSell":数値,"comment":"コメント"},"jpmorgan":{"weeklyOI":数値,"callSell":数値,"putSell":数値,"comment":"コメント"},"nomura":{"weeklyOI":数値,"callSell":数値,"putSell":数値,"comment":"コメント"},"barclays":{"weeklyOI":数値,"callSell":数値,"putSell":数値,"comment":"コメント"},"societe":{"weeklyOI":数値,"callSell":数値,"putSell":数値,"comment":"コメント"},"abn":{"weeklyOI":数値,"callSell":数値,"putSell":数値,"comment":"コメント"}}}

weeklyOI = 建玉の増減（買い越しならプラス、売り越しならマイナス）
callSell = コール売り枚数（売りならマイナス）
putSell = プット売り枚数（売りならマイナス）
comment = その会社の動向を短くコメント

必ず実際のデータを読み取って、JSONのみを返してください。`
        }]
      })
    });

    const result = await response.json();
    
    let textContent = '';
    if (result.content && Array.isArray(result.content)) {
      textContent = result.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('');
    }
    
    let parsed = null;
    
    try {
      parsed = JSON.parse(textContent.trim());
    } catch (e) {
      const jsonBlockMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonBlockMatch) {
        try {
          parsed = JSON.parse(jsonBlockMatch[1].trim());
        } catch (e2) {}
      }
      
      if (!parsed) {
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch (e3) {}
        }
      }
    }
    
    if (parsed && parsed.foreignDaily) {
      return res.status(200).json({ success: true, data: parsed });
    }
    
    return res.status(200).json({ 
      success: false, 
      error: 'Could not parse response',
      raw: textContent.substring(0, 1000)
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
