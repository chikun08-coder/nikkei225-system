// pages/api/fetch-news.js
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
          content: `nikkei225jp.com/schedule/ と最新ニュースを検索して、今週〜来週の日経225先物に影響するイベントを教えてください。

【必ず含めるもの】
- 経済指標（GDP、CPI、雇用統計、PMIなど）
- 日銀金融政策決定会合・発表・総裁会見
- 米FOMC・FRB関連
- 中国重要指標
- 解散・選挙・政治イベント
- 地政学リスク（戦争、紛争、制裁など）
- 為替介入の可能性
- MSQ（メジャーSQ）・先物オプション清算日
- ETF分配金・配当落ち
- 大型IPO
- ダボス会議などの国際会議

以下のJSON形式のみで返してください。説明は不要です。

[
  {
    "date": "1/20",
    "day": "月",
    "events": [
      { "time": "11:00", "text": "中国GDP", "importance": "high", "flag": "🇨🇳" }
    ]
  }
]

importance: high（先物に大きく影響）, medium（影響あり）, low（軽微）
flag: 🇯🇵日本, 🇺🇸米国, 🇨🇳中国, 🇩🇪ドイツ, 🇬🇧英国, 🌍グローバル, ⚠️リスク
今日から1週間分のイベントを返してください。`
        }]
      })
    });

    const result = await response.json();
    
    const textContent = result.content
      ?.filter(item => item.type === 'text')
      ?.map(item => item.text)
      ?.join('') || '';
    
    const jsonMatch = textContent.match(/\[[\s\S]*\]/);
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
