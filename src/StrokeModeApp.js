/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

// ==============================================
// [1] 안전한 숫자 변환 함수
//     -> 입력된 값이 숫자로 변환되지 않으면 0을 반환합니다.
// ==============================================
function toNumberSafe(val) {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

// ==============================================
// [2] 인라인 스타일 정의
// ==============================================
const tableContainerStyle = {
  overflowX: 'auto',
  marginTop: '20px',
  marginBottom: '20px',
};

const tableStyle = {
  borderCollapse: 'collapse',
  width: '100%',
  tableLayout: 'fixed',
};

const baseCellStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const headerStyle = {
  ...baseCellStyle,
  backgroundColor: '#f0f0f0',
  fontWeight: 'bold',
  fontSize: '18px',
};

const footerStyle = {
  ...baseCellStyle,
  backgroundColor: '#e8e8e8',
  fontWeight: 'bold',
};

const rankNumberStyle = {
  color: 'blue',
  fontWeight: 'bold',
  fontSize: '18px',
};

const rankLabelStyle = {
  color: 'blue',
  fontWeight: 'bold',
  fontSize: '18px',
};

// 닉네임 열 폭: 160px, 나머지 작은 열 폭: 30px
const colWidths = {
  nickname: 160,
  small: 30,
};

// ==============================================
// [3] 글자 길이에 따라 폰트 크기 자동 조절 함수
// ==============================================
function fitFontSize(text = "", maxLen = 6, baseSize = 18, minSize = 14) {
  if (text.length <= maxLen) return { fontSize: `${baseSize}px` };
  const ratio = maxLen / text.length;
  const newSize = Math.max(minSize, Math.floor(baseSize * ratio));
  return { fontSize: `${newSize}px` };
}

// ==============================================
// [4] G핸디 표시 함수
//     -> 값이 0이면 "0"으로, 아니면 그대로 출력합니다.
// ==============================================
function displayGhandi(val) {
  return toNumberSafe(val) === 0 ? "0" : val;
}

// ==============================================
// [5] getScore 함수
//     -> 참가자의 이름을 소문자 + trim 하여, scores 객체에서 점수를 가져옵니다.
//     -> (사용되지 않아도 에러는 아니므로 남겨둠.)
// ==============================================
function getScore(name, scores) {
  const key = name ? name.trim().toLowerCase() : "";
  return toNumberSafe(scores[key]);
}

// ==============================================
// [6] RoomAllocationTable
//     -> 각 방에 배정된 참가자들과 G핸디 합계를 출력하는 표
// ==============================================
function RoomAllocationTable({ rooms, roomLabels, hiddenRooms }) {
  const allRooms = Array.from({ length: roomLabels.length }, (_, i) => String(i));
  const rowCount = 4;
  const roomNumbers = allRooms.filter(room => !hiddenRooms[room]);

  // 각 방의 G핸디 합계 계산
  const roomHandySum = {};
  roomNumbers.forEach(room => {
    const arr = rooms[room] || [];
    let sum = 0;
    for (let i = 0; i < rowCount; i++) {
      const p = arr[i];
      if (p && p.ghandi !== "") sum += Number(p.ghandi);
    }
    roomHandySum[room] = sum;
  });

  return (
    <div style={tableContainerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {roomNumbers.map(room => (
              <th
                key={room}
                colSpan={2}
                style={{ ...headerStyle, width: colWidths.nickname + colWidths.small }}
              >
                {roomLabels[Number(room)]}
              </th>
            ))}
          </tr>
          <tr>
            {roomNumbers.map(room => (
              <React.Fragment key={room}>
                <th style={{ ...headerStyle, width: colWidths.nickname }}>닉네임</th>
                <th style={{ ...headerStyle, width: colWidths.small }}>G핸디</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {roomNumbers.map(room => {
                const p = rooms[room]?.[rowIndex];
                return (
                  <React.Fragment key={`${room}-${rowIndex}`}>
                    <td
                      style={{
                        ...baseCellStyle,
                        ...fitFontSize(p?.name || "", 6, 18, 14),
                        width: colWidths.nickname,
                      }}
                    >
                      {p?.name || ""}
                    </td>
                    <td style={{ ...baseCellStyle, width: colWidths.small, color: 'blue' }}>
                      {p ? displayGhandi(p.ghandi) : ""}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            {roomNumbers.map(room => (
              <React.Fragment key={room}>
                <td style={{ ...footerStyle, width: colWidths.nickname, color: 'black' }}>
                  합계
                </td>
                <td style={{ ...footerStyle, width: colWidths.small, color: 'blue' }}>
                  {roomHandySum[room]}
                </td>
              </React.Fragment>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ==============================================
// [7] FinalResultTable
//     -> (반땅 계산 + 순위) + "방별 표시/숨김" + "스코어/반땅 표시" 옵션
// ==============================================
function FinalResultTable({
  rooms,
  scores,
  roomLabels,
  hiddenRooms,
  showScore,
  showBanddang,
  toggleRoomVisibility,
  setShowScore,
  setShowBanddang,
}) {
  const rowCount = 4;
  const visibleRooms = roomLabels.map((_, i) => String(i)).filter(r => !hiddenRooms[r]);

  // roomData 배열 생성
  const roomData = [];
  visibleRooms.forEach(r => {
    const i = Number(r);
    const arr = rooms[i] || [];
    // 빈 슬롯 채우기
    const completeArr = Array.from({ length: rowCount }, (_, idx) => arr[idx] || { group: "", name: "", ghandi: "" });
    // 최고 스코어 찾기
    let highestIndex = -1;
    let highestScore = -Infinity;
    completeArr.forEach((p, idx) => {
      const sc = Number(scores[p?.name?.trim().toLowerCase()] || 0);
      if (sc > highestScore) {
        highestScore = sc;
        highestIndex = idx;
      }
    });
    // 합계 계산
    let banddangSum = 0, total = 0, ghandiSum = 0;
    const finalScores = completeArr.map((p, idx) => {
      const sc = Number(scores[p?.name?.trim().toLowerCase()] || 0);
      ghandiSum += Number(p?.ghandi || 0);
      const banddang = idx === highestIndex && showBanddang
        ? Math.floor(sc * 0.5)
        : sc;
      banddangSum += banddang;
      const result = banddang - Number(p?.ghandi || 0);
      total += result;
      return { p, sc, banddang, result };
    });
    roomData.push({ roomIndex: i, finalScores, banddangSum, total, ghandiSum });
  });

  // 순위 산출
  const sorted = [...roomData].sort((a, b) => {
    const diff = a.total - b.total;
    return diff !== 0 ? diff : a.ghandiSum - b.ghandiSum;
  }).map((r, idx) => ({ ...r, rank: idx + 1 }));

  // roomData 에 rank 병합
  roomData.forEach(rd => {
    const found = sorted.find(s => s.roomIndex === rd.roomIndex);
    rd.rank = found?.rank;
  });

  const formatNum = n => (n >= 0 ? `+${n}` : `${n}`);

  return (
    <div style={tableContainerStyle}>
      <div style={{ marginBottom: '10px', fontSize: '16px' }}>
        <h4>🕵️ 방별 표시/숨김</h4>
        {roomLabels.map((label, i) => (
          <label key={i} style={{ marginRight: '10px' }}>
            <input
              type="checkbox"
              checked={!hiddenRooms[String(i)]}
              onChange={() => toggleRoomVisibility(String(i))}
            />
            {label}
          </label>
        ))}
        <div style={{ marginTop: '10px' }}>
          <label style={{ marginRight: '10px' }}>
            <input
              type="checkbox"
              checked={showScore}
              onChange={e => setShowScore(e.target.checked)}
            />
            스코어 표시
          </label>
          <label>
            <input
              type="checkbox"
              checked={showBanddang}
              onChange={e => setShowBanddang(e.target.checked)}
            />
            반땅 표시
          </label>
        </div>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            {roomData.map(rd => (
              <th
                key={rd.roomIndex}
                colSpan={2 + (showScore ? 1 : 0) + (showBanddang ? 1 : 0) + 1}
                style={headerStyle}
              >
                {roomLabels[rd.roomIndex]}
              </th>
            ))}
          </tr>
          <tr>
            {roomData.map(rd => (
              <React.Fragment key={rd.roomIndex}>
                <th style={headerStyle}>닉네임</th>
                <th style={headerStyle}>G핸디</th>
                {showScore && <th style={headerStyle}>스코어</th>}
                {showBanddang && <th style={headerStyle}>반땅</th>}
                <th style={headerStyle}>결과</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {roomData.map(rd => {
                const fs = rd.finalScores[rowIndex];
                return (
                  <React.Fragment key={`${rd.roomIndex}-${rowIndex}`}>
                    <td style={{ ...baseCellStyle, ...fitFontSize(fs.p.name, 10, 18, 14) }}>
                      {fs.p.name}
                    </td>
                    <td style={baseCellStyle}>{displayGhandi(fs.p.ghandi)}</td>
                    {showScore && <td style={baseCellStyle}>{formatNum(fs.sc)}</td>}
                    {showBanddang && <td style={{ ...baseCellStyle, color: 'blue' }}>{formatNum(fs.bandang)}</td>}
                    <td style={{ ...baseCellStyle, color: 'red' }}>{formatNum(fs.result)}</td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            {roomData.map(rd => {
              const colCount = 2 + (showScore ? 1 : 0) + (showBanddang ? 1 : 0) + 1;
              return (
                <React.Fragment key={rd.roomIndex}>
                  {Array.from({ length: colCount - 1 }).map((_, c) => (
                    <td key={c} style={footerStyle}></td>
                  ))}
                  <td style={{ ...footerStyle, color: 'red' }}>{formatNum(rd.total)}</td>
                </React.Fragment>
              );
            })}
          </tr>
          <tr>
            {roomData.map(rd => {
              const colCount = 2 + (showScore ? 1 : 0) + (showBanddang ? 1 : 0) + 1;
              return (
                <React.Fragment key={rd.roomIndex}>
                  {Array.from({ length: colCount - 1 }).map((_, c) => (
                    <td key={c} style={footerStyle}></td>
                  ))}
                  <td style={{ ...footerStyle, color: 'blue', fontWeight: 'bold' }}>
                    {rd.rank}등
                  </td>
                </React.Fragment>
              );
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ==============================================
// [8] App 컴포넌트 (전체 통합)
// ==============================================
function App() {
  const [topTitle, setTopTitle] = useState("스트로크 모드 배정");
  const [roomCount, setRoomCount] = useState(4);
  const [participants, setParticipants] = useState([]);
  const [assigned, setAssigned] = useState({});
  const [buttonClicked, setButtonClicked] = useState({});
  const [uploadKey, setUploadKey] = useState(0);
  const [forceResetKey, setForceResetKey] = useState(0);
  const [loadingIdx, setLoadingIdx] = useState(null);
  const [scores, setScores] = useState({});
  const [tableView, setTableView] = useState("none");
  const [roomLabels, setRoomLabels] = useState([]);
  const [hiddenRooms, setHiddenRooms] = useState({});

  // 초기화
  useEffect(() => {
    const defaults = Array.from({ length: roomCount }, (_, i) => `${i + 1}번 방`);
    setRoomLabels(defaults);
    initParticipants();
  }, [roomCount]);

  const initParticipants = () => {
    setParticipants(Array(roomCount * 4).fill({ group: '', name: '', ghandi: '' }));
    setAssigned({});
    setButtonClicked({});
    setScores({});
    setTableView("none");
    setUploadKey(prev => prev + 1);
    setForceResetKey(prev => prev + 1);
    setHiddenRooms({});
  };

  const handleRoomLabelChange = (idx, val) => {
    const arr = [...roomLabels];
    arr[idx] = val;
    setRoomLabels(arr);
  };

  const toggleRoomVisibility = (r) => {
    setHiddenRooms(prev => ({ ...prev, [r]: !prev[r] }));
  };

  const handleExcel = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = evt => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const rows = data.slice(1).map(r => ({
        group: r[0] || '',
        name: r[1] || '',
        ghandi: r[2] === 0 ? 0 : (r[2] || '')
      }));
      setParticipants(rows);
      setAssigned({});
      setButtonClicked({});
      setScores({});
      setTableView("none");
      setForceResetKey(prev => prev + 1);
      setHiddenRooms({});
    };
    r.readAsBinaryString(f);
  };

  const handleInput = (i, key, v) => {
    const c = [...participants];
    c[i][key] = key === "group"||key==="ghandi" ? Number(v)||'' : v;
    setParticipants(c);
  };
  const handleScoreChange = (name, val) => {
    const key = name.trim().toLowerCase();
    setScores(prev => ({ ...prev, [key]: val }));
  };

  // 셔플
  const shuffleArr = arr => arr.map(v=>[v,Math.random()]).sort((a,b)=>a[1]-b[1]).map(v=>v[0]);

  const assignIndividual = (i) => {
    const u = participants[i];
    if (!u.group||!u.name||u.ghandi===''||buttonClicked[i]) return;
    setButtonClicked(prev=>({...prev, [i]:true}));
    const gidx = u.group-1;
    const avail = [];
    for (let r=0; r<roomCount; r++){
      const room = assigned[r]||[];
      if (!room[gidx]){
        avail.push(r);
      }
    }
    if (!avail.length) return;
    const choice = shuffleArr(avail)[0];
    setLoadingIdx(i);
    setTimeout(()=>{
      setAssigned(prev=>{
        const nx={...prev};
        if (!nx[choice]) nx[choice]=[];
        nx[choice][gidx] = u;
        return nx;
      });
      setLoadingIdx(null);
      alert(`${u.name}→${roomLabels[choice]} 배정되었습니다.`);
    },1200);
  };

  const autoAssign = () => {
    const used = new Set(Object.values(assigned).flat().map(p=>p?.name));
    const groups = [[],[],[],[]];
    participants.forEach((p,i)=>{
      if (p.group>=1&&p.group<=4&&!used.has(p.name)) {
        groups[p.group-1].push({...p, idx:i});
      }
    });
    const res = {...assigned};
    groups.forEach((grp,gidx)=>{
      const sh = shuffleArr(grp);
      let roomPtr=0;
      sh.forEach(u=>{
        while(roomPtr<roomCount && res[roomPtr]?.[gidx]) roomPtr++;
        if(roomPtr<roomCount){
          if(!res[roomPtr]) res[roomPtr]=[];
          res[roomPtr][gidx]=u;
        }
      });
    });
    setAssigned(res);
    const bc={};
    Object.values(res).flat().forEach(p=>bc[p.idx]=true);
    setButtonClicked(bc);
  };

  const forceAssign = (i, rIdx) => {
    const u = participants[i];
    if(!u.group||!u.name) return;
    const gidx = u.group-1;
    const nx = {...assigned};
    // 기존 방에서 제거
    Object.keys(nx).forEach(r=>{
      if(nx[r]?.[gidx]?.name===u.name) delete nx[r][gidx];
    });
    if(!nx[rIdx]) nx[rIdx]=[];
    nx[rIdx][gidx]=u;
    setAssigned(nx);
    setButtonClicked(prev=>({...prev,[i]:true}));
  };

  const calculateRoomTotal = (room)=>
    (room||[]).reduce((s,p)=>{
      const c = Number(scores[p.name?.trim().toLowerCase()]||0);
      return s + (c - Number(p.ghandi||0));
    },0);

  return (
    <div style={{ padding:20 }}>
      <div style={{ marginBottom:10 }}>
        <label style={{ fontSize:24, fontWeight:'bold' }}>페이지 제목:&nbsp;</label>
        <input
          type="text"
          value={topTitle}
          onChange={e=>setTopTitle(e.target.value)}
          style={{ fontSize:24, width:400, marginLeft:10 }}
        />
      </div>
      <h1 style={{ fontSize:24, margin:'8px 0' }}>{topTitle}</h1>

      <div style={{ marginBottom:10, fontSize:18 }}>
        <label>방 개수:&nbsp;</label>
        <input
          type="number"
          min={1}
          max={10}
          value={roomCount}
          onChange={e=>setRoomCount(Number(e.target.value))}
          style={{ width:50, marginLeft:6 }}
        />
        <input
          key={uploadKey}
          type="file"
          accept=".xlsx"
          onChange={handleExcel}
          style={{ marginLeft:10 }}
        />
        <button onClick={autoAssign} style={{ marginLeft:10, fontSize:16 }}>자동배정</button>
        <button onClick={initParticipants} style={{ marginLeft:10, fontSize:16 }}>클리어</button>
      </div>

      <div style={{ marginBottom:20, fontSize:18, display:'flex', flexDirection:'column', alignItems:'center' }}>
        <h3>🏷 방 이름 수정</h3>
        {roomLabels.map((label,i)=>(
          <div key={i} style={{ marginBottom:5 }}>
            <label>
              {i+1}번 방 →&nbsp;
              <input
                type="text"
                value={label}
                onChange={e=>handleRoomLabelChange(i,e.target.value)}
                style={{ width:180, fontSize:16 }}
              />
            </label>
            &nbsp;<span style={{ color:'blue' }}>현재 {(assigned[i]||[]).filter(p=>p&&p.name).length}명</span>
            &nbsp;
            <label>
              <input
                type="checkbox"
                checked={!hiddenRooms[String(i)]}
                onChange={()=>toggleRoomVisibility(String(i))}
              />
              표시
            </label>
          </div>
        ))}
      </div>

      <div style={{ fontSize:18, display:'flex', flexDirection:'column', alignItems:'center' }}>
        <h3>👥 참가자 입력</h3>
        {participants.map((p,i)=>(
          <div key={i} style={{ display:'flex', gap:6, marginBottom:3 }}>
            <input
              placeholder="조"
              type="number"
              value={p.group}
              onChange={e=>handleInput(i,'group',e.target.value)}
              style={{ width:40,fontSize:16 }}
            />
            <input
              placeholder="닉네임"
              value={p.name}
              onChange={e=>handleInput(i,'name',e.target.value)}
              style={{ width:100,fontSize:16 }}
            />
            <input
              placeholder="G핸디"
              type="number"
              value={p.ghandi}
              onChange={e=>handleInput(i,'ghandi',e.target.value)}
              style={{ width:60,fontSize:16 }}
            />
            <input
              placeholder="스코어(+/-)"
              type="number"
              value={scores[p.name?.trim().toLowerCase()]||''}
              onChange={e=>handleScoreChange(p.name,e.target.value)}
              style={{ width:80,fontSize:16 }}
            />
            <button
              disabled={buttonClicked[i]}
              onClick={()=>assignIndividual(i)}
              style={{ fontSize:16 }}
            >
              {loadingIdx===i ? '⏳ 배정 중...' : '방배정'}
            </button>
            <select
              key={forceResetKey}
              defaultValue=""
              onChange={e=>forceAssign(i,Number(e.target.value))}
              style={{ fontSize:16 }}
            >
              <option value="">🔒강제배정</option>
              {roomLabels.map((_,ridx)=><option key={ridx} value={ridx}>{_}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div style={{ marginTop:30, fontSize:18, textAlign:'center' }}>
        <h3>🏠 방 배정 결과 (간단 합계)</h3>
        {roomLabels.map((label,i)=>(
          hiddenRooms[String(i)]? null : (
            <div key={i} style={{ display:'inline-block', border:'1px solid #aaa', padding:10, margin:10,textAlign:'left' }}>
              <strong>{label} (총점: {calculateRoomTotal(assigned[i])})</strong>
              <ul style={{ marginTop:5 }}>
                {(assigned[i]||[]).map((p,idx)=> {
                  const key = p?.name?.trim().toLowerCase();
                  const ch = parseInt(scores[key]||0,10);
                  const res = ch - Number(p.ghandi||0);
                  return <li key={idx}>
                    {p.name} | 조:{p.group} | G핸디:{displayGhandi(p.ghandi)} | 스코어:{ch>=0? '+'+ch:ch} | 결과:{res>=0? '+'+res:res}
                  </li>;
                })}
                {!assigned[i]?.length && <li>⏳ 아직 없음</li>}
              </ul>
            </div>
          )
        ))}
      </div>

      <div style={{ marginTop:30,fontSize:18 }}>
        <h3>📊 추가 출력 (표)</h3>
        <div style={{ marginBottom:10 }}>
          <button onClick={()=>setTableView("allocation")} style={{ fontSize:16, marginRight:10 }}>방배정표</button>
          <button onClick={()=>setTableView("final")} style={{ fontSize:16 }}>최종결과표</button>
        </div>
        <div style={tableContainerStyle}>
          {tableView==="allocation" && (
            <RoomAllocationTable
              rooms={assigned}
              roomLabels={roomLabels}
              hiddenRooms={hiddenRooms}
            />
          )}
          {tableView==="final" && (
            <FinalResultTable
              rooms={assigned}
              scores={scores}
              roomLabels={roomLabels}
              hiddenRooms={hiddenRooms}
              showScore
              showBanddang
              toggleRoomVisibility={(r)=>toggleRoomVisibility(r)}
              setShowScore={()=>{}}
              setShowBanddang={()=>{}}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
