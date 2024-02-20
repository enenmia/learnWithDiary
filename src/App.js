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
  const [hoveredWord, setHoveredWord] = useState(null);
  const [learnedList, setLearnedList] = useState(new Set());

  

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
  
  useEffect(() => {
    setLearnedList(prevList => new Set([...prevList, ...youLearnedNewWords]));
  }, [youLearnedNewWords]); // 注意，这里的依赖项是 youLearnedNewWords
  

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
    <div className='main'>
      <div className='left'>
      <h2 className='websiteTtl'>Diary Dutch</h2>
      <div className='leftTop'>
      <textarea
      className='inputArea'
        value={originalText}
        onChange={(e) => setOriginalText(e.target.value)}
        placeholder="Type your original text here"
      />
      <div className='btn'>
      <button onClick={processText}>Process</button>
      </div>
      <div className='correct'>
      <p >{correctedText}</p>
      </div>
      </div>
    <div>
      <div className='glossary'>
  <h3>Glossary  &  meaning</h3>
  <ul>
    {Array.from(newWordsToday).map(word => (
      <li key={word}>{word} - {translations[word]}</li>
    ))}
  </ul>
  </div>
</div>
</div>
<div className='right'>
        <div>
          <h3 id="trytouse"className='righth3'>Try to Use These Words</h3>
          <ul id="tryuseul">
            {Array.from(tryToUseWords)
              .sort((a, b) => (3 - (knownWords[b] || 0)) - (3 - (knownWords[a] || 0)))
              .map(word => (
                <div key={word}
                  className="wordContainer"
                  onMouseEnter={() => setHoveredWord(word)}
                  onMouseLeave={() => setHoveredWord(null)}
                >
                  <Card key={word} word={word} count={3 - (knownWords[word] || 0)} />
                  {hoveredWord === word && <div className="translation">{translations[word]}</div>}
                </div>
              ))
            }
          </ul>
        </div>
        <div>
  <h3 id="learnedWord"className='righth3'>Words you've got{learnedList.length}</h3>
  <ul>
    {Array.from(learnedList).map(word => (
      <li className="wordContainer" id="learned"key={word}>{word}</li>
    ))}
  </ul>
</div>

      </div>
    

    </div>
  );
}
export default App;