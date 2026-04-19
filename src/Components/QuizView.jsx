import React, { useState, useEffect, useRef } from 'react';
import * as wanakana from 'wanakana';
import { MASTER_DATA } from '../JapaneseData';

export default function QuizView({ mode, category, onExit }) {
  const [current, setCurrent] = useState(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState({ text: "", type: "" });
  const [pool, setPool] = useState([]);
  
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Initialize data pool with Category Filter
  useEffect(() => {
    let selectedPool = [];
    
    // Determine base mode
    if (mode === 'all') {
      selectedPool = [...MASTER_DATA.hiragana, ...MASTER_DATA.katakana, ...MASTER_DATA.kanji];
    } else {
      selectedPool = MASTER_DATA[mode] || [];
    }

    // Apply category filter (Exactly like Kanji logic)
    if (category && category !== 'All') {
      selectedPool = selectedPool.filter(item => item.category === category);
    }

    setPool(selectedPool);
    if (selectedPool.length > 0) {
      setCurrent(selectedPool[Math.floor(Math.random() * selectedPool.length)]);
    }
  }, [mode, category]);

  const nextQuestion = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback({ text: "", type: "" });
    setInput("");
    if (pool.length > 0) {
      const nextChar = pool[Math.floor(Math.random() * pool.length)];
      setCurrent(nextChar);
    }
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  // 2. Navigation Keys (Up/Down/Enter)
useEffect(() => {
  const handleKeyDown = (e) => {
    if (!isQuizMode) return;

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      // Force move to next
      if (quiz.idx < quiz.deck.length - 1) {
        setQuiz(p => ({ ...p, idx: p.idx + 1, feedback: null }));
        setUserInput('');
      } else {
        setIsQuizMode(false);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isQuizMode, quiz.idx, quiz.deck.length]);

  const checkAnswer = (e) => {
    if (e) e.preventDefault();
    if (feedback.type === 'success') return;

    const userVal = input.toLowerCase().trim();
    const isCorrect = 
      userVal === current?.romaji?.toLowerCase() || 
      wanakana.toKana(userVal) === current?.char;

    if (isCorrect) {
      setFeedback({ text: "Correct! 正解!", type: "success" });
      
      // AUTO-NEXT: 1000ms
      timerRef.current = setTimeout(() => {
        nextQuestion();
      }, 1000);
    } else {
      setFeedback({ text: "Try again!", type: "error" });
    }
  };

  if (!current) return <div className="quiz-view">No characters found for this category!</div>;

  return (
    <div className="quiz-view" onClick={() => inputRef.current?.focus()}>
      <div className="quiz-header">
        <button className="back-link" onClick={onExit}>← EXIT</button>
        <div className="mode-badge">
          {mode.toUpperCase()}: {category || 'ALL'}
        </div>
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
          {feedback.type === 'success' && (
            <div className="mnemonic-tip" style={{ fontSize: '0.9rem', color: '#666' }}>
              {current.mnemonic}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}