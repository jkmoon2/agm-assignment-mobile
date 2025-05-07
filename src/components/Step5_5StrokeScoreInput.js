import React from "react";
import "../App.css";

export default function Step5_5StrokeScoreInput({
  assigned,
  scores,
  onScoreChange,
  onPrev,
  onNext
}) {
  return (
    <>
      {/* ─── 상단 타이틀 ─── */}
      <div className="step-header">
        <h3>5.5. 스코어 입력</h3>
      </div>

      {/* ─── 본문: 각 방 표 스크롤 ─── */}
      <div className="step-body score-table-wrapper">
        {Object.entries(assigned).map(([rIdx, arr]) => (
          <div key={rIdx} className="room-score-block">
            <h4 className="room-title">{+rIdx + 1}번 방</h4>
            <table className="score-table">
              <thead>
                <tr>
                  <th className="th-colored nickname-col">닉네임</th>
                  <th className="th-colored score-col">스코어</th>
                </tr>
              </thead>
              <tbody>
                {arr.map(p => (
                  <tr key={p.nickname}>
                    <td className="nickname-col">{p.nickname}</td>
                    <td className="score-col">
                      <input
                        type="number"
                        value={scores[p.nickname] ?? 0}
                        onChange={e =>
                          onScoreChange(p.nickname, +e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* ─── 하단 버튼 바 ─── */}
      <div className="step-footer btn-bar-bottom">
        <button className="nav-btn" onClick={onPrev}>← 이전</button>
        <button className="nav-btn" onClick={onNext}>다음 →</button>
      </div>
    </>
  );
}
