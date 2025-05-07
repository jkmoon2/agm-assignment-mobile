// File: src/App.js

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

import Step1ModeTitle      from "./components/Step1ModeTitle";
import Step2RoomSetup      from "./components/Step2RoomSetup";
import Step3UploadType     from "./components/Step3UploadType";
import Step4Participant    from "./components/Step4Participant";
import Step5StrokeAssign   from "./components/Step5StrokeAssign";
import Step5_5StrokeScore  from "./components/Step5StrokeScore";
import Step6StrokeResult   from "./components/Step6StrokeResult";
import Step7AGMAssign      from "./components/Step7AGMAssign";
import Step7_5AGMScore     from "./components/Step7AGMScore";
import Step8AGMResult      from "./components/Step8AGMResult";

import { shuffle, sleep } from "./utils";
import "./App.css";

function App() {
  // ─── 공통 상태 ───
  const [step, setStep]               = useState(1);
  const [mode, setMode]               = useState("stroke"); // "stroke" or "agm"
  const [title, setTitle]             = useState("");

  const [roomCount, setRoomCount]     = useState(4);
  const [roomNames, setRoomNames]     = useState(
    Array.from({ length: 4 }, (_, i) => `${i+1}조`)
  );

  const [uploadMethod, setUploadMethod] = useState("");
  const [participants, setParticipants] = useState([]);

  const [strokeAssigned, setStrokeAssigned] = useState({});
  const [agmAssigned, setAgmAssigned]       = useState({});
  const [scores, setScores]                 = useState({});

  // 방 개수 변경 시 초기화
  useEffect(() => {
    setRoomNames(prev => {
      const next = prev.slice(0, roomCount);
      while (next.length < roomCount) next.push(`${next.length+1}조`);
      return next;
    });
    setParticipants(
      Array.from({ length: roomCount * 4 }, (_, i) => ({
        group: Math.floor(i / 4) + 1,
        nickname: "",
        handicap: 0,
        selected: false
      }))
    );
    setStrokeAssigned({});
    setAgmAssigned({});
    setScores({});
  }, [roomCount]);

  // ─── 3/4단계: 업로드 / 수동 초기화 ───
  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const wb = XLSX.read(ev.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      const list = data.slice(0, roomCount * 4).map(r => ({
        group: r.조 || 1,
        nickname: r.닉네임 || "",
        handicap: r["G핸디"] || 0,
        selected: false
      }));
      setParticipants(list);
      setStrokeAssigned({});
      setAgmAssigned({});
      setScores({});
    };
    reader.readAsBinaryString(file);
  };

  const initManual = () => {
    setParticipants(
      Array.from({ length: roomCount * 4 }, (_, i) => ({
        group: Math.floor(i / 4) + 1,
        nickname: "",
        handicap: 0,
        selected: false
      }))
    );
    setStrokeAssigned({});
    setAgmAssigned({});
    setScores({});
  };

  // ─── 5단계: 스트로크 수동 배정 ───
  const assignOneStroke = async idx => {
    const user = participants[idx];
    if (!user.nickname) return;
    // 이미 배정된 사용자 방지
    const exists = Object.values(strokeAssigned)
      .flat()
      .find(p => p.nickname === user.nickname);
    if (exists) return;
    // 같은 조 빈 방만
    const avail = [];
    for (let r = 0; r < roomCount; r++) {
      const arr = strokeAssigned[r] || [];
      if (!arr.find(p => p.group === user.group)) avail.push(r);
    }
    if (!avail.length) return;
    const choice = avail[Math.floor(Math.random() * avail.length)];
    // 1~2초 딜레이
    await sleep(1000 + Math.random() * 1000);
    setStrokeAssigned(prev => ({
      ...prev,
      [choice]: [...(prev[choice] || []), user]
    }));
  };

  // ─── 5단계: 스트로크 자동 배정 ───
  const autoAssignStroke = () => {
    const newRooms = { ...strokeAssigned };
    const unassigned = participants.filter(
      p => !Object.values(newRooms).flat().find(x => x.nickname === p.nickname)
    );
    const grouped = unassigned.reduce((acc, p) => {
      (acc[p.group] ||= []).push(p);
      return acc;
    }, {});
    for (let r = 0; r < roomCount; r++) newRooms[r] = newRooms[r] || [];
    Object.values(grouped).forEach(arr => {
      shuffle(arr).forEach(p => {
        for (let r = 0; r < roomCount; r++) {
          const arr2 = newRooms[r];
          if (!arr2.find(q => q.group === p.group) && arr2.length < 4) {
            arr2.push(p);
            break;
          }
        }
      });
    });
    setStrokeAssigned(newRooms);
  };

  // ─── 5단계: 스트로크 초기화 ───
  const clearStroke = () => setStrokeAssigned({});

  // ─── 5단계: 스트로크 강제 배정 ───
  const forceAssignStroke = async (idx, targetRoom) => {
    const user = participants[idx];
    if (!user.nickname) return;
    // 기존 방에서 제거
    let prevRoom = -1;
    Object.entries(strokeAssigned).forEach(([r, arr]) => {
      if (arr.find(p => p.nickname === user.nickname)) prevRoom = Number(r);
    });
    await sleep(1000 + Math.random() * 1000);
    setStrokeAssigned(prev => {
      const next = { ...prev };
      if (prevRoom >= 0) {
        next[prevRoom] = next[prevRoom].filter(p => p.nickname !== user.nickname);
      }
      next[targetRoom] = next[targetRoom] || [];
      // 같은 조 peer가 있으면 트레이드
      const peer = next[targetRoom].find(p => p.group === user.group);
      if (peer && prevRoom >= 0) {
        next[prevRoom] = [...(next[prevRoom] || []), peer];
        next[targetRoom] = next[targetRoom].filter(p => p.nickname !== peer.nickname);
      }
      next[targetRoom].push(user);
      alert(`강제배정 완료: ${user.nickname} → ${roomNames[targetRoom]}`);
      return next;
    });
  };

  // ────────────────────────────────────
  // AGM 포볼: 7단계 방선택/팀선택/자동/초기화
  const selectAgmRoom = async idx => {
    const user = participants[idx];
    if (user.group !== 1) return;
    const exists = Object.values(agmAssigned)
      .flat()
      .find(p => p.nickname === user.nickname);
    if (exists) return;
    const avail = [];
    for (let r = 0; r < roomCount; r++) {
      const arr = agmAssigned[r] || [];
      if (arr.length < 4) avail.push(r);
    }
    if (!avail.length) return;
    const choice = avail[Math.floor(Math.random() * avail.length)];
    await sleep(1000 + Math.random() * 1000);
    setAgmAssigned(prev => ({
      ...prev,
      [choice]: [...(prev[choice] || []), user]
    }));
  };

  const selectAgmTeam = async idx => {
    const user1 = participants[idx];
    if (user1.group !== 1) return;
    let roomIdx = -1;
    Object.entries(agmAssigned).forEach(([k, arr]) => {
      if (arr.find(p => p.nickname === user1.nickname)) roomIdx = +k;
    });
    if (roomIdx < 0) return;
    const pool = participants.filter(
      p => p.group === 2 &&
           !Object.values(agmAssigned).flat().find(q => q.nickname === p.nickname)
    );
    if (!pool.length) return;
    const pick = shuffle(pool)[0];
    await sleep(1000 + Math.random() * 1000);
    setAgmAssigned(prev => ({
      ...prev,
      [roomIdx]: [...(prev[roomIdx] || []), pick]
    }));
  };

  const autoAssignAgm = () => {
    const g1 = participants.filter(p => p.group === 1);
    const g2 = participants.filter(p => p.group === 2);
    const cnt = Math.min(g1.length, g2.length);
    const sh1 = shuffle(g1).slice(0, cnt);
    const sh2 = shuffle(g2).slice(0, cnt);
    const rooms = {};
    for (let r = 0; r < roomCount; r++) rooms[r] = agmAssigned[r] || [];
    let pi = 0;
    for (let r = 0; r < roomCount; r++) {
      while (rooms[r].length < 4 && pi < cnt) {
        rooms[r].push(sh1[pi], sh2[pi]);
        pi++;
      }
    }
    setAgmAssigned(rooms);
  };

  const clearAgm = () => setAgmAssigned({});

  // ─── 완료 핸들러 ───
  const finish = () => {
    alert("완료되었습니다!");
    setStep(1);
  };

  return (
    <div className="app-container">
      {/* Step1 */}
      {step === 1 && (
        <Step1ModeTitle
          step={step} setStep={setStep}
          mode={mode} setMode={setMode}
          title={title} setTitle={setTitle}
        />
      )}

      {/* Step2 */}
      {step === 2 && (
        <Step2RoomSetup
          step={step} setStep={setStep}
          roomCount={roomCount} setRoomCount={setRoomCount}
          roomNames={roomNames} setRoomNames={setRoomNames}
        />
      )}

      {/* Step3 */}
      {step === 3 && (
        <Step3UploadType
          step={step} setStep={setStep}
          uploadMethod={uploadMethod} setUploadMethod={setUploadMethod}
          initManual={initManual}
        />
      )}

      {/* Step4 */}
      {step === 4 && (
        <Step4Participant
          step={step} setStep={setStep}
          mode={mode}
          uploadMethod={uploadMethod}
          participants={participants} setParticipants={setParticipants}
          roomCount={roomCount} roomNames={roomNames}
          handleFile={handleFile}
        />
      )}

      {/* Step5 */}
      {mode === "stroke" && step === 5 && (
        <Step5StrokeAssign
          participants={participants}
          roomCount={roomCount}
          roomNames={roomNames}
          assigned={strokeAssigned}
          onManualAssign={assignOneStroke}
          onAutoAssign={autoAssignStroke}
          onForceAssign={forceAssignStroke}
          onClear={clearStroke}
          onPrev={() => setStep(4)}
          onNext={() => setStep(5.5)}
        />
      )}

      {/* Step5.5 */}
      {mode === "stroke" && step === 5.5 && (
        <Step5_5StrokeScore
          assigned={strokeAssigned}
          scores={scores}
          onScoreChange={(name, val) =>
            setScores(s => ({ ...s, [name]: val }))
          }
          onPrev={() => setStep(5)}
          onNext={() => setStep(6)}
        />
      )}

      {/* Step6 */}
      {mode === "stroke" && step === 6 && (
        <Step6StrokeResult
          assigned={strokeAssigned}
          roomNames={roomNames}
          scores={scores}
          onPrev={() => setStep(5.5)}
          onDone={finish}
        />
      )}

      {/* Step7 */}
      {mode === "agm" && step === 7 && (
        <Step7AGMAssign
          participants={participants}
          roomCount={roomCount}
          roomNames={roomNames}
          assigned={agmAssigned}
          onRoomSelect={selectAgmRoom}
          onTeamSelect={selectAgmTeam}
          onAutoAssignAGM={autoAssignAgm}
          onClearAGM={clearAgm}
          onPrev={() => setStep(4)}
          onNext={() => setStep(7.5)}
        />
      )}

      {/* Step7.5 */}
      {mode === "agm" && step === 7.5 && (
        <Step7_5AGMScore
          assigned={agmAssigned}
          scores={scores}
          onScoreChange={(name, val) =>
            setScores(s => ({ ...s, [name]: val }))
          }
          onPrev={() => setStep(7)}
          onNext={() => setStep(8)}
        />
      )}

      {/* Step8 */}
      {mode === "agm" && step === 8 && (
        <Step8AGMResult
          assigned={agmAssigned}
          roomNames={roomNames}
          scores={scores}
          onPrev={() => setStep(7.5)}
          onDone={finish}
        />
      )}
    </div>
  );
}

export default App;
