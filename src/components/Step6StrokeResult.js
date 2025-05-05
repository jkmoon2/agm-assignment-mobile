import React from "react";
import "../App.css";

export default function Step6StrokeResult({
  assigned, roomNames, onPrev, onDone
}) {
  const sumHandicap = (arr=[]) =>
    arr.reduce((acc,p)=>acc + Number(p.handicap||0), 0);

  return (
    <>
      <div className="step-header">
        <h3>6. 스트로크 결과 확인</h3>
      </div>
      <div className="step-body">
        <div style={{ overflowX:"auto", flex:1 }}>
          <table className="result-table">
            <thead>
              <tr>
                {roomNames.map((nm,i)=>(
                  <th key={i} colSpan={2}>{nm}</th>
                ))}
              </tr>
              <tr>
                {roomNames.map((_,i)=>(
                  <React.Fragment key={i}>
                    <th>닉네임</th>
                    <th>G핸디</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({length:4}).map((_,r)=>(
                <tr key={r}>
                  {roomNames.map((_,i)=>(
                    <React.Fragment key={i}>
                      <td>{assigned[i]?.[r]?.nickname||""}</td>
                      <td style={{color:"blue"}}>
                        {assigned[i]?.[r]?.handicap!=null
                          ? assigned[i][r].handicap
                          : ""}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                {roomNames.map((_,i)=>(
                  <React.Fragment key={i}>
                    <td style={{fontWeight:"bold"}}>합계</td>
                    <td style={{fontWeight:"bold",color:"blue"}}>
                      {sumHandicap(assigned[i])}
                    </td>
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
