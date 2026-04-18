import React, { useState, useMemo } from 'react';
import { MASTER_DATA } from './JapaneseData';
import './index.css';

export default function App() {
  // --- 1. THEME & NAVIGATION STATE ---
  // Initialized to true for Dark Mode by default
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
    feedback: null, // 'correct' or 'wrong'
    score: 0,
    streak: 0
  });
  const [userInput, setUserInput] = useState('');

  // Flatten Kanji for Search and Master Quiz
  const allKanji = useMemo(() => Object.values(MASTER_DATA.kanji).flat(), []);

  // --- 3. CORE LOGIC ---
  const startQuiz = (master = false) => {
    let deck = [];
    if (master) {
      deck = [...MASTER_DATA.hiragana, ...MASTER_DATA.katakana, ...allKanji];
    } else {
      deck = activeTab === 'kanji' ? MASTER_DATA.kanji[kanjiLevel] : MASTER_DATA[activeTab];
    }

    if (!deck || deck.length === 0) {
      alert("No data found for this selection!");
      return;
    }

    setQuiz({
      deck: [...deck].sort(() => 0.5 - Math.random()).slice(0, 10),
      idx: 0,
      feedback: null,
      score: 0,
      streak: 0
    });
    setIsQuizMode(true);
    setUserInput('');
  };

  const handleVerify = (e) => {
    if (e) e.preventDefault();
    const current = quiz.deck[quiz.idx];
    const correct = (current.romaji || "").toLowerCase().trim();
    const user = userInput.toLowerCase().trim();

    if (user === correct) {
      setQuiz(p => ({ ...p, feedback: 'correct', score: p.score + 10, streak: p.streak + 1 }));
    } else {
      setQuiz(p => ({ ...p, feedback: 'wrong', streak: 0 }));
    }
  };

  const handleNext = () => {
    if (quiz.idx < quiz.deck.length - 1) {
      setQuiz(p => ({ ...p, idx: p.idx + 1, feedback: null }));
      setUserInput('');
    } else {
      setIsQuizMode(false);
      alert(`Mastery Session Complete! Final Score: ${quiz.score}`);
    }
  };

  // Filtered List for Dashboard
  const displayList = (activeTab === 'kanji' ? (searchTerm ? allKanji : MASTER_DATA.kanji[kanjiLevel]) : MASTER_DATA[activeTab])
    .filter(i => 
      i.char.includes(searchTerm) || 
      i.romaji.includes(searchTerm.toLowerCase()) || 
      (i.meaning && i.meaning.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
      <div className="app-main-bg">
        <div className="desktop-wrapper">
          
          {/* HEADER */}
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

          {/* QUIZ MODE MODAL */}
          {isQuizMode && (
            <div className="modal-overlay">
              <div className={`quiz-container ${quiz.feedback}`}>
                <button className="close-btn" onClick={() => setIsQuizMode(false)}>×</button>
                
                <div className="quiz-info-header">
                  <span className="quiz-category-tag">
                    {activeTab.toUpperCase()} {activeTab === 'kanji' && !quiz.deck[0].level ? kanjiLevel.toUpperCase() : ''}
                  </span>
                  <span className="quiz-question-type">IDENTIFY THE READING</span>
                </div>

                <div className="quiz-stats">
                  <span>Question: <b>{quiz.idx + 1}/{quiz.deck.length}</b></span>
                  <span>Score: <b>{quiz.score}</b></span>
                  <span>Streak: 🔥<b>{quiz.streak}</b></span>
                </div>

                <div className="quiz-content">
                  <div className="quiz-char-large">{quiz.deck[quiz.idx]?.char}</div>
                  
                  <form onSubmit={handleVerify}>
                    <input 
                      key={quiz.idx}
                      autoFocus 
                      className="quiz-input-field" 
                      value={userInput} 
                      onChange={e => setUserInput(e.target.value)} 
                      placeholder="Type romaji..." 
                      disabled={!!quiz.feedback}
                    />
                    
                    {!quiz.feedback ? (
                      <button type="submit" className="verify-btn">VERIFY</button>
                    ) : (
                      <div className="feedback-area">
                        <p className={`status-text ${quiz.feedback}`}>
                          {quiz.feedback === 'correct' ? '✨ CORRECT' : `❌ WRONG (Answer: ${quiz.deck[quiz.idx].romaji})`}
                        </p>
                        <button type="button" className="verify-btn next" onClick={handleNext}>
                          NEXT QUESTION
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* DASHBOARD CONTENT */}
          {!isQuizMode && (
            <>
              <input 
                className="search-bar" 
                placeholder="Search character, reading, or meaning..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />

              <nav className="tab-nav">
                {['hiragana', 'katakana', 'kanji'].map(t => (
                  <button 
                    key={t} 
                    className={`tab-link ${activeTab === t ? 'active' : ''}`} 
                    onClick={() => {setActiveTab(t); setSearchTerm('');}}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </nav>

              {activeTab === 'kanji' && !searchTerm && (
                <div className="level-nav">
                  {['n5', 'n4', 'n3', 'n2', 'n1'].map(lvl => (
                    <button 
                      key={lvl} 
                      className={kanjiLevel === lvl ? 'active' : ''} 
                      onClick={() => setKanjiLevel(lvl)}
                    >
                      {lvl.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}

<main className="dashboard-content">
  {/* If searching, show a simple flat grid */}
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
    /* Grouping Logic for when NOT searching */
    Object.entries(
      (displayList || []).reduce((acc, item) => {
        // Fallback to 'General' if category is missing to prevent crash
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

            </>
          )}

          {/* CHARACTER MODAL (Split View) */}
          {selectedChar && (
            <div className="modal-overlay" onClick={() => setSelectedChar(null)}>
              <div className="modal-content-split" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={() => setSelectedChar(null)}>×</button>
                <div className="modal-left">
                  <div className="modal-char-huge">{selectedChar.char}</div>
                  <div className="stroke-order-container">
                    <span className="stroke-label">STROKE ORDER</span>
                    <img 
                      className="stroke-img-automated" 
                      src={`https://raw.githubusercontent.com/KanjiVG/KanjiVG/master/kanji/0${selectedChar.char.charCodeAt(0).toString(16)}.svg`} 
                      onError={e => e.target.style.display='none'} 
                      alt="stroke order"
                    />
                  </div>
                </div>
                <div className="modal-right">
                  <span className="badge-tag">{activeTab.toUpperCase()}</span>
                  <h2 className="modal-meaning">{selectedChar.meaning || selectedChar.romaji}</h2>
                  <div className="mnemonic-box">
                    <h4>💡 MNEMONIC</h4>
                    <p>{selectedChar.mnemonic || "No mnemonic data available."}</p>
                  </div>
                  <button className="action-btn" style={{marginTop:'20px', width: '100%'}} onClick={() => setSelectedChar(null)}>
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