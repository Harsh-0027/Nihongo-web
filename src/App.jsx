import React, { useState } from 'react';
import { MASTER_DATA } from './JapaneseData';
import './index.css';

export default function App() {
  // --- 1. THEME & TABS STATE ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('hiragana');
  const [selectedChar, setSelectedChar] = useState(null);
  
  // --- 2. QUIZ STATES ---
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizDeck, setQuizDeck] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // --- 3. QUIZ ENGINE ---
  const startQuiz = (master = false) => {
    const hData = MASTER_DATA?.hiragana || [];
    const kData = MASTER_DATA?.katakana || [];
    const kanjiData = MASTER_DATA?.kanji || [];

    let deck = [];
    if (master) {
      deck = [...hData, ...kData, ...kanjiData];
    } else {
      deck = MASTER_DATA[activeTab] || [];
    }

    if (deck.length === 0) {
      alert(`No data found for ${activeTab}. Check JapaneseData.js!`);
      return;
    }

    setQuizDeck([...deck].sort(() => 0.5 - Math.random()).slice(0, 10));
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setIsQuizMode(true);
    setUserInput('');
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    if (!quizDeck[currentIdx]) return;

    const current = quizDeck[currentIdx];
    const correct = (current.romaji || "").toLowerCase().trim();
    
    if (userInput.toLowerCase().trim() === correct) {
      setFeedback('correct');
      setScore(s => s + 10);
      setStreak(s => s + 1);
      setTimeout(() => {
        if (currentIdx < quizDeck.length - 1) {
          setCurrentIdx(prev => prev + 1);
          setUserInput('');
          setFeedback(null);
        } else {
          setIsQuizMode(false);
          alert(`Mastery Complete! Final Score: ${score + 10}`);
        }
      }, 600);
    } else {
      setFeedback('wrong');
      setStreak(0);
      setTimeout(() => setFeedback(null), 800);
    }
  };

  // --- 4. RENDER LOGIC ---
  return (
    <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
      {/* Main Background Wrapper 
          Ensure min-height: 100vh is set in CSS for .light-theme/.dark-theme 
      */}
      <div className="app-main-bg">
        <div className="desktop-wrapper">
          
          {/* HEADER */}
          <header className="main-header">
            <h1 className="logo-text">NIHONGO DASH</h1>
            <div className="header-actions">
              <button className="action-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? '☀️ LIGHT' : '🌙 DARK'}
              </button>
              <button className="action-btn" onClick={() => startQuiz(false)}>QUIZ</button>
              <button className="action-btn master" onClick={() => startQuiz(true)}>MASTER ALL</button>
            </div>
          </header>

          {/* QUIZ MODE MODAL */}
          {isQuizMode && (
            <div className="modal-overlay">
              <div className={`quiz-container ${feedback}`}>
                <button className="close-btn" onClick={() => setIsQuizMode(false)}>×</button>
                <div className="quiz-stats">
                  <span>Question: <b>{currentIdx + 1}/{quizDeck.length}</b></span>
                  <span>Score: <b>{score}</b></span>
                  <span>Streak: 🔥<b>{streak}</b></span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-fill" style={{width: `${((currentIdx + 1) / quizDeck.length) * 100}%`}}></div>
                </div>
                <div className="quiz-content">
                  <div className="quiz-char-large">{quizDeck[currentIdx]?.char}</div>
                  <p className="quiz-hint">What is the reading?</p>
                  <form onSubmit={handleQuizSubmit}>
                    <input 
                      key={currentIdx} // Auto-focus resets on new questions
                      autoFocus 
                      className="quiz-input-field" 
                      value={userInput} 
                      onChange={e => setUserInput(e.target.value)} 
                      placeholder="..." 
                    />
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* DASHBOARD CONTENT */}
          {!isQuizMode && (
            <>
              <nav className="tab-nav">
                {['hiragana', 'katakana', 'kanji'].map(t => (
                  <button 
                    key={t} 
                    className={`tab-link ${activeTab === t ? 'active' : ''}`} 
                    onClick={() => setActiveTab(t)}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </nav>

              <main className="character-grid">
                {(MASTER_DATA[activeTab] || []).map((item, i) => (
                  <div key={i} className="modern-card" onClick={() => setSelectedChar(item)}>
                    <span className="char-symbol">{item.char}</span>
                    <span className="char-reading">{item.romaji}</span>
                  </div>
                ))}
              </main>
            </>
          )}

          {/* CHARACTER MODAL (Split View) */}
          {selectedChar && (
            <div className="modal-overlay" onClick={() => setSelectedChar(null)}>
              <div className="modal-content-split" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={() => setSelectedChar(null)}>×</button>
                <div className="modal-left">
                  <div className="modal-char-huge">{selectedChar.char}</div>
                  <div className="stroke-label">STROKE ORDER</div>
                  <img 
                    className="stroke-img" 
                    src={`https://raw.githubusercontent.com/KanjiVG/KanjiVG/master/kanji/0${selectedChar.char.charCodeAt(0).toString(16)}.svg`} 
                    alt="stroke" 
                  />
                </div>
                <div className="modal-right">
                  <span className="badge-tag">{activeTab.toUpperCase()}</span>
                  <h2 className="modal-meaning">{selectedChar.meaning || selectedChar.romaji}</h2>
                  <div className="mnemonic-box">
                    <h4>💡 MNEMONIC</h4>
                    <p>{selectedChar.mnemonic || "No mnemonic data available."}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}