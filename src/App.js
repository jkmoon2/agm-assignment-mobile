// src/App.js
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./App.css";

// 5~8단계 컴포넌트 import
import Step5_StrokeAssign from "./components/Step5_StrokeAssign";
import Step6_StrokeResult   from "./components/Step6_StrokeResult";
import Step7_AGMAssign      from "./components/Step7_AGMAssign";
import Step8_AGMResult      from "./components/Step8_AGMResult";

function App() {
  const [step, setStep] = useState(1);

  // 1단계
  const [mode, setMode] = useState("stroke");
  const [title, setTitle] = useState("");

  // 2단계
  const [roomCount, setRoomCount] = useState(4);
  const [roomNames, setRoomNames] = useState(
    Array.from({ length: 4 }, (_, i) => `${i + 1}조`)
  );

  // 3단계
  const [uploadMethod, setUploadMethod] = useState("");

  // 4단계
  const [participants, setParticipants] = useState([]);

  // 방 개수 변경 시 roomNames 길이 동기화 + 참가자 슬롯 초기화
  useEffect(() => {
    setRoomNames((prev) => {
      const next = prev.slice(0, roomCount);
      while (next.length < roomCount) {
        next.push(`${next.length + 1}조`);
      }
      return next;
    });
    setParticipants(
      Array.from({ length: roomCount * 4 }, (_, i) => ({
        group: Math.floor(i / 4) + 1,
        nickname: "",
        handicap: 0,
        selected: false,
      }))
    );
  }, [roomCount]);

  // 엑셀 업로드 핸들러 (4단계 자동)
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);
      const list = json
        .map((r) => ({
          group: r.조,
          nickname: r.닉네임,
          handicap: r["G핸디"],
          selected: false,
        }))
        .slice(0, roomCount * 4);
      while (list.length < roomCount * 4) {
        list.push({ group: 1, nickname: "", handicap: 0, selected: false });
      }
      setParticipants(list);
    };
    reader.readAsBinaryString(file);
  };

  // 수동 초기화
  const initManual = () => {
    setParticipants(
      Array.from({ length: roomCount * 4 }, (_, i) => ({
        group: Math.floor(i / 4) + 1,
        nickname: "",
        handicap: 0,
        selected: false,
      }))
    );
  };

  // 체크 토글
  const toggleSelect = (i) => {
    const c = [...participants];
    c[i].selected = !c[i].selected;
    setParticipants(c);
  };

  // 추가 / 선택 삭제
  const addParticipant = () => {
    setParticipants((p) => [
      ...p,
      { group: 1, nickname: "", handicap: 0, selected: false },
    ]);
  };
  const delSelected = () => {
    setParticipants((p) => p.filter((x) => !x.selected));
  };

  return (
    <div className="app-container">
      {/* 헤더 */}
      <div className="step-header">
        <h3>
          {step}.{" "}
          {{
            1: "모드 선택 및 대회 제목 입력",
            2: "방 개수 및 방 이름 설정",
            3: "업로드 방식 선택",
            4: "참가자 데이터 입력",
            5: "스트로크 방 배정",
            6: "스트로크 결과 확인",
            7: "AGM 포볼 방 배정",
            8: "AGM 포볼 결과 확인",
          }[step]}
        </h3>
      </div>

      {/* 본문 */}
      <div className="step-body">
        {/* 1단계 */}
        {step === 1 && (
          <>
            <div className="btn-group">
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
              className="full-width-input"
              placeholder="대회 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </>
        )}

        {/* 2단계 */}
        {step === 2 && (
          <>
            <div className="room-count-selector">
              <button onClick={() => setRoomCount((c) => Math.max(1, c - 1))}>
                –
              </button>
              {[3, 4, 5, 6, 7, 8].map((n) => (
                <button
                  key={n}
                  className={roomCount === n ? "active" : ""}
                  onClick={() => setRoomCount(n)}
                >
                  {n}개
                </button>
              ))}
              <button onClick={() => setRoomCount((c) => c + 1)}>＋</button>
            </div>
            <div className="room-names">
              {roomNames.map((name, i) => (
                <div key={i} className="room-name-row">
                  <label>방 {i + 1}:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const rn = [...roomNames];
                      rn[i] = e.target.value;
                      setRoomNames(rn);
                    }}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* 3단계 */}
        {step === 3 && (
          <div className="btn-group">
            <button
              className={uploadMethod === "auto" ? "active" : ""}
              onClick={() => {
                setUploadMethod("auto");
              }}
            >
              자동(엑셀) 업로드
            </button>
            <button
              className={uploadMethod === "manual" ? "active" : ""}
              onClick={() => {
                setUploadMethod("manual");
                initManual();
              }}
            >
              수동(직접 입력)
            </button>
          </div>
        )}

        {/* 4단계 */}
        {step === 4 && (
          <>
            <div className="excel-header">
              {uploadMethod === "auto" && (
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFile}
                />
              )}
              <span className="total">총 슬롯: {roomCount * 4}명</span>
            </div>
            <div className="participant-table">
              {/* 헤더 */}
              <div className="participant-row header">
                <div className="cell group">조</div>
                <div className="cell nickname">닉네임</div>
                <div className="cell handicap">G핸디</div>
                <div className="cell delete">삭제</div>
              </div>
              {/* 리스트 */}
              {participants.map((p, i) => (
                <div key={i} className="participant-row">
                  <div className="cell group">
                    <select
                      value={p.group}
                      onChange={(e) => {
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
                      onChange={(e) => {
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
                      onChange={(e) => {
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
          </>
        )}

        {/* 5~8단계: 외부 컴포넌트 렌더링 */}
        {step === 5 && (
          <Step5_StrokeAssign
            roomCount={roomCount}
            roomNames={roomNames}
            participants={participants}
            setParticipants={setParticipants}
          />
        )}
        {step === 6 && (
          <Step6_StrokeResult
            roomCount={roomCount}
            roomNames={roomNames}
            participants={participants}
          />
        )}
        {step === 7 && (
          <Step7_AGMAssign
            roomCount={roomCount}
            roomNames={roomNames}
            participants={participants}
          />
        )}
        {step === 8 && (
          <Step8_AGMResult
            roomCount={roomCount}
            roomNames={roomNames}
            participants={participants}
          />
        )}
      </div>

      {/* 푸터 */}
      <div className="step-footer">
        {step > 1 && <button onClick={() => setStep(step - 1)}>← 이전</button>}

        {/* 4단계 이상, 8단계 미만일 때만 다음 버튼 */}
        {step < 8 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !title}
          >
            다음 →
          </button>
        )}

        {/* 4단계에서는 추가/삭제 버튼만 */}
        {step === 4 && (
          <>
            <button onClick={addParticipant}>추가</button>
            <button onClick={delSelected}>삭제</button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
