// 공통 유틸 함수 모음

// 배열 무작위 섞기
export function shuffle(arr) {
  return arr
    .map(v => [v, Math.random()])
    .sort((a, b) => a[1] - b[1])
    .map(pair => pair[0]);
}

// 안전한 숫자 변환
export function toNumberSafe(val) {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

// 글자 길이에 따라 폰트 크기 조절
export function fitFontSize(text = "", maxLen = 10, baseSize = 18, minSize = 14) {
  if (text.length <= maxLen) return { fontSize: `${baseSize}px` };
  const ratio = maxLen / text.length;
  const newSize = Math.max(minSize, Math.floor(baseSize * ratio));
  return { fontSize: `${newSize}px` };
}

// G핸디 표시 (0이면 "0")
export function displayHandicap(val) {
  return toNumberSafe(val) === 0 ? "0" : val;
}

// 애니메이션/딜레이용 sleep
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
