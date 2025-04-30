import React from "react";

export default function ModeTitle({ mode, setMode, title, setTitle }) {
  return (
    <div className="step mode-title">
      <h2>1. 모드 선택 및 대회 제목 입력</h2>
      <div className="mode-buttons">
        <button
          className={mode === "stroke" ? "active" : ""}
          onClick={() => setMode("stroke")}
        >
          스트로크 모드
        </button>
        <button
          className={mode === "agm" ? "active" : ""}
          onClick={() => setMode("agm")}
        >
          AGM 포볼 모드
        </button>
      </div>
      <input
        type="text"
        placeholder="대회 제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
    </div>
  );
}
