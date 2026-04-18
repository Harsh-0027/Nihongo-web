import React from 'react';

export default function DetailModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="modal-body">
          <div className="modal-char">{item.char}</div>
          <div className="modal-info">
            <span className="badge">{item.type}</span>
            <h2>Reading: <span className="highlight">{item.romaji}</span></h2>
            
            {item.meaning && (
              <div className="meaning-tag">MEANING: {item.meaning}</div>
              
            )}

            <div className="mnemonic-box">
              <strong>💡 Memory Aid:</strong>
              <p>{item.mnemonic || "Visual connection helps retention!"}</p>
            </div>

            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(item.char)}>
              Copy Character
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}