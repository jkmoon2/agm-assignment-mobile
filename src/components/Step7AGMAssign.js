import React, { useState } from "react";
import "../App.css";

export default function Step7AGMAssign({
  participants, roomCount, roomNames, assigned,
  onRoomSelect, onTeamSelect, onAutoAssignAGM,
  onClearAGM, onPrev, onNext
}) {
  const [selected, setSelected] = useState({});
  const toggle = i => setSelected(s => ({ ...s, [i]: !s[i] }));

  return (
    <>
      <div className="step-header">
        <h3>7. AGM 포볼 방배정</h3>
      </div>
      <div className="step-body">
        <div className="btn-group">
          <button onClick={onAutoAssignAGM}>자동배정</button>
          <button onClick={()=>{
            Object.keys(selected).forEach(i=>onRoomSelect(+i));
            setSelected({});
          }}>방선택</button>
          <button onClick={()=>{
            Object.keys(selected).forEach(i=>onTeamSelect(+i));
            setSelected({});
          }}>팀원선택</button>
          <button onClick={onClearAGM}>초기화</button>
        </div>
        <div className="participant-table">
          <div className="participant-row header">
            <div className="cell group">조</div>
            <div className="cell nickname">닉네임</div>
            <div className="cell handicap">G핸디</div>
            <div className="cell delete">선택</div>
          </div>
          {participants.map((p,i)=>(
            <div key={i} className="participant-row">
              <div className="cell group">{p.group}조</div>
              <div className="cell nickname">{p.nickname}</div>
              <div className="cell handicap">{p.handicap}</div>
              <div className="cell delete">
                <input
                  type="checkbox"
                  checked={!!selected[i]}
                  onChange={()=>toggle(i)}
                />
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
