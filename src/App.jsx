import React, { useState } from 'react';
import './index.css'; // Tailwind CSS を読み込むために必要

function App() {
  // 入力されるテキストを管理するState
  const [inputText, setInputText] = useState('');
  // 要約結果を管理するState
  const [summary, setSummary] = useState('');
  // 要約中かどうかを示すState (処理中にボタンを無効化するためなど)
  const [loading, setLoading] = useState(false);

  // 要約ボタンがクリックされたときの処理 (この中身は後でVercel Functionsとの連携で作ります)

  const handleSummarize = async () => {
    // 入力テキストが空の場合は何もしない、または警告を出す
    if (!inputText.trim()) {
      alert('要約するテキストを入力してください。');
      return;
    }

    setLoading(true); // 要約処理開始フラグをオン
    setSummary(''); // 前回の要約結果をクリア

    try {
      // Netlify Functions の summarize エンドポイントを呼び出すパスに変更
      const response = await fetch('/.netlify/functions/summarize', { // ここを修正
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 入力テキストをリクエストのbodyに含めて送信
        body: JSON.stringify({ text: inputText }),
      });


      // 応答が正常でなかった場合のエラーハンドリング
      if (!response.ok) {
        const errorData = await response.json();
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