import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

import Step1ModeTitle    from "./components/Step1ModeTitle";
import Step2RoomSetup    from "./components/Step2RoomSetup";
import Step3UploadType   from "./components/Step3UploadType";
import Step4Participant  from "./components/Step4Participant";
import Step5StrokeAssign from "./components/Step5StrokeAssign";
import Step6StrokeResult from "./components/Step6StrokeResult";
import Step7AGMAssign    from "./components/Step7AGMAssign";
import Step8AGMResult    from "./components/Step8AGMResult";

import "./App.css";

function App() {
  // ─── 공통 상태 ───
  const [step, setStep]     = useState(1);
  const [mode, setMode]     = useState("stroke"); // "stroke" or "agm"
  const [title, setTitle]   = useState("");

  // ─── 2단계: 방 개수 & 이름 ───
  const [roomCount, setRoomCount] = useState(4);
  const [roomNames, setRoomNames] = useState(
    Array.from({ length: 4 }, (_, i) => `${i + 1}조`)
  );

  // ─── 3/4단계: 업로드 방식 & 참가자 ───
  const [uploadMethod, setUploadMethod] = useState("");
  const [participants, setParticipants] = useState([]);

  // ─── 5/6단계: 스트로크 배정 결과 ───
  const [strokeAssigned, setStrokeAssigned] = useState({});

  // ─── 7/8단계: AGM 포볼 배정 결과 & 스코어 ───
  const [agmAssigned, setAgmAssigned] = useState({});
  const [scores, setScores] = useState({});

  // → 방 개수 바뀔 때마다 참가자 슬롯 & 배정 결과 초기화
  useEffect(() => {
    setRoomNames(prev => {
      const next = prev.slice(0, roomCount);
      while (next.length < roomCount) next.push(`${next.length + 1}조`);
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
    setStrokeAssigned({});
    setAgmAssigned({});
    setScores({});
  }, [roomCount]);

  // ─── 4단계: 엑셀 업로드 핸들러 ───
  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const wb = XLSX.read(ev.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);
      const list = json
        .map(r => ({
          group: r.조,
          nickname: r.닉네임,
          handicap: r["G핸디"],
          selected: false,
        }))
        .slice(0, roomCount * 4);
      while (list.length < roomCount * 4)
        list.push({ group: 1, nickname: "", handicap: 0, selected: false });
      setParticipants(list);
      setStrokeAssigned({});
      setAgmAssigned({});
      setScores({});
    };
    reader.readAsBinaryString(file);
  };
  // 수동 입력 진입 시 완전 초기화
  const initManual = () => {
    setParticipants(
      Array.from({ length: roomCount * 4 }, (_, i) => ({
        group: Math.floor(i / 4) + 1,
        nickname: "",
        handicap: 0,
        selected: false,
      }))
    );
    setStrokeAssigned({});
    setAgmAssigned({});
    setScores({});
  };

  // ─── 5단계: 스트로크 개별 배정 ───
  const assignOneStroke = idx => {
    const user = participants[idx];
    if (!user.nickname) return;
    const available = [];
    for (let i = 0; i < roomCount; i++) {
      const arr = strokeAssigned[i] || [];
      if (!arr.find(p => p.group === user.group)) available.push(i);
    }
    if (!available.length) return;
    const r = available[Math.floor(Math.random() * available.length)];
    setStrokeAssigned(prev => {
      const nxt = { ...prev };
      nxt[r] = [...(nxt[r] || []), user];
      return nxt;
    });
  };
  // ─── 5단계 자동 배정 ───
  const autoAssignStroke = () => {
    const grouped = {};
    participants.forEach(p => {
      if (!p.nickname) return;
      (grouped[p.group] ||= []).push(p);
    });
    const newRooms = {};
    for (let i = 0; i < roomCount; i++) newRooms[i] = [];
    Object.values(grouped).forEach(arr => {
      const shuffled = [...arr].sort(() => Math.random() - 0.5);
      let ri = 0;
      shuffled.forEach(p => {
        while (newRooms[ri].find(q => q.group === p.group)) ri++;
        if (ri < roomCount) newRooms[ri].push(p);
      });
    });
    setStrokeAssigned(newRooms);
  };
  const clearStroke = () => setStrokeAssigned({});

  // ─── 6단계 완료 ───
  const finish = () => {
    alert("완료되었습니다!");
    setStep(1);
  };

  // ─── 7단계: AGM 방 선택/팀 선택 ───
  const selectAgmRoom = idx => {
    const user = participants[idx];
    if (user.group !== 1) return;
    const available = [];
    for (let i = 0; i < roomCount; i++) {
      const arr = agmAssigned[i] || [];
      if (arr.length < 4) available.push(i);
    }
    if (!available.length) return;
    const r = available[Math.floor(Math.random() * available.length)];
    setAgmAssigned(prev => {
      const nxt = { ...prev };
      nxt[r] = [...(nxt[r] || []), user];
      return nxt;
    });
  };
  const selectAgmTeam = idx => {
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
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setAgmAssigned(prev => {
      const nxt = { ...prev };
      nxt[roomIdx] = [...(nxt[roomIdx] || []), pick];
      return nxt;
    });
  };
  const autoAssignAgm = () => {
    const g1 = participants.filter(p => p.group === 1);
    const g2 = participants.filter(p => p.group === 2);
    const cnt = Math.min(g1.length, g2.length);
    const sh1 = [...g1].sort(() => Math.random()-0.5).slice(0, cnt);
    const sh2 = [...g2].sort(() => Math.random()-0.5).slice(0, cnt);
    const nxt = {};
    for (let i=0;i<roomCount;i++) nxt[i]=[];
    let pi=0;
    for (let r=0;r<roomCount;r++){
      while(nxt[r].length<4 && pi<cnt){
        nxt[r].push(sh1[pi], sh2[pi]);
        pi++;
      }
    }
    setAgmAssigned(nxt);
  };
  const clearAgm = () => setAgmAssigned({});

  return (
    <div className="app-container">
      {step===1 && (
        <Step1ModeTitle
          step={step} setStep={setStep}
          mode={mode} setMode={setMode}
          title={title} setTitle={setTitle}
        />
      )}

      {step===2 && (
        <Step2RoomSetup
          step={step} setStep={setStep}
          roomCount={roomCount} setRoomCount={setRoomCount}
          roomNames={roomNames} setRoomNames={setRoomNames}
        />
      )}

      {step===3 && (
        <Step3UploadType
          step={step} setStep={setStep}
          uploadMethod={uploadMethod}
          setUploadMethod={m=>{
            setUploadMethod(m);
            if(m==="manual") initManual();
          }}
          initManual={initManual}
        />
      )}

{step===4 && (
        <Step4Participant
          step={step}
          setStep={setStep}
          mode={mode}                      // ← 추가
          uploadMethod={uploadMethod}
          participants={participants}
          setParticipants={setParticipants}
          roomCount={roomCount}
          roomNames={roomNames}
          handleFile={handleFile}
        />
      )}

      {mode==="stroke" && step===5 && (
        <Step5StrokeAssign
          participants={participants}
          roomCount={roomCount}
          roomNames={roomNames}
          onAssignOne={assignOneStroke}
          onAutoAssign={autoAssignStroke}
          onClearStroke={clearStroke}
          onPrev={()=>setStep(4)}
          onNext={()=>setStep(6)}
        />
      )}
      {mode==="stroke" && step===6 && (
        <Step6StrokeResult
          assigned={strokeAssigned}
          roomNames={roomNames}
          onPrev={()=>setStep(5)}
          onDone={finish}
        />
      )}

      {mode==="agm" && step===7 && (
        <Step7AGMAssign
          participants={participants}
          roomCount={roomCount}
          roomNames={roomNames}
          onRoomSelect={selectAgmRoom}
          onTeamSelect={selectAgmTeam}
          onAutoAssignAGM={autoAssignAgm}
          onClearAGM={clearAgm}
          onPrev={()=>setStep(4)}
          onNext={()=>setStep(8)}
        />
      )}
      {mode==="agm" && step===8 && (
        <Step8AGMResult
          assigned={agmAssigned}
          roomNames={roomNames}
          scores={scores}
          onPrev={()=>setStep(7)}
          onDone={finish}
        />
      )}
    </div>
  );
}

export default App;
