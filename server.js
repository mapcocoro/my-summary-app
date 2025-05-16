// Express.js と CORS ライブラリをインポート
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai'; // OpenAIライブラリは既にインストール済み

// Expressアプリケーションのインスタンスを作成
const app = express();
// ポート番号を設定。Renderが提供する環境変数 PORT を使うか、デフォルトで5000番を使います。
const port = process.env.PORT || 5000;

// CORSミドルウェアを追加
// これにより、異なるドメイン（Netlify/Vercelのフロントエンド）からのリクエストを受け付けられるようになります。
// 必要に応じて、許可するオリジン（フロントエンドのドメイン）を制限することも可能です。
app.use(cors());

// JSON形式のリクエストボディをパースするためのミドルウェア
app.use(express.json());

// 環境変数からOpenAI APIトークンを取得
const openaiApiKey = process.env.OPENAI_API_KEY;

// アプリケーション起動時にAPIキーが設定されているか確認（必須ではありませんが推奨）
// 起動時にない場合はログに出すか、API呼び出し時にエラーとして処理します。
if (!openaiApiKey) {
  console.error('サーバー起動エラー: 環境変数 OPENAI_API_KEY が設定されていません。API呼び出しは機能しません。');
  // 本番環境では、キーがない場合は起動しないようにするなどの処理を入れることもあります。
}

// --- API エンドポイントの定義 ---

// テキスト要約を行うためのPOSTエンドポイント
// フロントエンドは、このサーバーの /summarize パスに対してPOSTリクエストを送ります。
app.post('/summarize', async (req, res) => {
  // OpenAI APIキーが設定されていない場合のエラーハンドリング（ここでもチェック）
  if (!openaiApiKey) {
      console.error('OpenAI API Key is not available during request.');
      return res.status(500).json({ message: 'サーバー設定エラー: OpenAI APIキーが設定されていません。' });
  }

  // OpenAIクライアントを初期化
  const openai = new OpenAI({
    apiKey: openaiApiKey, // 環境変数から取得したAPIキーを使用
  });


  try {
    // リクエストボディから要約対象のテキストを取得
    const { text } = req.body;

    // テキストが空の場合はエラーを返す
    if (!text) {
      return res.status(400).json({ message: '要約するテキストがありません。' });
    }

    console.log('Received text for summarization:', text);

    // --- OpenAI APIの呼び出し ---
    // Chat Completions API (gpt-3.5-turboなど) を使用
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 使用するモデルを指定
      messages: [
        {"role": "system", "content": "You are a helpful assistant that summarizes text concisely and accurately."},
        {"role": "user", "content": `以下のテキストを要約してください。\n\n${text}`},
      ],
      max_tokens: 150, // 生成される要約の最大トークン数
      temperature: 0.7, // 生成のランダム性
    });

    // 応答から要約結果を抽出
    const summaryText = completion.choices[0].message.content;

    console.log('Summarization successful with OpenAI:', summaryText);

    // --- 要約結果をフロントエンドに返す ---
    // 成功時はステータスコード200と、要約結果を含むJSONを返します。
    res.status(200).json({ summary: summaryText });

  } catch (error) {
    // --- エラーハンドリング ---
    console.error('OpenAI API Call Error:', error); // サーバー側ログにエラーの詳細を出力

    // OpenAI APIからのエラー応答の詳細があればログ出力（デバッグ用）
    if (error.message) console.error('Error Message:', error.message);
    // error.response は Fetch API の応答ではないため、OpenAIライブラリのエラー構造に合わせてログ出力
    // 例: error.response.data や error.status, error.code などがあるか確認し、ログ出力
    if (error.status) console.error('Error Status from OpenAI Error:', error.status);
    if (error.code) console.error('Error Code from OpenAI Error:', error.code);
     if (error.response && error.response.data) {
        console.error('OpenAI API Response Data (if available):', error.response.data);
    }


    // フロントエンドには一般的なエラーメッセージとステータスコード500を返します
    res.status(500).json({
      message: 'サーバー側でエラーが発生しました。要約できませんでした。',
      error: error.message || 'Unknown error', // エラーメッセージをフロントエンドに渡す
    });
  }
});

// --- サーバーの起動 ---
// 設定したポートでリクエストの待ち受けを開始します。
app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
  // アプリケーション起動後にAPIキーが設定されていない場合の警告
   if (!openaiApiKey) {
       console.warn('Warning: OPENAI_API_KEY is not set. OpenAI API calls will fail.');
   }
});
