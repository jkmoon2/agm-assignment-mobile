import React, { useState } from "react";
import "../App.css";

export default function Step5StrokeAssign({
  participants,
  roomCount,
  roomNames,
  assigned,
  onManualAssign,
  onAutoAssign,
  onForceAssign,
  onClear,
  onPrev,
  onNext
}) {
  const [loadingIdx, setLoadingIdx]     = useState(null);
  const [forceIdx, setForceIdx]         = useState(null);
  const [selectedRoom, setSelectedRoom] = useState({});

  // 현재 배정된 닉네임 리스트
  const flatAssigned = () =>
    Object.values(assigned).flat().map(p => p.nickname);

  // 1) 수동 배정
  const handleManual = async i => {
    setLoadingIdx(i);
    await onManualAssign(i);
    setLoadingIdx(null);
  };

  // 2) 강제 배정: 토글 진입
  const startForce = i => {
    setForceIdx(i);
    setSelectedRoom(prev => ({ ...prev, [i]: "" }));
  };

  // 3) 강제 배정: 확인
  const confirmForce = async i => {
    const room = Number(selectedRoom[i]);
    if (isNaN(room)) {
      alert("방을 선택하세요");
      return;
    }
    await onForceAssign(i, room);
    setForceIdx(null);
  };

  return (
    <>
      {/* ─── 상단 타이틀 ─── */}
      <div className="step-header">
        <h3>5. 스트로크 방배정</h3>
      </div>

      {/* ─── 본문: 헤더 + 리스트 ─── */}
      <div className="step-body">
        {/* 헤더(컬럼 타이틀) */}
        <div className="participant-row header">
          <div className="cell group">조</div>
          <div className="cell nickname">닉네임</div>
          <div className="cell handicap">G핸디</div>
          <div className="cell manual">수동</div>
          <div className="cell force">강제</div>
        </div>

        {/* 스크롤 리스트 */}
        <div className="participant-table">
          {participants.map((p, i) => (
            <div key={i} className="participant-row">
              <div className="cell group">{p.group}조</div>
              <div className="cell nickname">{p.nickname}</div>
              <div className="cell handicap">{p.handicap}</div>

              {/* 수동 버튼 */}
              <div className="cell manual">
                <button
                  disabled={
                    loadingIdx === i ||
                    flatAssigned().includes(p.nickname)
                  }
                  onClick={() => handleManual(i)}
                >
                  수동
                </button>
              </div>

              {/* 강제 토글 + 확인 */}
              <div className="cell force">
                {forceIdx === i ? (
                  <>
                    <select
                      value={selectedRoom[i] || ""}
                      onChange={e =>
                        setSelectedRoom(prev => ({
                          ...prev,
                          [i]: e.target.value
                        }))
                      }
                    >
                      <option value="">방 선택</option>
                      {roomNames.map((name, idx) => (
                        <option key={idx} value={idx}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => confirmForce(i)}>
                      강제
                    </button>
                  </>
                ) : (
                  <button onClick={() => startForce(i)}>강제</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 하단 버튼 바 ─── */}
      <div className="step-footer btn-bar-bottom">
        <button className="nav-btn" onClick={onPrev}>← 이전</button>
        <button className="action-btn" onClick={onAutoAssign}>자동배정</button>
        <button className="action-btn" onClick={onClear}>초기화</button>
        <button className="nav-btn" onClick={onNext}>다음 →</button>
      </div>
    </>
  );
}
