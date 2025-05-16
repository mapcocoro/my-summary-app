// Vercel Functions のエントリポイント
export default async function handler(request, response) {
    // POSTメソッド以外でのリクエストは受け付けない
    if (request.method !== 'POST') {
      return response.status(405).json({ message: 'Method Not Allowed' });
    }
  
    // 環境変数からHugging Face APIトークンを取得
    // この環境変数は後でVercelの設定画面で設定します
    const hfApiToken = process.env.HUGGING_FACE_API_TOKEN;
  
    // APIトークンが設定されていない場合はエラー
    if (!hfApiToken) {
      console.error('HUGGING_FACE_API_TOKEN is not set.');
      return response.status(500).json({ message: 'サーバー設定エラー: APIトークンが設定されていません。' });
    }
  
    // 使用するHugging FaceのモデルとAPIエンドポイントURL
    // summarization モデルの例: bart-large-cnn
    const modelId = "bart-large-cnn"; // 他の要約モデルを使いたい場合はここを変更
    const apiUrl = `https://api-inference.huggingface.co/models/${modelId}`;
  
    try {
      // フロントエンドから送られてくるテキストを取得
      const { text } = request.body;
  
      // テキストが空の場合はエラーを返す
      if (!text) {
        return response.status(400).json({ message: '要約するテキストがありません。' });
      }
  
      console.log('Received text for summarization:', text);
  
      // Hugging Face Inference API を呼び出す
      const hfResponse = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${hfApiToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: text,
          parameters: {
            // 要約に関するオプション（任意）。必要に応じて調整できます。
            // min_length: 30, // 要約の最小長さ
            // max_length: 150, // 要約の最大長さ
          }
        }),
      });
  
      // APIからの応答をJSONとして解析
      const result = await hfResponse.json();
  
      // Hugging Face APIからの応答形式を確認し、要約結果を抽出
      if (hfResponse.ok && result && result.length > 0 && result[0].summary_text) {
        const summaryText = result[0].summary_text;
        console.log('Summarization successful:', summaryText);
        // 要約結果をフロントエンドに返す
        response.status(200).json({ summary: summaryText });
      } else {
        // APIからの応答が期待する形式でない場合やエラーの場合
        console.error('Hugging Face API error or unexpected response:', result);
        response.status(hfResponse.status || 500).json({
          message: '要約APIからの応答に問題がありました。',
          details: result // APIからの応答詳細を含める
        });
      }
  
    } catch (error) {
      console.error('API Call Error:', error);
      response.status(500).json({ message: 'サーバー側でエラーが発生しました。', error: error.message });
    }
  }