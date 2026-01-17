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
          content: `nikkeiyosoku.com や kabutan.jp で「日経225先物 外資系 手口」を検索して、ゴールドマン、JPモルガン、野村、バークレイズ、ソシエテ、ABNアムロの建玉データを取得してください。

検索後、以下のJSON形式のみで返してください：

{"foreignDaily":{"goldman":{"weeklyOI":-8000,"callSell":-600,"putSell":0,"comment":"売り継続"},"jpmorgan":{"weeklyOI":9000,"callSell":-10,"putSell":-100,"comment":"買い維持"},"nomura":{"weeklyOI":14000,"callSell":-80,"putSell":0,"comment":"強気継続"},"barclays":{"weeklyOI":8000,"callSell":-300,"putSell":-180,"comment":"買い"},"societe":{"weeklyOI":3000,"callSell":-90,"putSell":-50,"comment":"やや買い"},"abn":{"weeklyOI":900,"callSell":-800,"putSell":-110,"comment":"中立"}}}

weeklyOI=週次建玉（買い越しは+、売り越しは-）
上記形式のJSONのみを返してください。説明文は不要です。`
        }]
      })
    });

    const result = await response.json();
    
    // レスポンスからテキストを抽出
    let textContent = '';
    if (result.content && Array.isArray(result.content)) {
      textContent = result.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('');
    }
    
    // JSONを抽出
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
      raw: textContent.substring(0, 500)
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
