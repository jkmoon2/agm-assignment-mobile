import React from "react";
import "../App.css";

export default function Step2RoomSetup({
  step, setStep,
  roomCount, setRoomCount,
  roomNames, setRoomNames
}) {
  return (
    <>
      <div className="step-header">
        <h3>{step}. 방 개수 및 방 이름 설정</h3>
      </div>
      <div className="step-body">
        <div className="room-count-selector">
          <button onClick={() => setRoomCount(c => Math.max(1, c - 1))}>–</button>
          {[3,4,5,6,7,8].map(n => (
            <button
              key={n}
              className={roomCount === n ? "active" : ""}
              onClick={() => setRoomCount(n)}
            >{n}개</button>
          ))}
          <button onClick={() => setRoomCount(c => c + 1)}>＋</button>
        </div>
        <div className="room-names">
          {roomNames.map((name, i) => (
            <div key={i} className="room-name-row">
              <label>방 {i+1}:</label>
              <input
                type="text"
                value={name}
                onChange={e => {
                  const copy = [...roomNames];
                  copy[i] = e.target.value;
                  setRoomNames(copy);
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="step-footer">
        <button onClick={() => setStep(1)}>← 이전</button>
        <button onClick={() => setStep(3)}>다음 →</button>
      </div>
    </>
  );
}
