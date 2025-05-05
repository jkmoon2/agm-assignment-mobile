import React, { useState } from "react";
import "../App.css";

export default function Step5StrokeAssign({
  participants, roomCount, roomNames,
  onAssignOne, onAutoAssign, onClearStroke,
  onPrev, onNext
}) {
  const [loadingIdx, setLoadingIdx] = useState(null);

  const handleAssign = async (i) => {
    setLoadingIdx(i);
    await onAssignOne(i);
    setLoadingIdx(null);
  };

  return (
    <>
      <div className="step-header">
        <h3>5. 스트로크 방배정</h3>
      </div>
      <div className="step-body">
        <div className="btn-group">
          <button onClick={onAutoAssign}>자동배정</button>
          <button onClick={onClearStroke}>초기화</button>
        </div>
        <div className="participant-table" style={{ flex:1 }}>
          {participants.map((p,i)=>(
            <div key={i} className="participant-row">
              <div className="cell group">{p.group}조</div>
              <div className="cell nickname">{p.nickname}</div>
              <div className="cell handicap">G핸디: {p.handicap}</div>
              <div className="cell delete">
                <button
                  disabled={loadingIdx===i}
                  onClick={()=>handleAssign(i)}
                >
                  {loadingIdx===i ? "⏳ 배정 중..." : "방배정"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="step-footer">
        <button onClick={onPrev}>← 이전</button>
        <button onClick={onNext}>다음 →</button>
      </div>
    </>
  );
}
