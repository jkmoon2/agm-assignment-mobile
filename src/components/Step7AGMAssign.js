import React, { useState } from "react";
import "../App.css";

export default function Step7AGMAssign({
  participants, roomCount, roomNames,
  onRoomSelect, onTeamSelect,
  onAutoAssignAGM, onClearAGM,
  onPrev, onNext
}) {
  const [loadingIdx, setLoadingIdx] = useState(null);
  const [clicked, setClicked] = useState({});

  const handleRoom = async (i) => {
    setLoadingIdx(i);
    await onRoomSelect(i);
    setClicked(c=>({ ...c, [i]:{ ...(c[i]||{}), room:true }}));
    setLoadingIdx(null);
  };
  const handleTeam = async (i) => {
    setLoadingIdx(i);
    await onTeamSelect(i);
    setClicked(c=>({ ...c, [i]:{ ...(c[i]||{}), team:true }}));
    setLoadingIdx(null);
  };

  return (
    <>
      <div className="step-header">
        <h3>7. AGM 포볼 방배정</h3>
      </div>
      <div className="step-body">
        <div className="btn-group">
          <button onClick={onAutoAssignAGM}>자동배정</button>
          <button onClick={onClearAGM}>초기화</button>
        </div>
        <div className="participant-table" style={{ flex:1 }}>
          {participants.map((p,i)=>(
            <div key={i} className="participant-row">
              <div className="cell group">{p.group}조</div>
              <div className="cell nickname">{p.nickname}</div>
              <div className="cell handicap">G핸디: {p.handicap}</div>
              <div className="cell delete">
                {p.group===1 && (
                  <>
                    <button
                      disabled={clicked[i]?.room}
                      onClick={()=>handleRoom(i)}
                    >
                      {loadingIdx===i && !clicked[i]?.room
                        ? "⏳"
                        : "방 선택"}
                    </button>
                    <button
                      disabled={!clicked[i]?.room || clicked[i]?.team}
                      onClick={()=>handleTeam(i)}
                    >
                      {loadingIdx===i && clicked[i]?.room && !clicked[i]?.team
                        ? "⏳"
                        : "팀원 선택"}
                    </button>
                  </>
                )}
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
