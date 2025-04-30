// src/components/UploadMethod.js
import React from "react";

export default function UploadMethod({ uploadMethod, setUploadMethod }) {
  return (
    // step 헤더 컨테이너
    <div className="step">
      <h3>3. 업로드 방식 선택</h3>

      {/* 이 DIV가 가로(flex)로 버튼을 묶어 줍니다 */}
      <div className="upload-method">
        <button
          className={uploadMethod === "auto" ? "active" : ""}
          onClick={() => setUploadMethod("auto")}
        >
          자동(엑셀) 업로드
        </button>
        <button
          className={uploadMethod === "manual" ? "active" : ""}
          onClick={() => setUploadMethod("manual")}
        >
          수동(직접 입력)
        </button>
      </div>

      <p style={{ textAlign: "center", marginTop: 12 }}>
        선택된 방식: {uploadMethod === "auto" ? "자동" : uploadMethod === "manual" ? "수동" : "없음"}
      </p>
    </div>
  );
}
