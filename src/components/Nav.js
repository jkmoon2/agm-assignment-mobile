import React from "react";

export default function Nav({ prev, next }) {
  return (
    <div className="navigation nav-global">
      {prev && <button onClick={prev}>← 이전</button>}
      {next && <button onClick={next}>다음 →</button>}
    </div>
  );
}
