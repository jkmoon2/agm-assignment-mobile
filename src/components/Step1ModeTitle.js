import React from "react";
import "../App.css";

export default function Step1ModeTitle({
  step, setStep,
  mode, setMode,
  title, setTitle
}) {
  const canNext = title.trim() !== "";
  return (
    <>
      <div className="step-header">
        <h3>{step}. 모드 선택 및 대회 제목 입력</h3>
      </div>
      <div className="step-body">
        <div className="btn-group">
          <button
            className={mode==="stroke"?"active":""}
            onClick={()=>setMode("stroke")}
          >스트로크 모드</button>
          <button
            className={mode==="agm"?"active":""}
            onClick={()=>setMode("agm")}
          >AGM 포볼 모드</button>
        </div>
        <input
          type="text"
          className="full-width-input"
          placeholder="대회 제목을 입력하세요"
          value={title}
          onChange={e=>setTitle(e.target.value)}
        />
      </div>
      <div className="step-footer">
        <button
          disabled={!canNext}
          onClick={()=>setStep(2)}
        >다음 →</button>
      </div>
    </>
  );
}
