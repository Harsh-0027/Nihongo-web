import React, { useState, useMemo, useEffect } from 'react';
import { MASTER_DATA } from './JapaneseData';
import './index.css';

export default function App() {
  // --- 1. THEME & NAVIGATION STATE ---
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('hiragana');
  const [kanjiLevel, setKanjiLevel] = useState('n5');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChar, setSelectedChar] = useState(null);

  // --- 2. QUIZ STATES ---
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quiz, setQuiz] = useState({
    deck: [],
    idx: 0,
    feedback: null, 
    score: 0,
    streak: 0
  });
  const [userInput, setUserInput] = useState('');

  // Flatten Kanji for Search and Master Quiz
  const allKanji = useMemo(() => {
    if (!MASTER_DATA.kanji) return [];
    return Object.values(MASTER_DATA.kanji).flat();
  }, []);

  // --- 3. CORE LOGIC ---
  const startQuiz = (master = false) => {
    let sourcePool = [];
    if (master) {
      sourcePool = [...(MASTER_DATA.hiragana || []), ...(MASTER_DATA.katakana || []), ...allKanji];
    } else {
      sourcePool = activeTab === 'kanji' ? (MASTER_DATA.kanji[kanjiLevel] || []) : (MASTER_DATA[activeTab] || []);
    }

    if (!sourcePool || sourcePool.length === 0) {
      alert("No data found for this selection!");
      return;
    }

    setQuiz({
      deck: [...sourcePool].sort(() => 0.5 - Math.random()).slice(0, 10),
      idx: 0,
      feedback: null,
      score: 0,
      streak: 0
    });
    setIsQuizMode(true);
    setUserInput('');
  };

  const handleQuizSubmit = (e) => {
    if (e) e.preventDefault();
    if (quiz.feedback) {
      if (quiz.idx < quiz.deck.length - 1) {
        setQuiz(p => ({ ...p, idx: p.idx + 1, feedback: null }));
        setUserInput('');
      } else {
        setIsQuizMode(false);
        alert(`Mastery Session Complete! Final Score: ${quiz.score}`);
      }
      return;
    }

    const current = quiz.deck[quiz.idx];
    if (!current) return;
    const correct = (current.romaji || "").toLowerCase().trim();
    const user = userInput.toLowerCase().trim();

    if (user === correct) {
      setQuiz(p => ({ ...p, feedback: 'correct', score: p.score + 10, streak: p.streak + 1 }));
    } else {
      setQuiz(p => ({ ...p, feedback: 'wrong', streak: 0 }));
    }
  };

  useEffect(() => {
    const handleArrows = (e) => {
      if (isQuizMode && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        if (quiz.idx < quiz.deck.length - 1) {
          setQuiz(p => ({ ...p, idx: p.idx + 1, feedback: null }));
          setUserInput('');
        } else {
          setIsQuizMode(false);
        }
      }
    };
    window.addEventListener('keydown', handleArrows);
    return () => window.removeEventListener('keydown', handleArrows);
  }, [isQuizMode, quiz.idx, quiz.deck.length]);

  const displayList = useMemo(() => {
    let list = (activeTab === 'kanji' ? (searchTerm ? allKanji : (MASTER_DATA.kanji[kanjiLevel] || [])) : (MASTER_DATA[activeTab] || []));
    return list.filter(i => 
      i.char.includes(searchTerm) || 
      (i.romaji && i.romaji.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (i.meaning && i.meaning.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [activeTab, kanjiLevel, searchTerm, allKanji]);

  // Auto-advance logic (1000ms delay)
useEffect(() => {
  let timer;
  if (quiz.feedback === 'correct') {
    timer = setTimeout(() => {
      if (quiz.idx < quiz.deck.length - 1) {
        setQuiz(p => ({ ...p, idx: p.idx + 1, feedback: null }));
        setUserInput('');
      } else {
        setIsQuizMode(false);
        alert(`Mastery Session Complete! Final Score: ${quiz.score}`);
      }
    }, 1000); // Your 1000ms preference
  }

  return () => clearTimeout(timer); // Cleanup to prevent memory leaks or double-skipping
}, [quiz.feedback, quiz.idx, quiz.deck.length, quiz.score]);

  return (
    <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
      <div className="app-main-bg">
        <div className="desktop-wrapper">
          
          <header className="main-header">
            <h1 className="logo-text">NIHONGO DESU</h1>
            <div className="header-actions">
              <button className="action-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? '☀️ LIGHT' : '🌙 DARK'}
              </button>
              <button className="action-btn" onClick={() => startQuiz(false)}>QUIZ</button>
              <button className="action-btn master" onClick={() => startQuiz(true)}>MASTER ALL</button>
            </div>
          </header>

          {isQuizMode && quiz.deck[quiz.idx] && (
            <div className="modal-overlay">
              <div className={`quiz-container ${quiz.feedback}`}>
                <button className="close-btn" onClick={() => setIsQuizMode(false)}>×</button>
                <div className="quiz-info-header">
                  <span className="quiz-category-tag">{activeTab.toUpperCase()}</span>
                  <span className="quiz-question-type">IDENTIFY THE READING</span>
                </div>
                <div className="quiz-stats">
                  <span>Question: <b>{quiz.idx + 1}/{quiz.deck.length}</b></span>
                  <span>Score: <b>{quiz.score}</b></span>
                  <span>Streak: 🔥<b>{quiz.streak}</b></span>
                </div>
                <div className="quiz-content">
                  <div className="quiz-char-large">{quiz.deck[quiz.idx].char}</div>
                  <form onSubmit={handleQuizSubmit}>
                    <input 
                      key={quiz.idx}
                      autoFocus 
                      className="quiz-input-field" 
                      value={userInput} 
                      onChange={e => setUserInput(e.target.value)} 
                      placeholder="Type romaji..." 
                      autoComplete="off"
                    />
                    {!quiz.feedback ? (
                      <button type="submit" className="verify-btn">VERIFY</button>
                    ) : (
                      <div className="feedback-area">
                        <p className={`status-text ${quiz.feedback}`}>
                          {quiz.feedback === 'correct' ? '✨ CORRECT' : `❌ WRONG (Answer: ${quiz.deck[quiz.idx].romaji})`}
                        </p>
                        <button type="submit" className="verify-btn next">NEXT QUESTION (ENTER)</button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}

          {!isQuizMode && (
            <div className="dashboard-layout">
              <div className="dashboard-main-area">
                <input 
                  className="search-bar" 
                  placeholder="Search character, reading, or meaning..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />

                <nav className="tab-nav">
  {['hiragana', 'katakana', 'kanji', 'vocabulary'].map(t => (
    <button 
      key={t} 
      className={`tab-link ${activeTab === t ? 'active' : ''}`} 
      onClick={() => {
        setActiveTab(t); 
        setSearchTerm('');
        setKanjiLevel(t === 'kanji' ? 'N5' : 'Basic');
      }}
    >
      {t.toUpperCase()}
    </button>
  ))}
</nav>

                {activeTab === 'kanji' && !searchTerm && (
                  <div className="level-nav">
                    {['n5', 'n4', 'n3', 'n2', 'n1'].map(lvl => (
                      <button key={lvl} className={kanjiLevel === lvl ? 'active' : ''} onClick={() => setKanjiLevel(lvl)}>
                        {lvl.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}

                <main className="dashboard-content">
                  {searchTerm ? (
                    <div className="character-grid">
                      {displayList.length > 0 ? (
                        displayList.map((item, i) => (
                          <div key={i} className="modern-card" onClick={() => setSelectedChar(item)}>
                            <span className="char-symbol">{item.char}</span>
                            <span className="char-reading">{item.romaji}</span>
                          </div>
                        ))
                      ) : (
                        <p className="no-results">No characters found for "{searchTerm}"</p>
                      )}
                    </div>
                  ) : (
                    Object.entries(
                      displayList.reduce((acc, item) => {
                        const cat = item.category || "General";
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(item);
                        return acc;
                      }, {})
                    ).map(([category, items]) => (
                      <section key={category} className="category-section">
                        <h3 className="section-title">{category.toUpperCase()}</h3>
                        <div className="character-grid">
                          {items.map((item, i) => (
                            <div key={i} className="modern-card" onClick={() => setSelectedChar(item)}>
                              <span className="char-symbol">{item.char}</span>
                              <span className="char-reading">{item.romaji}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))
                  )}
                </main>
              </div>

              <aside className="dashboard-sidebar">
                <div className="sidebar-widget">
                  <h4>DAILY PROGRESS</h4>
                  <div className="sidebar-progress-bar"><div className="sidebar-progress-fill" style={{width: '45%'}}></div></div>
                  <p>9 / 20 mastered</p>
                </div>
                <div className="sidebar-widget">
                  <h4>QUICK STATS</h4>
                  <div className="stat-row"><span>🔥 Streak:</span> <b>5 Days</b></div>
                  <div className="stat-row"><span>🎯 Accuracy:</span> <b>88%</b></div>
                </div>
              </aside>
            </div>
          )}

{selectedChar && (
  <div className="modal-overlay" onClick={() => setSelectedChar(null)}>
    <div className="modal-content-split animate-in" onClick={e => e.stopPropagation()}>
      <button className="close-btn" onClick={() => setSelectedChar(null)}>×</button>
      
      {/* LEFT SIDE: Visuals */}
      <div className="modal-left">
        <div className="char-stage">
          <div className={`modal-char-huge ${activeTab === 'vocabulary' ? 'vocab-text' : ''}`}>
            {selectedChar.char}
          </div>
          <div className="char-shadow"></div>
        </div>
        

        
        {activeTab !== 'vocabulary' && (
          <div className="stroke-order-panel">
            <div className="stroke-header">
              <span className="dot"></span>
              <p className="stroke-title">STROKE ORDER</p>
              <span className="dot"></span>
            </div>
            <div className="stroke-frame">
  <img 
    key={selectedChar.char} // This is the "magic" line that fixes the jump
    src={`https://raw.githubusercontent.com/KanjiVG/KanjiVG/master/kanji/0${selectedChar.char.charCodeAt(0).toString(16)}.svg`} 
    onError={e => e.target.style.display='none'} 
    alt="stroke order"
  />
</div>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: Information */}
      <div className="modal-right">
        <div className="tag">{activeTab.toUpperCase()}</div>
        <h2 className="modal-meaning">{selectedChar.meaning || selectedChar.romaji}</h2>
        
        <div className="mnemonic-section">
          <h4>💡 HOW TO REMEMBER</h4>
          <p className="mnemonic-text">
            {selectedChar.mnemonic || "Visualizing the shape helps memory..."}
          </p>
        </div>

        <button className="close-details-btn" onClick={() => setSelectedChar(null)}>
          CLOSE DETAILS
        </button>
      </div>
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
}