import OpenAI from 'openai'; // OpenAIライブラリをインポート

// Netlify Functions の標準的なエントリポイント
// event: リクエスト情報を含むオブジェクト
// context: 実行環境に関する情報を含むオブジェクト
export default async function handler(event, context) {
  // POSTメソッド以外でのリクエストは受け付けない
  if (event.httpMethod !== 'POST') {
    // Netlify Functions は { statusCode, body } 形式で応答を返します
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  // 環境変数からOpenAI APIトークンを取得
  // Netlifyの設定画面で OPENAI_API_KEY という名前で設定します
  const openaiApiKey = process.env.OPENAI_API_KEY;

  // APIキーが設定されていない場合はエラー
  if (!openaiApiKey) {
    console.error('OPENAI_API_KEY is not set.');
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'サーバー設定エラー: OpenAI APIキーが設定されていません。' }),
    };
  }

  // OpenAIクライアントを初期化
  const openai = new OpenAI({
    apiKey: openaiApiKey, // 環境変数から取得したAPIキーを使用
  });

  try {
    // フロントエンドから送られてくるテキストを取得
    // Netlify Functions の event.body は文字列の場合があるため、JSON.parseでパースします。
    const requestBody = JSON.parse(event.body);
    const { text } = requestBody;

    // テキストが空の場合はエラーを返す
    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: '要約するテキストがありません。' }),
      };
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
    const summaryText = completion.choices[0].message.content;

    console.log('Summarization successful with OpenAI:', summaryText);

    // 要約結果をフロントエンドに返す
    // Netlify Functions の標準的な応答形式で返します
    return {
      statusCode: 200,
      body: JSON.stringify({ summary: summaryText }), // フロントエンドは { summary: "..." } の形式を期待している
    };

  } catch (error) {
    // Netlifyのログにエラーの詳細を出力します
    console.error('OpenAI API Call Error:', error);
    // OpenAI APIからのエラー応答の詳細があればログ出力（デバッグ用）
    if (error.message) console.error('Error Message:', error.message);
    if (error.status) console.error('Error Status:', error.status); // エラーオブジェクトに直接statusがある場合
    if (error.code) console.error('Error Code:', error.code); // エラーオブジェクトに直接codeがある場合
    // OpenAIライブラリのエラーは error.response.data に詳細が含まれることがあります
    if (error.response && error.response.data) {
        console.error('OpenAI API Response Data (if available):', error.response.data);
    }

    // フロントエンドには一般的なエラーメッセージを返します
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'サーバー側でエラーが発生しました。要約できませんでした。',
        error: error.message || 'Unknown error', // エラーメッセージをフロントエンドに渡す
      }),
    };
  }
}
