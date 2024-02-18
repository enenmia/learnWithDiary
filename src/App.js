import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './Card';
function App() {
  const [originalText, setOriginalText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [newWordsToday, setNewWordsToday] = useState(new Set());
  const [tryToUseWords, setTryToUseWords] = useState(new Set());
  const [youLearnedNewWords, setYouLearnedNewWords] = useState(new Set());
  const [knownWords, setKnownWords] = useState({});
  const [wordCount, setWordCount] = useState({});
  const [recentlyUpdatedWords, setRecentlyUpdatedWords] = useState(new Set());
  const [translations, setTranslations] = useState({});

  const getTranslation = async (word) => {
    try {
      const response = await axios.post('http://localhost:3001/translate', { text: word });
      return response.data.translatedText;
    } catch (error) {
      console.error("Error translating word:", error);
      return word; // 出错时返回原词
    }
  };

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
  
      const newWordsSet = new Set([...tryToUseWords]);
      const updatedWordsSet = new Set();
  
      modifiedWords.forEach(word => {
        if (!originalWords.includes(word)) {
          newWordsSet.add(word);
          newWordsToday.add(word);
        }
      });
  
      const knownWordsCount = { ...knownWords };
      originalWords.forEach(word => {
        if (!knownWordsCount[word]) {
          knownWordsCount[word] = 1;
        } else {
          if (knownWordsCount[word] < 3) {
            updatedWordsSet.add(word);
          }
          knownWordsCount[word] += 1;
        }
        if (knownWordsCount[word] >= 3) {
          setYouLearnedNewWords(new Set([...youLearnedNewWords, word]));
          newWordsSet.delete(word);
          updatedWordsSet.delete(word);
        }
      });
  
      setKnownWords(knownWordsCount);
      setTryToUseWords(newWordsSet);
      setRecentlyUpdatedWords(updatedWordsSet);

      const translationsPromises = Array.from(newWordsToday).map(word => getTranslation(word));
      const translationsResults = await Promise.all(translationsPromises);
    
      const newTranslations = {};
      translationsResults.forEach((translation, index) => {
        const word = Array.from(newWordsToday)[index];
        newTranslations[word] = translation;
      });
    
      setTranslations({...translations, ...newTranslations});
    } catch (error) {
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
      <li key={word}>{word} - {translations[word]}</li>
    ))}
  </ul>
</div>

      <div>
  <h3>Try to Use These Words:</h3>
  <ul>
  {Array.from(tryToUseWords)
    .sort((a, b) => (3 - (knownWords[b] || 0)) - (3 - (knownWords[a] || 0)))
    .map(word => (
      <Card key={word} word={word} count={3 - (knownWords[word] || 0)} />
    ))
  }
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