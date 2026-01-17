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
        messages: [{
          role: 'user',
          content: `日経225先物の外資系証券の手口データを教えてください。

以下のJSON形式のみで返してください。マークダウンや説明は不要です。

{"foreignDaily":{"goldman":{"weeklyOI":-8000,"callSell":-600,"putSell":0,"comment":"売り継続"},"jpmorgan":{"weeklyOI":9000,"callSell":-10,"putSell":-100,"comment":"買い維持"},"nomura":{"weeklyOI":14000,"callSell":-80,"putSell":0,"comment":"強気継続"},"barclays":{"weeklyOI":8000,"callSell":-300,"putSell":-180,"comment":"買い"},"societe":{"weeklyOI":3000,"callSell":-90,"putSell":-50,"comment":"やや買い"},"abn":{"weeklyOI":900,"callSell":-800,"putSell":-110,"comment":"中立"}}}

上記のような形式で、最新のデータに更新して返してください。JSONのみ、他の文字は不要です。`
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
    
    // JSONを抽出（複数のパターンに対応）
    let parsed = null;
    
    // パターン1: そのままパース
    try {
      parsed = JSON.parse(textContent.trim());
    } catch (e) {
      // パターン2: ```json ... ``` から抽出
      const jsonBlockMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonBlockMatch) {
        try {
          parsed = JSON.parse(jsonBlockMatch[1].trim());
        } catch (e2) {}
      }
      
      // パターン3: { ... } を抽出
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
    
    // デバッグ用：生のレスポンスを返す
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
