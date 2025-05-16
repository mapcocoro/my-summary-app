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
// ★ここにRenderサービスのURLを貼り付けてください
// 例: const RENDER_BACKEND_URL = 'https://my-summary-app-backend.render.com';
const RENDER_BACKEND_URL = 'https://my-summary-app.onrender.com'; // <-- このように修正
// 
  // 要約ボタンがクリックされたときの処理
  const handleSummarize = async () => {
    // 入力テキストが空の場合は何もしない、または警告を出す
    if (!inputText.trim()) {
      alert('要約するテキストを入力してください。');
      return;
    }

    // RenderサービスのURLが設定されているか確認
    if (RENDER_BACKEND_URL === 'YOUR_RENDER_SERVICE_URL_HERE' || !RENDER_BACKEND_URL) {
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
      setSummary(data.summary); // 要約結果をStateにセットして表示を更新

    } catch (error) {
      console.error('要約エラー:', error);
      // エラーメッセージをユーザーに表示
      setSummary(`要約中にエラーが発生しました: ${error.message}`);
    } finally {
      setLoading(false); // 要約処理終了フラグをオフ
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">テキスト要約ツール</h1>

      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        {/* テキスト入力エリア */}
        <textarea
          className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
          placeholder="ここに要約したいテキストを入力してください..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading} // 要約中は入力を無効化
        ></textarea>

        {/* 要約ボタン */}
        <button
          className={`w-full px-4 py-2 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          }`}
          onClick={handleSummarize}
          disabled={loading} // 要約中はボタンを無効化
        >
          {loading ? '要約中...' : '要約する'}
        </button>

        {/* 要約結果表示エリア */}
        {summary && ( // summaryが存在する場合のみ表示
          <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">要約結果:</h2>
            <p className="text-gray-800 whitespace-pre-wrap">{summary}</p> {/* whitespace-pre-wrap で改行を保持 */}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
