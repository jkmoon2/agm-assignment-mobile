// src/components/RoomConfig.js
import React, { useEffect } from "react";

export default function RoomConfig({
  roomCount,
  setRoomCount,
  roomNames,
  setRoomNames,
}) {
  // 자주 쓰는 옵션
  const presets = [3, 4, 5, 6, 7];

  // roomCount에 맞춰 roomNames 자동 증감
  useEffect(() => {
    if (roomNames.length < roomCount) {
      setRoomNames((prev) => [
        ...prev,
        ...Array(roomCount - prev.length)
          .fill("")
          .map((_, i) => `방${prev.length + i + 1}`),
      ]);
    } else if (roomNames.length > roomCount) {
      setRoomNames((prev) => prev.slice(0, roomCount));
    }
  }, [roomCount, roomNames, setRoomNames]);

  const updateName = (idx, val) => {
    const arr = [...roomNames];
    arr[idx] = val;
    setRoomNames(arr);
  };

  return (
    <div className="step">
      <h2>2. 방 개수 및 방 이름 설정</h2>

      {/* 1) 토글 프리셋 */}
      <div className="room-count-presets">
        {presets.map((n) => (
          <button
            key={n}
            className={roomCount === n ? "active" : ""}
            onClick={() => setRoomCount(n)}
          >
            {n}개
          </button>
        ))}
        {/* 2) 증감 버튼 */}
        <button onClick={() => setRoomCount(roomCount - 1)} disabled={roomCount <= 1}>
          −
        </button>
        <button onClick={() => setRoomCount(roomCount + 1)}>
          +
        </button>
      </div>

      {/* 3) 방 이름 리스트 */}
      <div className="room-names">
        {roomNames.map((name, idx) => (
          <div className="room-name-row" key={idx}>
            <label>방 {idx + 1}:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => updateName(idx, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
