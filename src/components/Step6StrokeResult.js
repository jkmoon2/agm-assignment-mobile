import React from "react";
import "../App.css";

export default function Step6StrokeResult({
  assigned, roomNames, scores, onPrev, onDone
}) {
  const rowCount = 4;
  const roomData = roomNames.map((name, idx) => {
    const arr = assigned[idx] || [];
    // 최고 스코어 인덱스
    let high = -Infinity, highIdx = -1;
    arr.forEach((p, i) => {
      const sc = Number(scores[p.nickname] ?? 0);
      if (sc > high) { high = sc; highIdx = i; }
    });
    // 반땅 & 결과 계산
    let totalResult = 0;
    const finalRows = Array.from({ length: rowCount }, (_, i) => {
      const p = arr[i] || { nickname: "", handicap: 0 };
      const sc = Number(scores[p.nickname] ?? 0);
      const band = (i === highIdx) ? Math.floor(sc * 0.5) : sc;
      const res = band - Number(p.handicap);
      totalResult += res;
      return { nickname: p.nickname, band, res };
    });
    return { roomName: name, rows: finalRows, totalResult };
  });

  return (
    <>
      <div className="step-header">
        <h3>6. 스트로크 결과표</h3>
      </div>
      <div className="step-body score-table-wrapper">
        <div className="result-wrapper">
          <table className="result-table">
            <thead>
              <tr>
                {roomData.map((rd, i) => (
                  <th key={i} colSpan={3}>{rd.roomName}</th>
                ))}
              </tr>
              <tr>
                {roomData.map((_, i) => (
                  <React.Fragment key={i}>
                    <th>닉네임</th><th>반땅</th><th>결과</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {roomData.map((rd, i) => {
                    const cell = rd.rows[rIdx];
                    return (
                      <React.Fragment key={i}>
                        <td>{cell.nickname}</td>
                        <td style={{ color: "blue" }}>
                          {cell.band>=0?`+${cell.band}`:cell.band}
                        </td>
                        <td style={{ color: "red" }}>
                          {cell.res>=0?`+${cell.res}`:cell.res}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                {roomData.map((rd, i) => (
                  <React.Fragment key={i}>
                    <td colSpan={2}>합계</td>
                    <td style={{ color: "red" }}>{rd.totalResult}</td>
                  </React.Fragment>
                ))}
              </tr>
            </tfoot>
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
