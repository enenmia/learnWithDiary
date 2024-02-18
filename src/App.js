import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [originalText, setOriginalText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [newWordsToday, setNewWordsToday] = useState(new Set());
  const [tryToUseWords, setTryToUseWords] = useState(new Set());
  const [youLearnedNewWords, setYouLearnedNewWords] = useState(new Set());
  const [knownWords, setKnownWords] = useState({});
  const [wordCount, setWordCount] = useState({});

  useEffect(() => {
    // 在每次提交新文本后重置newWordsToday和youLearnedNewWords
    setNewWordsToday(new Set());
    setYouLearnedNewWords(new Set());
  }, [originalText]);

  const processText = async () => {
    // 发送请求到后端的代码...
    try {
      const response = await axios.post('http://localhost:3001/process-text', { text: originalText });
      const correctedText = response.data.correctedText;
      setCorrectedText(correctedText);
  

    const originalWords = originalText.toLowerCase().split(/\s+/).map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""));
    const modifiedWords = correctedText.toLowerCase().split(/\s+/).map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""));

    // 查找新增的单词
    const newWordsSet = new Set([...tryToUseWords]);
    modifiedWords.forEach(word => {
      if (!originalWords.includes(word) && !tryToUseWords.has(word)) {
        newWordsSet.add(word);
        newWordsToday.add(word);
      }
    });

    // 更新熟词列表
    // const knownWordsCount = { ...wordCount };
    // originalWords.forEach(word => {
    //   knownWordsCount[word] = (knownWordsCount[word] || 0) + 1;
    //   if (knownWordsCount[word] === 3) {
    //     setYouLearnedNewWords(new Set(youLearnedNewWords).add(word));
    //     newWordsSet.delete(word);
    //     setKnownWords(new Set(knownWords).add(word));
    //   }
    // });
    const knownWordsCount = { ...knownWords };
    modifiedWords.forEach(word => {
      if (!knownWordsCount[word]) {
        knownWordsCount[word] = 1;
      } else {
        knownWordsCount[word] += 1;
      }
      if (knownWordsCount[word] >= 3) {
        setYouLearnedNewWords(new Set([...youLearnedNewWords, word]));
      }
    });
    setKnownWords(knownWordsCount);
    setTryToUseWords(newWordsSet);


    setTryToUseWords(newWordsSet);
    setWordCount(knownWordsCount);
  }  catch (error) {
    console.error("Error processing text:", error);
  }
};


  return (
    <div>
      <h2>Language Learning Diary</h2>
      <textarea
        value={originalText}
        onChange={(e) => setOriginalText(e.target.value)}
        placeholder="Type your original text here"
      />
      <button onClick={processText}>Process Text</button>
      <div>
        <h3>Processed Text:</h3>
        <p>{correctedText}</p>
      </div>
      <div>
        <h3>New Words Today:</h3>
        <ul>
          {Array.from(newWordsToday).map(word => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Try to Use These Words:</h3>
        <ul>
          {Array.from(tryToUseWords).map(word => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>You Learned Something New:</h3>
        <ul>
          {Array.from(youLearnedNewWords).map(word => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
export default App;