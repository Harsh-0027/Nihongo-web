import React, { useState } from 'react';
import * as wanakana from 'wanakana';
import { MASTER_DATA } from './JapaneseData';
import './index.css';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('hiragana');
  const [selectedChar, setSelectedChar] = useState(null);

  // Quiz State
  const [quizItem, setQuizItem] = useState(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");

  const startQuiz = (mode) => {
    const pool = mode === 'all' 
      ? [...MASTER_DATA.hiragana, ...MASTER_DATA.katakana, ...MASTER_DATA.kanji] 
      : MASTER_DATA[mode];
    setQuizItem(pool[Math.floor(Math.random() * pool.length)]);
    setView('quiz');
  };

  const checkAnswer = (e) => {
    e.preventDefault();
    const isCorrect = input.toLowerCase().trim() === quizItem.romaji || 
                      wanakana.toKana(input) === quizItem.char;
    
    if (isCorrect) {
      setFeedback("✅ Correct!");
      setTimeout(() => {
        const pool = activeTab === 'all' 
          ? [...MASTER_DATA.hiragana, ...MASTER_DATA.katakana, ...MASTER_DATA.kanji] 
          : MASTER_DATA[activeTab];
        setQuizItem(pool[Math.floor(Math.random() * pool.length)]);
        setInput("");
        setFeedback("");
      }, 800);
    } else {
      setFeedback("❌ Try again");
    }
  };

  return (
    <div className="desktop-wrapper">
      {view === 'dashboard' ? (
        <div className="dashboard">
          <header className="main-header">
            <div>
              <h1 className="logo-text">NIHONGO DASH</h1>
              <p>Studying: {activeTab.toUpperCase()}</p>
            </div>
            <div className="header-buttons">
              <button className="start-quiz-btn" onClick={() => startQuiz(activeTab)}>
                QUIZ {activeTab.toUpperCase()}
              </button>
              <button className="master-quiz-btn" onClick={() => { setActiveTab('all'); startQuiz('all'); }}>
                MASTER QUIZ
              </button>
            </div>
          </header>

          <nav className="tab-nav">
            {['hiragana', 'katakana', 'kanji'].map(tab => (
              <button 
                key={tab} 
                className={`tab-link ${activeTab === tab ? 'active' : ''}`} 
                onClick={() => setActiveTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </nav>

          <main className="character-grid">
            {MASTER_DATA[activeTab === 'all' ? 'hiragana' : activeTab].map((item, i) => (
              <div key={i} className="modern-card" onClick={() => setSelectedChar({...item, type: activeTab})}>
                <span className="char-symbol">{item.char}</span>
                <span className="char-reading">{item.romaji}</span>
              </div>
            ))}
          </main>

{/* char data */}

        {selectedChar && (
  <div className="modal-overlay" onClick={() => setSelectedChar(null)}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <button className="close-btn" onClick={() => setSelectedChar(null)}>×</button>
      
      <div className="modal-body-split">
        {/* LEFT SIDE: Large Character & Stroke Order Image */}
        <div className="char-display-section">
          <div className="modal-char-large">{selectedChar.char}</div>
          
          <div className="stroke-order-image-container">
            <p className="small-label">STROKE ORDER</p>
            {/* This URL fetches the stroke order diagram automatically */}
            <img 
              src={`https://raw.githubusercontent.com/KanjiVG/KanjiVG/master/kanji/0${selectedChar.char.charCodeAt(0).toString(16)}.svg`}
              alt="Stroke Order"
              className="stroke-order-svg"
              onError={(e) => e.target.style.display = 'none'} 
            />
          </div>
        </div>

        {/* RIGHT SIDE: Meaning & Mnemonics */}
        <div className="modal-details">
          <span className="badge-tag">{selectedChar.type}</span>
          <h2>Reading: <span className="text-indigo">{selectedChar.romaji}</span></h2>
          
          {selectedChar.meaning && (
            <div className="meaning-highlight">
              <strong>MEANING:</strong> {selectedChar.meaning}
            </div>
          )}

          <div className="mnemonic-section">
            <h4>💡 Mnemonic:</h4>
            <p>{selectedChar.mnemonic || `Follow the strokes to write "${selectedChar.char}" correctly.`}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
{/*  */}
        </div>
      ) : (
        <div className="quiz-view">
          <button className="back-link" onClick={() => setView('dashboard')}>← EXIT</button>
          <div className="quiz-display">
            <div className="big-char">{quizItem?.char}</div>
            <form onSubmit={checkAnswer}>
              <input 
                autoFocus 
                className="modern-input" 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                placeholder="Type answer..." 
              />
              <div className="feedback-text">{feedback}</div>
              <button type="submit" className="submit-answer">VERIFY</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}