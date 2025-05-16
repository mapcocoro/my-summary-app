import React, { useState } from 'react';
import './index.css'; // Tailwind CSS を読み込むために必要

function App() {
  // 入力されるテキストを管理するState
  const [inputText, setInputText] = useState('');
  // 要約結果を管理するState
  const [summary, setSummary] = useState('');
  // 要約中かどうかを示すState (処理中にボタンを無効化するためなど)
  const [loading, setLoading] = useState(false);

  // RenderでデプロイしたバックエンドAPIのURL
  // ここにあなたのRenderサービスのURLを貼り付けます
  const RENDER_BACKEND_URL = 'https://my-summary-app.onrender.com'; // ★あなたのRenderサービスのURLに置き換えてください

  // 要約ボタンがクリックされたときの処理
  const handleSummarize = async () => {
    // 入力テキストが空の場合は何もしない、または警告を出す
    if (!inputText.trim()) {
      alert('要約するテキストを入力してください。');
      return;
    }

    // RenderサービスのURLが正しく設定されているか確認
    if (!RENDER_BACKEND_URL || RENDER_BACKEND_URL === 'YOUR_RENDER_SERVICE_URL_HERE') {
        alert('RenderサービスのURLが設定されていません。src/App.jsx を確認してください。');
        console.error('Render backend URL is not set in src/App.jsx');
        return;
    }


    setLoading(true); // 要約処理開始フラグをオン
    setSummary(''); // 前回の要約結果をクリア

    try {
      // RenderでデプロイしたバックエンドAPIの /summarize エンドポイントを呼び出す
      // RenderサービスのURLと /summarize パスを結合します。
      const response = await fetch(`${RENDER_BACKEND_URL}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // CORSが有効になっていれば、Originヘッダーは自動的にブラウザが付加します。
        },
        // 入力テキストをリクエストのbodyに含めて送信
        body: JSON.stringify({ text: inputText }),
      });

      // 応答が正常でなかった場合のエラーハンドリング
      if (!response.ok) {
        // バックエンドからエラー応答（JSON形式を期待）
        const errorData = await response.json();
        // バックエンドから返されたエラーメッセージがあればそれを使用
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // 応答から要約結果を取得
      const data = await response.json();
      const summaryText = data.summary;

      console.log('Summarization successful with OpenAI:', summaryText);

      // 要約結果をStateにセットして表示を更新
      setSummary(summaryText);

    } catch (error) {
      console.error('要約エラー:', error);
      // エラーメッセージをユーザーに表示
      setSummary(`要約中にエラーが発生しました: ${error.message}`);
    } finally {
      setLoading(false); // 要約処理終了フラグをオフ
    }
  };

  return (
    // 背景色を淡いピンクに変更し、全体的に丸みを持たせる
    <div className="min-h-screen bg-pink-50 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        {/* メインタイトル */}
        <h1 className="text-4xl sm:text-5xl font-bold text-pink-700 mb-2">
          きゅっ！と　まとめnote
        </h1>
        {/* サブタイトル */}
        <p className="text-lg sm:text-xl text-gray-700">
          言いたいことがまとまる！伝わる！
        </p>
      </div>

      {/* コンテナのデザインを調整 */}
      <div className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        {/* テキスト入力エリア */}
        <textarea
          className="w-full h-40 p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 mb-4 resize-none text-gray-800 placeholder-gray-400"
          placeholder="ここに要約したいテキストを入力してください..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading} // 要約中は入力を無効化
          style={{ fontFamily: 'Arial, sans-serif' }} // フォントを調整したい場合はここを変更
        ></textarea>

        {/* 要約ボタン */}
        <button
          className={`w-full px-4 py-3 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ease-in-out
            ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-pink-500 hover:bg-pink-600 focus:ring-pink-400'
            }
          `}
          onClick={handleSummarize}
          disabled={loading} // 要約中はボタンを無効化
        >
          {loading ? '要約中...' : '要約する'}
        </button>

        {/* 要約結果表示エリア */}
        {summary && ( // summaryが存在する場合のみ表示
          <div className="mt-6 p-4 sm:p-6 bg-pink-100 rounded-lg border border-pink-200 shadow-inner">
            <h2 className="text-xl font-semibold text-pink-700 mb-3">要約結果:</h2>
            <p className="text-gray-800 whitespace-pre-wrap" style={{ fontFamily: 'Arial, sans-serif' }}>{summary}</p> {/* whitespace-pre-wrap で改行を保持 */}
          </div>
        )}
      </div>
       {/* フッターなどを追加する場合はここ */}
    </div>
  );
}

export default App;

