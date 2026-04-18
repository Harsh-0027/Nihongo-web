import React, { useState, useEffect } from 'react';
import * as wanakana from 'wanakana';
import { MASTER_DATA } from '../JapaneseData';

export default function QuizView({ mode, onExit }) {
  const [current, setCurrent] = useState(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState({ text: "", type: "" });
  const [pool, setPool] = useState([]);

  // Create the pool based on the mode selected in App.jsx
  useEffect(() => {
    let selectedPool = [];
    if (mode === 'all') {
      selectedPool = [...MASTER_DATA.hiragana, ...MASTER_DATA.katakana, ...MASTER_DATA.kanji];
    } else {
      selectedPool = MASTER_DATA[mode];
    }
    setPool(selectedPool);
    setCurrent(selectedPool[Math.floor(Math.random() * selectedPool.length)]);
  }, [mode]);

  const checkAnswer = (e) => {
    e.preventDefault();
    if (!current) return;

    const isCorrect = 
      input.toLowerCase().trim() === current.romaji.toLowerCase() || 
      wanakana.toKana(input) === current.char;

    if (isCorrect) {
      setFeedback({ text: "Correct! 正解!", type: "success" });
      setTimeout(() => {
        setFeedback({ text: "", type: "" });
        setInput("");
        setCurrent(pool[Math.floor(Math.random() * pool.length)]);
      }, 800);
    } else {
      setFeedback({ text: "Try again! 頑張って!", type: "error" });
    }
  };

  if (!current) return <div className="quiz-view">Loading...</div>;

  return (
    <div className="quiz-view">
      <div className="quiz-header">
        <button className="back-link" onClick={onExit}>← STOP {mode.toUpperCase()} PRACTICE</button>
        <div className="mode-badge">MODE: {mode.toUpperCase()}</div>
      </div>
      
      <div className="quiz-display">
        <div className="big-char">{current.char}</div>
        <form onSubmit={checkAnswer}>
          <input 
            autoFocus 
            className={`modern-input ${feedback.type}`} 
            value={input} 
            onChange={e => setInput(e.target.value)}
            placeholder="Type answer..."
          />
          <div className={`feedback-text ${feedback.type}`}>{feedback.text}</div>
          <button type="submit" className="submit-answer">VERIFY</button>
        </form>
      </div>
    </div>
  );
}