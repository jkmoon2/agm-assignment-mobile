import React from "react";
import "../App.css";

export default function Step8AGMResult({
  assigned, roomNames, scores, onPrev, onDone
}) {
  // 팀별 데이터 생성
  const teams = [];
  Object.entries(assigned).forEach(([rIdx, arr]) => {
    const g1 = arr.filter(p=>p.group===1);
    const g2 = arr.filter(p=>p.group===2);
    const cnt = Math.min(g1.length, g2.length);
    for (let t = 0; t < cnt; t++) {
      const p1 = g1[t], p2 = g2[t];
      const sc1 = Number(scores[p1.nickname] ?? 0);
      const sc2 = Number(scores[p2.nickname] ?? 0);
      const r1 = sc1 - Number(p1.handicap);
      const r2 = sc2 - Number(p2.handicap);
      teams.push({
        room: +rIdx,
        name: `${p1.nickname} / ${p2.nickname}`,
        ghandi: `${p1.handicap} / ${p2.handicap}`,
        score: `${sc1>=0?`+${sc1}`:sc1} / ${sc2>=0?`+${sc2}`:sc2}`,
        result: `${r1>=0?`+${r1}`:r1} / ${r2>=0?`+${r2}`:r2}`,
        total: r1 + r2
      });
    }
  });
  // 순위 매기기
  teams.sort((a,b)=>{
    if (a.total !== b.total) return a.total - b.total;
    return a.ghandi.split(" / ").reduce((s,n)=>s+Number(n),0)
         - b.ghandi.split(" / ").reduce((s,n)=>s+Number(n),0);
  });
  teams.forEach((t,i)=> t.rank = i+1);

  // 방별 그룹핑
  const byRoom = teams.reduce((acc, t)=>{
    (acc[t.room]||=[]).push(t);
    return acc;
  }, {});

  return (
    <>
      <div className="step-header">
        <h3>8. AGM 포볼 결과표</h3>
      </div>
      <div className="step-body score-table-wrapper">
        {Object.entries(byRoom).map(([rIdx, rows]) => (
          <div key={rIdx} style={{ marginBottom: 12 }}>
            <h4>{+rIdx+1}번 방</h4>
            <div className="result-wrapper">
              <table className="result-table">
                <thead>
                  <tr>
                    <th>팀</th><th>닉네임</th><th>G핸디</th>
                    <th>스코어</th><th>결과</th><th>총점</th><th>순위</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t,i) => (
                    <tr key={i}>
                      <td>{i+1}</td>
                      <td>{t.name}</td>
                      <td>{t.ghandi}</td>
                      <td>{t.score}</td>
                      <td style={{ color:"blue" }}>{t.result}</td>
                      <td style={{ color:"red" }}>{t.total}</td>
                      <td style={{ color:"blue", fontWeight:"bold" }}>{t.rank}등</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
      <div className="step-footer">
        <button onClick={onPrev}>← 이전</button>
        <button onClick={onDone}>완료</button>
      </div>
    </>
  );
}
