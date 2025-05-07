import React from "react";
import "../App.css";

export default function Step3UploadType({
  step, setStep,
  uploadMethod, setUploadMethod,
  initManual
}) {
  const canNext = uploadMethod !== "";
  return (
    <>
      <div className="step-header">
        <h3>{step}. 업로드 방식 선택</h3>
      </div>
      <div className="step-body">
        <div className="upload-type-btns">
          <button
            className={uploadMethod==="auto"?"active":""}
            onClick={()=>setUploadMethod("auto")}
          >자동(엑셀) 업로드</button>
          <button
            className={uploadMethod==="manual"?"active":""}
            onClick={()=>{
              setUploadMethod("manual");
              initManual();
            }}
          >수동(직접 입력)</button>
        </div>
      </div>
      <div className="step-footer">
        <button onClick={()=>setStep(2)}>← 이전</button>
        <button disabled={!canNext} onClick={()=>setStep(4)}>다음 →</button>
      </div>
    </>
  );
}
