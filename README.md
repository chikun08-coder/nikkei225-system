# 日経225先物ミニ システムトレード

Vercelにデプロイして使用するトレーディングダッシュボードです。

## 必要なもの

1. **Node.js** (v18以上)
2. **Anthropic API Key** (https://console.anthropic.com/ で取得)
3. **Vercelアカウント** (無料: https://vercel.com/)
4. **GitHubアカウント** (推奨)

---

## デプロイ手順

### Step 1: プロジェクトをローカルに準備

```bash
# フォルダをコピーして移動
cd nikkei225-vercel

# 依存関係をインストール
npm install

# ローカルで動作確認（オプション）
# まず .env.local を作成
cp .env.example .env.local
# .env.local を編集してAPIキーを入力
npm run dev
# http://localhost:3000 で確認
```

### Step 2: GitHubにプッシュ

```bash
# Gitリポジトリを初期化
git init
git add .
git commit -m "Initial commit"

# GitHubで新しいリポジトリを作成して、そのURLを使用
git remote add origin https://github.com/あなたのユーザー名/nikkei225-system.git
git push -u origin main
```

### Step 3: Vercelにデプロイ

1. https://vercel.com/ にログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリをインポート
4. **Environment Variables** に以下を追加:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-xxxxxxxxxxxxx` (あなたのAPIキー)
5. 「Deploy」をクリック

### Step 4: 完了！

デプロイが完了すると、URLが発行されます。
例: `https://nikkei225-system.vercel.app`

---

## 機能

| 機能 | 説明 |
|------|------|
| 🔄 最新データ取得 | 先物価格・CME・ドル円を自動取得 |
| 🏦 外資手口更新 | 外資系証券の建玉・オプション手口を取得 |
| 📅 ニュース更新 | 今週の経済イベントを取得 |
| 📈 トレード記録 | localStorage で永続保存 |
| 🔥 踏み上げ判定 | 11項目の詳細分析 |

---

## トラブルシューティング

### API呼び出しが失敗する場合

1. Vercelダッシュボードで環境変数が正しく設定されているか確認
2. APIキーが有効か確認（Anthropic Console）
3. APIの利用制限に達していないか確認

### データが保存されない場合

- localStorage はブラウザごとに保存されます
- シークレットモード（プライベートブラウズ）では保存されません

---

## ファイル構成

```
nikkei225-vercel/
├── pages/
│   ├── index.jsx              # メインアプリ
│   └── api/
│       ├── fetch-market.js    # 価格取得API
│       ├── fetch-institutional.js  # 外資手口API
│       └── fetch-news.js      # ニュースAPI
├── package.json
├── next.config.js
├── .env.example               # 環境変数サンプル
└── README.md
```

---

## 注意事項

- APIキーは絶対に公開しないでください
- Anthropic APIは従量課金です（web_searchを使用）
- 投資は自己責任で行ってください
