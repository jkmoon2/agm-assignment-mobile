import React, { useState } from "react";
import StrokeModeApp from "./StrokeModeApp";
import AGMForBallModeApp from "./AGMForBallModeApp";
import "./App.css";

function App() {
  const [mode, setMode] = useState(""); // "" / "stroke" / "agm"

  if (!mode) {
    // 모드 선택 화면
    return (
      <div className="mode-select-container">
        <button className="mode-btn" onClick={() => setMode("stroke")}>
          스트로크 모드
        </button>
        <button className="mode-btn" onClick={() => setMode("agm")}>
          AGM 포볼 모드
        </button>
      </div>
    );
  }

  return mode === "stroke" ? <StrokeModeApp /> : <AGMForBallModeApp />;
}

export default App;
