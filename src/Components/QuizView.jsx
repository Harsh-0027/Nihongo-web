import React, { useState, useEffect, useRef } from 'react';
import * as wanakana from 'wanakana';
import { MASTER_DATA } from '../JapaneseData';

export default function QuizView({ mode, onExit }) {
  const [current, setCurrent] = useState(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState({ text: "", type: "" });
  const [pool, setPool] = useState([]);
  
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Initialize data pool
  useEffect(() => {
    let selectedPool = [];
    if (mode === 'all') {
      selectedPool = [...MASTER_DATA.hiragana, ...MASTER_DATA.katakana, ...MASTER_DATA.kanji];
    } else {
      selectedPool = MASTER_DATA[mode] || [];
    }
    setPool(selectedPool);
    if (selectedPool.length > 0) {
      setCurrent(selectedPool[Math.floor(Math.random() * selectedPool.length)]);
    }
  }, [mode]);

  // 2. Navigation Function (Resets everything)
  const nextQuestion = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback({ text: "", type: "" });
    setInput("");
    if (pool.length > 0) {
      const nextChar = pool[Math.floor(Math.random() * pool.length)];
      setCurrent(nextChar);
    }
    // Small delay to ensure React finishes rendering before focusing
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  // 3. The "Master" Key Listener
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      // If Up or Down is pressed -> Instant Next
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextQuestion();
      }
      
      // If Enter is pressed AND we already have a correct answer -> Instant Next
      if (e.key === 'Enter' && feedback.type === 'success') {
        e.preventDefault();
        nextQuestion();
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [feedback, pool]); // Dependencies are crucial here

  // 4. Checking the Answer
  const checkAnswer = (e) => {
    if (e) e.preventDefault();
    
    // Safety: if already success, don't check again (handled by useEffect)
    if (feedback.type === 'success') return;

    const userVal = input.toLowerCase().trim();
    const isCorrect = 
      userVal === current?.romaji?.toLowerCase() || 
      wanakana.toKana(userVal) === current?.char;

    if (isCorrect) {
      setFeedback({ text: "Correct! 正解!", type: "success" });
      
      // AUTO-NEXT timer (1000ms)
      timerRef.current = setTimeout(() => {
        nextQuestion();
      }, 1000);
    } else {
      setFeedback({ text: "Try again! 頑張って!", type: "error" });
    }
  };

  if (!current) return <div className="quiz-view">Loading...</div>;

  return (
    <div className="quiz-view" onClick={() => inputRef.current?.focus()}>
      <div className="quiz-header">
        <button className="back-link" onClick={onExit}>
          ← STOP {mode.toUpperCase()} PRACTICE
        </button>
        <div className="mode-badge">MODE: {mode.toUpperCase()}</div>
      </div>
      
      <div className="quiz-display">
        <div className="big-char">{current.char}</div>
        
        <form onSubmit={checkAnswer}>
          <input 
            ref={inputRef}
            autoFocus 
            className={`modern-input ${feedback.type}`} 
            value={input} 
            onChange={e => setInput(e.target.value)}
            placeholder="Type answer..."
            autoComplete="off"
          />
          <div className={`feedback-text ${feedback.type}`}>
            {feedback.text}
          </div>
          
          <div className="controls-hint" style={{ marginTop: '15px', fontSize: '0.8rem', opacity: 0.5 }}>
            ENTER to check • UP/DOWN to skip
          </div>
        </form>
      </div>
    </div>
  );
}