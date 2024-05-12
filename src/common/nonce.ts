var last = 0;

export default function (): number {
  var repeat = 0,
    length = 15;

  var now = Math.pow(10, 2) * +new Date();

  if (now == last) {
    repeat++;
  } else {
    repeat = 0;
    last = now;
  }

  var s = (now + repeat).toString();
  return +s.substring(s.length - length);
}
