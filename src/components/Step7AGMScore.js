import React from "react";
import "../App.css";

export default function Step7AGMScore({
  assigned, scores, onScoreChange, onPrev, onNext
}) {
  return (
    <>
      <div className="step-header">
        <h3>7.5. 포볼 방식 스코어 입력</h3>
      </div>
      <div className="step-body score-table-wrapper">
        {Object.entries(assigned).map(([rIdx, arr]) => (
          <div key={rIdx} style={{ marginBottom: 12 }}>
            <h4>{+rIdx+1}번 방</h4>
            <div className="result-wrapper">
              <table className="result-table">
                <thead>
                  <tr><th>닉네임</th><th>스코어</th></tr>
                </thead>
                <tbody>
                  {arr.map(p => (
                    <tr key={p.nickname}>
                      <td>{p.nickname}</td>
                      <td>
                        <input
                          type="number"
                          value={scores[p.nickname] ?? 0}
                          onChange={e=>onScoreChange(p.nickname,+e.target.value)}
                          style={{ width:60, textAlign:"center" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
      <div className="step-footer">
        <button onClick={onPrev}>← 이전</button>
        <button onClick={onNext}>다음 →</button>
      </div>
    </>
  );
}
