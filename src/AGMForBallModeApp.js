
// src/AGMForBallModeApp.js

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

// ===== 스타일 정의 (스트로크 방식과 유사) =====
const containerStyle = { padding: 20 };
const tableContainerStyle = {
  overflowX: "auto",
  marginTop: "20px",
  marginBottom: "20px"
};
const tableStyle = {
  borderCollapse: "collapse",
  width: "100%",
  tableLayout: "fixed"
};
const baseCellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};
const headerStyle = {
  ...baseCellStyle,
  backgroundColor: "#f0f0f0",
  fontWeight: "bold",
  fontSize: "18px"
};
const footerStyle = {
  ...baseCellStyle,
  backgroundColor: "#e8e8e8",
  fontWeight: "bold"
};
// 예시: 닉네임 열: 160px, 나머지 열: 40px
const colWidths = {
  nickname: 160,
  small: 40
};

// 글자 길이에 따라 폰트 크기 자동 조절
function fitFontSize(text = "", maxLen = 10, baseSize = 18, minSize = 14) {
  if (text.length <= maxLen) return { fontSize: `${baseSize}px` };
  const ratio = maxLen / text.length;
  const newSize = Math.max(minSize, Math.floor(baseSize * ratio));
  return { fontSize: `${newSize}px` };
}
function displayGhandi(val) {
  if (val === 0 || val === "0") return "0";
  return val;
}
// 배열 무작위 섞기
function shuffle(arr) {
  if (!arr || arr.length === 0) return [];
  return arr
    .map(item => [item, Math.random()])
    .sort((a, b) => a[1] - b[1])
    .map(pair => pair[0]);
}

function AGMForBallModeApp() {
  // 페이지 제목
  const [topTitle, setTopTitle] = useState("AGM 포볼 모드");
  // 참가자: { group, name, ghandi }
  const [participants, setParticipants] = useState([]);
  const [scores, setScores] = useState({});
  // 방 개수 (기본 4방, 총 참가자 = roomCount * 4)
  const [roomCount, setRoomCount] = useState(4);
  // 방 이름 (기본: "1번 방", "2번 방", …)
  const [roomLabels, setRoomLabels] = useState([]);
  // 방배정 결과: roomAssignments[i] = i번째 방에 배정된 참가자 배열 (최대 4명)
  const [roomAssignments, setRoomAssignments] = useState([]);
  // 1조 버튼 클릭 상태: { [index]: { room: bool, team: bool } }
  const [buttonClicked, setButtonClicked] = useState({});
  // 파일 업로드 리셋용 key (클리어 후 재업로드 가능)
  const [uploadKey, setUploadKey] = useState(0);
  // 하단 표 출력 모드: "none", "allocation", "final", "team"
  const [tableView, setTableView] = useState("none");
  // 방 숨김 토글 (체크박스로 방별 표시 여부)
  const [hiddenRooms, setHiddenRooms] = useState({});
  // 최종결과표: 스코어/반땅 표시 토글
  const [showScore, setShowScore] = useState(true);
  const [showBanddang, setShowBanddang] = useState(true);
  // 버튼 클릭 시 로딩 상태: { idx: 번호, type: "room" 또는 "team" }
  const [loadingIndex, setLoadingIndex] = useState(null);

  useEffect(() => {
    const defaults = Array.from({ length: roomCount }, (_, i) => `${i + 1}번 방`);
    setRoomLabels(defaults);
    setRoomAssignments(Array.from({ length: roomCount }, () => []));
    setParticipants(Array(roomCount * 4).fill({ group: "", name: "", ghandi: "" }));
    setScores({});
    setButtonClicked({});
    setHiddenRooms({});
    setShowScore(true);
    setShowBanddang(true);
    setTableView("none");
    setUploadKey(prev => prev + 1);
  }, [roomCount]);

  // ---------------------------
  // 엑셀 업로드 (엑셀 파일은 group, name, ghandi 순)
  // ---------------------------
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const cleaned = data.slice(1).map(row => ({
        group: Number(row[0] || 0),
        name: row[1] || "",
        ghandi: row[2] === 0 ? 0 : (row[2] || "")
      }));
      setParticipants(cleaned);
      setRoomAssignments(Array.from({ length: roomCount }, () => []));
      setScores({});
      setButtonClicked({});
      setHiddenRooms({});
      setTableView("none");
    };
    reader.readAsBinaryString(file);
  };

  // ---------------------------
  // 참가자 입력 처리
  // ---------------------------
  const handleInput = (idx, key, val) => {
    const updated = [...participants];
    updated[idx][key] =
      val === "" ? "" : (key === "ghandi" || key === "group") ? Number(val) : val;
    setParticipants(updated);
  };

  // ---------------------------
  // 스코어 입력 처리
  // ---------------------------
  const handleScoreChange = (name, val) => {
    setScores(prev => ({ ...prev, [name]: val }));
  };

  // ---------------------------
  // 방 이름 수정
  // ---------------------------
  const handleRoomLabelChange = (idx, val) => {
    const copy = [...roomLabels];
    copy[idx] = val;
    setRoomLabels(copy);
  };

  // ---------------------------
  // 클리어 버튼
  // ---------------------------
  const clearAGM = () => {
    setParticipants(Array(roomCount * 4).fill({ group: "", name: "", ghandi: "" }));
    setScores({});
    setRoomAssignments(Array.from({ length: roomCount }, () => []));
    setButtonClicked({});
    setHiddenRooms({});
    setShowScore(true);
    setShowBanddang(true);
    setTableView("none");
    setUploadKey(prev => prev + 1);
  };

  // ---------------------------
  // 이미 배정된 참가자인지 확인
  // ---------------------------
  const isAssigned = (u) => {
    for (const arr of roomAssignments) {
      if (arr.find(x => x.name === u.name)) return true;
    }
    return false;
  };

  // ---------------------------
  // 1조: "방 선택" 버튼
  // ---------------------------
  const handleRoomSelect = (idx) => {
    const user = participants[idx];
    if (user.group !== 1) return;
    if (buttonClicked[idx]?.room) return;
    const availableRooms = roomAssignments
      .map((arr, i) => (arr.length < 4 ? i : null))
      .filter(v => v !== null);
    if (availableRooms.length === 0) {
      alert("모든 방이 가득 찼습니다.");
      return;
    }
    setLoadingIndex({ idx, type: "room" });
    const r = shuffle(availableRooms)[0];
    setRoomAssignments(prev => {
      const copy = [...prev];
      copy[r] = [...copy[r], user];
      return copy;
    });
    setButtonClicked(prev => ({
      ...prev,
      [idx]: { ...(prev[idx] || {}), room: true }
    }));
    setTimeout(() => {
      setLoadingIndex(null);
      alert("방 선택 완료! 이제 '팀원 선택' 버튼을 눌러주세요.");
    }, 1200);
  };

  // ---------------------------
  // 1조: "팀원 선택" 버튼
  // ---------------------------
  const handleTeamSelect = (idx) => {
    const user1 = participants[idx];
    if (user1.group !== 1) return;
    if (buttonClicked[idx]?.team) return;
    let roomIdx = -1;
    roomAssignments.forEach((arr, i) => {
      if (arr.find(u => u.name === user1.name)) roomIdx = i;
    });
    if (roomIdx === -1) {
      alert("먼저 '방 선택'을 해야 합니다.");
      return;
    }
    if (roomAssignments[roomIdx].length >= 4) {
      alert("이 방은 이미 4명으로 가득 찼습니다.");
      return;
    }
    const group2NotAssigned = participants.filter(p => p.group === 2 && !isAssigned(p));
    if (group2NotAssigned.length === 0) {
      alert("배정 가능한 2조 사용자가 없습니다.");
      return;
    }
    setLoadingIndex({ idx, type: "team" });
    const picked = shuffle(group2NotAssigned)[0];
    setRoomAssignments(prev => {
      const copy = [...prev];
      copy[roomIdx] = [...copy[roomIdx], picked];
      return copy;
    });
    setButtonClicked(prev => ({
      ...prev,
      [idx]: { ...(prev[idx] || {}), team: true }
    }));
    setTimeout(() => {
      setLoadingIndex(null);
      alert("팀원 선택 완료! 결과를 확인하세요.");
    }, 1200);
  };

  // ---------------------------
  // 자동 배정 (AGM 포볼 방식)
  // ---------------------------
  const autoAssignAGM = () => {
    const unassignedGroup1 = participants.filter(p => p.group === 1 && !isAssigned(p));
    const unassignedGroup2 = participants.filter(p => p.group === 2 && !isAssigned(p));
    const pairCount = Math.min(unassignedGroup1.length, unassignedGroup2.length);
    if (pairCount === 0) {
      alert("자동 배정할 추가 참가자가 없습니다.");
      return;
    }
    const sh1 = shuffle(unassignedGroup1).slice(0, pairCount);
    const sh2 = shuffle(unassignedGroup2).slice(0, pairCount);
    const newRooms = roomAssignments.map(room => [...room]);
    let pairIndex = 0;
    for (let i = 0; i < roomCount; i++) {
      while (newRooms[i].length <= 2 && newRooms[i].length < 4 && pairIndex < pairCount) {
        newRooms[i].push(sh1[pairIndex]);
        newRooms[i].push(sh2[pairIndex]);
        pairIndex++;
      }
    }
    setRoomAssignments(newRooms);
    alert("자동 배정 완료! 수동 배정 내용은 유지하고 나머지를 자동 배정했습니다.");
  };

  // ---------------------------
  // 간단 합계 출력
  // ---------------------------
  function renderSimpleAssignmentResult() {
    return (
      <div>
        {roomLabels.map((label, i) => {
          if (hiddenRooms[i]) return null;
          const arr = roomAssignments[i] || [];
          const sum = arr.reduce((acc, p) => {
            const sc = Number(scores[p.name] || 0) - Number(p.ghandi || 0);
            return acc + sc;
          }, 0);
          return (
            <div key={i} style={{ display: 'inline-block', border: '1px solid #aaa', padding: 10, margin: 10, textAlign: 'left' }}>
              <strong>
                {label} (총점: {sum})
              </strong>
              <ul style={{ marginTop: 5 }}>
                {arr.length > 0 ? (
                  arr.map((p, idx) => {
                    const sc = Number(scores[p.name] || 0);
                    const r = sc - Number(p.ghandi || 0);
                    return (
                      <li key={idx}>
                        {p.name} | 조: {p.group} | G핸디: {p.ghandi} | 스코어: {sc >= 0 ? "+" + sc : sc} | 결과: {r >= 0 ? "+" + r : r}
                      </li>
                    );
                  })
                ) : (
                  <li>아직 없음</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    );
  }

  // ---------------------------
  // 방배정표 (푸터 부분에서 G핸디 합계 로직 수정)
  // ---------------------------
  function renderAllocationTable() {
    return (
      <div style={tableContainerStyle}>
        <h3>방배정표 (스트로크 방식)</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              {roomLabels.map((label, i) => {
                if (hiddenRooms[i]) return null;
                return (
                  <th
                    key={i}
                    colSpan={2}
                    style={{ ...headerStyle, width: colWidths.nickname + colWidths.small }}
                  >
                    {label}
                  </th>
                );
              })}
            </tr>
            <tr>
              {roomLabels.map((label, i) => {
                if (hiddenRooms[i]) return null;
                return (
                  <React.Fragment key={i}>
                    <th style={{ ...headerStyle, width: colWidths.nickname }}>닉네임</th>
                    <th style={{ ...headerStyle, width: colWidths.small }}>G핸디</th>
                  </React.Fragment>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {roomLabels.map((label, i) => {
                  if (hiddenRooms[i]) return null;
                  const arr = roomAssignments[i] || [];
                  const p = arr[rowIndex];
                  return (
                    <React.Fragment key={`${i}-${rowIndex}`}>
                      <td style={baseCellStyle}>{p ? p.name : ""}</td>
                      <td style={{ ...baseCellStyle, color: "blue" }}>
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
              {roomLabels.map((label, i) => {
                if (hiddenRooms[i]) return null;
                const arr = roomAssignments[i] || [];
                // 수정된 합계: 순수 G핸디 값만 합산
                const sum = arr.reduce((acc, p) => acc + Number(p.ghandi || 0), 0);
                return (
                  <React.Fragment key={i}>
                    <td style={{ ...footerStyle, textAlign: "center", color: "black" }}>
                      합계
                    </td>
                    <td style={{ ...footerStyle, textAlign: "center", color: "blue" }}>
                      {sum}
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

  // ---------------------------
  // 최종결과표 (스트로크 방식)
  // - 기존 정상 코드 그대로 유지
  // ---------------------------
  function renderFinalResultTable() {
    const roomData = [];
    for (let i = 0; i < roomCount; i++) {
      if (hiddenRooms[i]) continue;
      const arr = roomAssignments[i] || [];
      if (arr.length === 0) {
        roomData.push({
          roomIndex: i,
          finalScores: [],
          banddangSum: 0,
          total: 0,
          ghandiSum: 0
        });
        continue;
      }
      let highestIndex = -1;
      let highestScore = -Infinity;
      let banddangSum = 0;
      let total = 0;
      let ghandiSum = 0;
      const finalScores = arr.map((p, idx) => {
        const sc = Number(scores[p.name] || 0);
        if (sc > highestScore) {
          highestScore = sc;
          highestIndex = idx;
        }
        return { p, sc, banddang: 0, result: 0 };
      });
      finalScores.forEach(fs => {
        ghandiSum += Number(fs.p.ghandi || 0);
      });
      finalScores.forEach((fs, idx) => {
        fs.bandang = idx === highestIndex && showBanddang ? Math.floor(fs.sc * 0.5) : fs.sc;
        fs.result = fs.bandang - Number(fs.p.ghandi || 0);
        banddangSum += fs.bandang;
        total += fs.result;
      });
      roomData.push({
        roomIndex: i,
        finalScores,
        banddangSum,
        total,
        ghandiSum
      });
    }

    // 정렬: total 오름차순, 동점이면 ghandiSum 낮은 순
    const sorted = [...roomData].sort((a, b) => {
      const diff = a.total - b.total;
      if (diff !== 0) return diff;
      return a.ghandiSum - b.ghandiSum;
    });
    sorted.forEach((rd, idx) => {
      rd.rank = idx + 1;
    });
    roomData.sort((a, b) => a.roomIndex - b.roomIndex);
    roomData.forEach(rd => {
      const found = sorted.find(s => s.roomIndex === rd.roomIndex);
      rd.rank = found ? found.rank : null;
    });

    return (
      <div style={tableContainerStyle}>
        <h3>최종결과표 (스트로크 방식)</h3>
        <div style={{ marginBottom: 10, fontSize: "16px" }}>
          <h4>방별 표시/숨김</h4>
          {roomLabels.map((label, i) => (
            <label key={i} style={{ marginRight: 10 }}>
              <input
                type="checkbox"
                checked={!hiddenRooms[i]}
                onChange={() => setHiddenRooms(prev => ({ ...prev, [i]: !prev[i] }))}
              />
              {label}
            </label>
          ))}
          <div style={{ marginTop: 10 }}>
            <label style={{ marginRight: 10 }}>
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
              {roomData.map(rd => {
                const colCount = 2 + (showScore ? 1 : 0) + (showBanddang ? 1 : 0) + 1;
                return (
                  <th key={rd.roomIndex} colSpan={colCount} style={headerStyle}>
                    {roomLabels[rd.roomIndex]}
                  </th>
                );
              })}
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
                  const colCount = 2 + (showScore ? 1 : 0) + (showBanddang ? 1 : 0) + 1;
                  const fs = rd.finalScores[rowIndex];
                  if (!fs) {
                    return (
                      <React.Fragment key={rd.roomIndex + "-" + rowIndex}>
                        {Array.from({ length: colCount }).map((_, c) => (
                          <td key={c} style={baseCellStyle}></td>
                        ))}
                      </React.Fragment>
                    );
                  }
                  return (
                    <React.Fragment key={rd.roomIndex + "-" + rowIndex}>
                      <td style={{ ...baseCellStyle, ...fitFontSize(fs.p.name, 10, 18, 14) }}>
                        {fs.p.name}
                      </td>
                      <td style={baseCellStyle}>{displayGhandi(fs.p.ghandi)}</td>
                      {showScore && (
                        <td style={baseCellStyle}>
                          {fs.sc >= 0 ? "+" + fs.sc : fs.sc}
                        </td>
                      )}
                      {showBanddang && (
                        <td style={{ ...baseCellStyle, color: "blue" }}>
                          {fs.bandang >= 0 ? "+" + fs.bandang : fs.bandang}
                        </td>
                      )}
                      <td style={{ ...baseCellStyle, color: "red" }}>
                        {fs.result >= 0 ? "+" + fs.result : fs.result}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            {/* 첫 번째 행: 결과 합계 (빨간색) → 결과 열에 위치 */}
            <tr>
              {roomData.map(rd => {
                const colCount = 2 + (showScore ? 1 : 0) + (showBanddang ? 1 : 0) + 1;
                return (
                  <React.Fragment key={rd.roomIndex}>
                    {Array.from({ length: colCount - 1 }).map((_, c) => (
                      <td key={c} style={footerStyle}></td>
                    ))}
                    <td style={{ ...footerStyle, color: "red" }}>{rd.total}</td>
                  </React.Fragment>
                );
              })}
            </tr>
            {/* 두 번째 행: 등수 (파란색) */}
            <tr>
              {roomData.map(rd => {
                const colCount = 2 + (showScore ? 1 : 0) + (showBanddang ? 1 : 0) + 1;
                return (
                  <React.Fragment key={rd.roomIndex}>
                    {Array.from({ length: colCount - 1 }).map((_, c) => (
                      <td key={c} style={footerStyle}></td>
                    ))}
                    <td style={{ ...footerStyle, color: "blue", fontWeight: "bold" }}>
                      {rd.rank ? rd.rank + "등" : ""}
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

  // ---------------------------
  // 팀결과표 (포볼 방식; 기존 정상 출력 코드, 단 방번호 병합 적용)
  // ---------------------------
  function renderTeamResultTable() {
    const teams = [];
    for (let i = 0; i < roomCount; i++) {
      const arr = roomAssignments[i] || [];
      const group1List = arr.filter(p => p.group === 1);
      const group2List = arr.filter(p => p.group === 2);
      const teamCount = Math.min(group1List.length, group2List.length);
      for (let t = 0; t < teamCount; t++) {
        const p1 = group1List[t];
        const p2 = group2List[t];
        const sc1 = Number(scores[p1.name] || 0);
        const r1 = sc1 - Number(p1.ghandi || 0);
        const sc2 = Number(scores[p2.name] || 0);
        const r2 = sc2 - Number(p2.ghandi || 0);
        const teamTotal = r1 + r2;
        const teamGhandiSum = Number(p1.ghandi || 0) + Number(p2.ghandi || 0);
        teams.push({
          roomIndex: i,
          roomName: roomLabels[i],
          team: t + 1,
          nickname: p1.name + " / " + p2.name,
          ghandi: p1.ghandi + " / " + p2.ghandi,
          score:
            (sc1 >= 0 ? "+" + sc1 : sc1) + " / " + (sc2 >= 0 ? "+" + sc2 : sc2),
          result:
            (r1 >= 0 ? "+" + r1 : r1) + " / " + (r2 >= 0 ? "+" + r2 : r2),
          total: teamTotal,
          ghandiSum: teamGhandiSum,
          rank: 0
        });
      }
    }
    // 팀 순위 결정: 총점 오름차순, 동점 시 G핸디 합 낮은 순
    teams.sort((a, b) => {
      const diff = a.total - b.total;
      if (diff !== 0) return diff;
      return a.ghandiSum - b.ghandiSum;
    });
    teams.forEach((team, idx) => {
      team.rank = idx + 1;
    });
    // 방번호 오름차순으로 그룹핑
    const roomGroups = {};
    teams.forEach(team => {
      const rIdx = team.roomIndex; // Ensure numeric
      if (!roomGroups[rIdx]) roomGroups[rIdx] = [];
      roomGroups[rIdx].push(team);
    });
    const rows = [];
    Object.keys(roomGroups)
      .sort((a, b) => Number(a) - Number(b))
      .forEach(roomIdx => {
        const group = roomGroups[roomIdx];
        group.forEach((teamObj, idx) => {
          rows.push({
            showRoom: idx === 0,
            roomRowSpan: group.length,
            roomName: teamObj.roomName,
            nickname: teamObj.nickname,
            ghandi: teamObj.ghandi,
            score: teamObj.score,
            result: teamObj.result,
            total: teamObj.total,
            rank: teamObj.rank
          });
        });
      });

    return (
      <div style={tableContainerStyle}>
        <h3>팀결과표 (포볼, 병합 적용)</h3>
        {rows.length === 0 ? (
          <p>아직 팀 구성 없음</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerStyle}>방번호</th>
                <th style={headerStyle}>닉네임</th>
                <th style={headerStyle}>G핸디</th>
                <th style={headerStyle}>스코어</th>
                <th style={headerStyle}>결과</th>
                <th style={headerStyle}>총점</th>
                <th style={headerStyle}>순위</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  {row.showRoom && (
                    <td style={baseCellStyle} rowSpan={row.roomRowSpan}>
                      {row.roomName}
                    </td>
                  )}
                  <td style={baseCellStyle}>{row.nickname}</td>
                  <td style={baseCellStyle}>{row.ghandi}</td>
                  <td style={baseCellStyle}>{row.score}</td>
                  <td style={{ ...baseCellStyle, color: "blue" }}>{row.result}</td>
                  <td style={{ ...baseCellStyle, color: "red" }}>{row.total}</td>
                  <td style={{ ...baseCellStyle, color: "blue", fontWeight: "bold" }}>{row.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // ---------------------------
  // 메인 렌더링
  // ---------------------------
  return (
    <div style={containerStyle}>
      {/* 페이지 제목 */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: "24px", fontWeight: "bold" }}>페이지 제목: </label>
        <input
          type="text"
          value={topTitle}
          onChange={e => setTopTitle(e.target.value)}
          style={{ fontSize: "24px", width: "400px", marginLeft: "10px" }}
        />
      </div>
      <h1 style={{ fontSize: "24px", margin: "8px 0" }}>{topTitle}</h1>

      {/* 상단 제어 영역 */}
      <div style={{ marginBottom: 10, fontSize: "18px" }}>
        <label>방 개수: </label>
        <input
          type="number"
          min={1}
          max={10}
          value={roomCount}
          onChange={e => setRoomCount(Number(e.target.value))}
          style={{ width: 50, marginLeft: 6 }}
        />
        <input
          key={uploadKey}
          type="file"
          accept=".xlsx"
          onChange={handleExcelUpload}
          style={{ marginLeft: 10 }}
        />
        <button onClick={autoAssignAGM} style={{ marginLeft: 10, fontSize: "16px" }}>
          자동배정
        </button>
        <button onClick={clearAGM} style={{ marginLeft: 10, fontSize: "16px" }}>
          클리어
        </button>
      </div>

      {/* 방 이름 수정 및 숨김 토글 */}
      <div style={{ marginBottom: 20, fontSize: "18px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h3>🏷 방 이름 수정</h3>
        {roomLabels.map((label, i) => (
          <div
            key={i}
            style={{ marginBottom: 5, display: "flex", gap: 10, alignItems: "center" }}
          >
            <label>
              {i + 1}번 방 →&nbsp;
              <input
                type="text"
                value={label}
                onChange={e => handleRoomLabelChange(i, e.target.value)}
                style={{ width: "180px", fontSize: "16px" }}
              />
              &nbsp;(현재 {roomAssignments[i] ? roomAssignments[i].length : 0}명)
            </label>
            <label style={{ fontSize: "14px" }}>
              <input
                type="checkbox"
                checked={!hiddenRooms[i]}
                onChange={() => setHiddenRooms(prev => ({ ...prev, [i]: !prev[i] }))}
              />
              표시
            </label>
          </div>
        ))}
      </div>

      {/* 참가자 입력 */}
      <div style={{ fontSize: "18px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h3>👥 참가자 입력 (조: 1이면 1조, 2이면 2조)</h3>
        {participants.map((p, i) => {
          const isGroup1 = p.group === 1;
          const clickedRoom = buttonClicked[i]?.room;
          const clickedTeam = buttonClicked[i]?.team;
          return (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
              <input
                placeholder="조"
                type="number"
                value={p.group}
                onChange={e => handleInput(i, "group", e.target.value)}
                style={{ width: 40, fontSize: "16px" }}
              />
              <input
                placeholder="닉네임"
                value={p.name}
                onChange={e => handleInput(i, "name", e.target.value)}
                style={{ width: 100, fontSize: "16px" }}
              />
              <input
                placeholder="G핸디"
                type="number"
                value={p.ghandi}
                onChange={e => handleInput(i, "ghandi", e.target.value)}
                style={{ width: 60, fontSize: "16px" }}
              />
              <input
                placeholder="스코어(+/-)"
                type="number"
                value={scores[p.name] || ""}
                onChange={e => handleScoreChange(p.name, e.target.value)}
                style={{ width: 80, fontSize: "16px" }}
              />
              {isGroup1 && (
                <>
                  <button
                    disabled={clickedRoom}
                    onClick={() => handleRoomSelect(i)}
                    style={{ fontSize: "16px" }}
                  >
                    {loadingIndex && loadingIndex.idx === i && loadingIndex.type === "room"
                      ? "⏳ 배정 중..."
                      : "방 선택"}
                  </button>
                  <button
                    disabled={clickedTeam}
                    onClick={() => handleTeamSelect(i)}
                    style={{ fontSize: "16px" }}
                  >
                    {loadingIndex && loadingIndex.idx === i && loadingIndex.type === "team"
                      ? "⏳ 배정 중..."
                      : "팀원 선택"}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 간단 합계 */}
      <div style={{ marginTop: 30 }}>
        <h3>🏠 방 배정 결과 (간단 합계)</h3>
        {renderSimpleAssignmentResult()}
      </div>

      {/* 하단 표 출력 영역 */}
      <div style={{ marginTop: 30, fontSize: "18px", textAlign: 'center' }}>
        <h3>📊 추가 출력 (표)</h3>
        <div style={{ marginBottom: 10 }}>
          <button onClick={() => setTableView("allocation")} style={{ fontSize: "16px", marginRight: 6 }}>
            방배정표
          </button>
          <button onClick={() => setTableView("final")} style={{ fontSize: "16px", marginRight: 6 }}>
            최종결과표
          </button>
          <button onClick={() => setTableView("team")} style={{ fontSize: "16px", marginLeft: 10 }}>
            팀결과표
          </button>
        </div>
        <div style={tableContainerStyle}>
          {tableView === "allocation" && renderAllocationTable()}
          {tableView === "final" && renderFinalResultTable()}
          {tableView === "team" && renderTeamResultTable()}
        </div>
      </div>
    </div>
  );
}

export default AGMForBallModeApp;
