import React from "react";
import "../App.css";

export default function Step8AGMResult({
  assigned, roomNames, scores,
  onPrev, onDone
}) {
  // 팀별 데이터 생성
  const teams = [];
  roomNames.forEach((nm, ridx) => {
    const arr = assigned[ridx] || [];
    const g1 = arr.filter(p=>p.group===1);
    const g2 = arr.filter(p=>p.group===2);
    const count = Math.min(g1.length, g2.length);
    for (let t=0; t<count; t++) {
      const p1=g1[t], p2=g2[t];
      const sc1=Number(scores[p1.nickname]||0);
      const sc2=Number(scores[p2.nickname]||0);
      const r1=sc1 - Number(p1.handicap);
      const r2=sc2 - Number(p2.handicap);
      teams.push({
        roomIndex:ridx, roomName:nm,
        nickname:`${p1.nickname} / ${p2.nickname}`,
        ghandi:`${p1.handicap} / ${p2.handicap}`,
        score:`${sc1>=0? "+"+sc1:sc1} / ${sc2>=0? "+"+sc2:sc2}`,
        result:`${r1>=0? "+"+r1:r1} / ${r2>=0? "+"+r2:r2}`,
        total:r1+r2, ghandiSum:p1.handicap+p2.handicap
      });
    }
  });

  // 순위 부여
  const sorted = [...teams].sort((a,b)=>{
    if (a.total!==b.total) return a.total - b.total;
    return a.ghandiSum - b.ghandiSum;
  });
  sorted.forEach((t,i)=>t.rank=i+1);

  // 방별 묶기
  const rows = [];
  roomNames.forEach((_,ridx)=>{
    const group = teams.filter(t=>t.roomIndex===ridx);
    group.forEach((t,idx)=>{
      rows.push({
        showRoom: idx===0,
        rowSpan: group.length,
        ...t
      });
    });
  });

  return (
    <>
      <div className="step-header">
        <h3>8. AGM 포볼 결과표</h3>
      </div>
      <div className="step-body">
        <div style={{ overflowX:"auto", flex:1 }}>
          <table className="result-table">
            <thead>
              <tr>
                <th>방번호</th><th>닉네임</th><th>G핸디</th>
                <th>스코어</th><th>결과</th><th>총점</th><th>순위</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={i}>
                  {r.showRoom && (
                    <td rowSpan={r.rowSpan}>{r.roomName}</td>
                  )}
                  <td>{r.nickname}</td>
                  <td>{r.ghandi}</td>
                  <td>{r.score}</td>
                  <td style={{color:"blue"}}>{r.result}</td>
                  <td style={{color:"red"}}>{r.total}</td>
                  <td style={{color:"blue",fontWeight:"bold"}}>
                    {r.rank}등
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="step-footer">
        <button onClick={onPrev}>← 이전</button>
        <button onClick={onDone}>완료</button>
      </div>
    </>
  );
}
