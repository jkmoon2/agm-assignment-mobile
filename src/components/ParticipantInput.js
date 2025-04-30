import React from "react";

export default function ParticipantInput({
  participants,
  roomNames,
  uploadMethod,
  onExcelUpload,
  onAddParticipant,
  onRemoveSelected,
  onChange,
}) {
  return (
    // <-- step.scrollable 클래스 추가!
    <div className="step scrollable">
      <h3>4. 참가자 데이터 입력</h3>

      {/* ─── 본문만 스크롤 ─── */}
      <div className="step-body">
        {/* ─── 엑셀 헤더: 파일선택 + 슬롯만 한 줄에 ─── */}
        <div className="excel-header">
          <label className="file-input-label">
            파일 선택
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) onExcelUpload(f);
              }}
            />
          </label>
          <span className="slot-count">
            총 슬롯: {participants.length}명
          </span>
        </div>

        {/* ─── 참가자 테이블 ─── */}
        <div className="participant-table">
          <div className="participant-row header">
            <div className="cell group">조</div>
            <div className="cell nickname">닉네임</div>
            <div className="cell handicap">G핸디</div>
            <div className="cell delete">삭제</div>
          </div>

          {participants.map((p, i) => (
            <div className="participant-row" key={i}>
              <div className="cell group">
                <select
                  value={p.group}
                  onChange={(e) => onChange(i, "group", e.target.value)}
                >
                  {roomNames.map((rn) => (
                    <option key={rn}>{rn}</option>
                  ))}
                </select>
              </div>
              <div className="cell nickname">
                <input
                  type="text"
                  value={p.name}
                  placeholder="닉네임"
                  onChange={(e) => onChange(i, "name", e.target.value)}
                />
              </div>
              <div className="cell handicap">
                <input
                  type="number"
                  value={p.handicap}
                  onChange={(e) => onChange(i, "handicap", e.target.value)}
                />
              </div>
              <div className="cell delete">
                <input
                  type="checkbox"
                  checked={p.toDelete}
                  onChange={(e) => onChange(i, "toDelete", e.target.checked)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 추가/삭제 버튼 (본문 아래에 고정) ─── */}
      <div className="manual-controls">
        <button onClick={onAddParticipant}>추가</button>
        <button onClick={onRemoveSelected}>삭제</button>
      </div>
    </div>
  );
}
