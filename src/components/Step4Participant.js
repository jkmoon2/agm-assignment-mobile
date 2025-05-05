// src/components/Step4_Participant.js
import React from "react";
import "../App.css";

export default function Step4Participant({
  step,
  setStep,
  mode,                // ← 받아오기
  uploadMethod,
  participants,
  setParticipants,
  roomCount,
  roomNames,
  handleFile
}) {
  // 선택 토글
  const toggleSelect = i => {
    const copy = [...participants];
    copy[i].selected = !copy[i].selected;
    setParticipants(copy);
  };
  // 추가 / 삭제
  const addParticipant = () =>
    setParticipants(p => [
      ...p,
      { group: 1, nickname: "", handicap: 0, selected: false }
    ]);
  const delSelected = () =>
    setParticipants(p => p.filter(x => !x.selected));

  return (
    <>
      {/* 헤더 */}
      <div className="step-header">
        <h3>{step}. 참가자 데이터 입력</h3>
      </div>

      {/* 본문 */}
      <div className="step-body">
        {/* ──────────── 상단 고정 영역 ──────────── */}
        <div className={`excel-header ${uploadMethod === "manual" ? "manual" : "auto"}`}>
          {/* auto 모드일 때만 파일 입력 노출 */}
          {uploadMethod === "auto" && (
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile}
            />
          )}
          {/* manual 이든 auto 이든 항상 보여 줌 */}
          <span className="total">총 슬롯: {roomCount * 4}명</span>
        </div>

        {/* ──────────── 리스트 (스크롤) 영역 ──────────── */}
        <div className="participant-table">
          {/* 헤더 행 */}
          <div className="participant-row header">
            <div className="cell group">조</div>
            <div className="cell nickname">닉네임</div>
            <div className="cell handicap">G핸디</div>
            <div className="cell delete">선택</div>
          </div>

          {/* 데이터 행 */}
          {participants.map((p, i) => (
            <div key={i} className="participant-row">
              <div className="cell group">
                <select
                  value={p.group}
                  onChange={e => {
                    const c = [...participants];
                    c[i].group = Number(e.target.value);
                    setParticipants(c);
                  }}
                >
                  {roomNames.map((_, idx) => (
                    <option key={idx} value={idx + 1}>
                      {idx + 1}조
                    </option>
                  ))}
                </select>
              </div>
              <div className="cell nickname">
                <input
                  type="text"
                  placeholder="닉네임"
                  value={p.nickname}
                  onChange={e => {
                    const c = [...participants];
                    c[i].nickname = e.target.value;
                    setParticipants(c);
                  }}
                />
              </div>
              <div className="cell handicap">
                <input
                  type="number"
                  value={p.handicap}
                  onChange={e => {
                    const c = [...participants];
                    c[i].handicap = Number(e.target.value);
                    setParticipants(c);
                  }}
                />
              </div>
              <div className="cell delete">
                <input
                  type="checkbox"
                  checked={p.selected}
                  onChange={() => toggleSelect(i)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 푸터 */}
      <div className="step-footer">
        <button onClick={() => setStep(3)}>← 이전</button>
        <button onClick={addParticipant}>추가</button>
        <button onClick={delSelected}>삭제</button>
        {/* mode 에 따라 다음 단계 결정 */}
        <button onClick={() =>
          setStep(mode === "stroke" ? 5 : 7)
        }>
          다음 →
        </button>
      </div>
    </>
  );
}
