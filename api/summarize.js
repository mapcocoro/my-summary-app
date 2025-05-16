import OpenAI from 'openai'; // OpenAIライブラリをインポート

export default async function handler(request, response) {
  // POSTメソッド以外でのリクエストは受け付けない
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  // 環境変数からOpenAI APIトークンを取得
  // Vercelの設定画面で OPENAI_API_KEY という名前で設定します
  const openaiApiKey = process.env.OPENAI_API_KEY;

  // APIキーが設定されていない場合はエラー
  if (!openaiApiKey) {
    console.error('OPENAI_API_KEY is not set.');
    return response.status(500).json({ message: 'サーバー設定エラー: OpenAI APIキーが設定されていません。' });
  }

  // OpenAIクライアントを初期化
  const openai = new OpenAI({
    apiKey: openaiApiKey, // 環境変数から取得したAPIキーを使用
  });

  try {
    // フロントエンドから送られてくるテキストを取得
    const { text } = request.body;

    // テキストが空の場合はエラーを返す
    if (!text) {
      return response.status(400).json({ message: '要約するテキストがありません。' });
    }

    console.log('Received text for summarization:', text);

    // OpenAI API (Chat Completions API) を呼び出してテキストを要約
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 使用するモデルを指定 (例: gpt-3.5-turbo)。必要に応じて他のモデルも選択可。
      messages: [
        // システムメッセージでAIに役割を与え、ユーザーメッセージで要約対象テキストを渡す
        {"role": "system", "content": "You are a helpful assistant that summarizes text concisely and accurately."},
        {"role": "user", "content": `以下のテキストを要約してください。\n\n${text}`},
      ],
      max_tokens: 150, // 生成される要約の最大トークン数。長さを調整したい場合は変更。
      temperature: 0.7, // 生成されるテキストのランダム性。0に近いほど安定した出力に。
    });

    // OpenAI APIからの応答から要約結果を抽出
    // 応答形式はChat Completions API の仕様に基づきます
    const summaryText = completion.choices[0].message.content;

    console.log('Summarization successful with OpenAI:', summaryText);

    // 要約結果をフロントエンドに返す
    response.status(200).json({ summary: summaryText }); // フロントエンドは { summary: "..." } の形式を期待している

  } catch (error) {
    console.error('OpenAI API Call Error:', error);
    // エラーの詳細をログに出力
    if (error.response) {
      console.error('OpenAI API Response Data:', error.response.data);
      console.error('OpenAI API Response Status:', error.response.status);
      console.error('OpenAI API Response Headers:', error.response.headers);
    }
    // フロントエンドにエラーを返す
    response.status(500).json({
      message: 'サーバー側でエラーが発生しました。OpenAI API呼び出し中に問題がありました。',
      error: error.message,
      // デバッグ用にOpenAIからのエラー詳細を含める（本番環境では非推奨の場合あり）
      // apiResponse: error.response ? error.response.data : null,
    });
  }
}