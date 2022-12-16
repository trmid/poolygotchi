export default function ifEnter(cb: () => void) {
  return (e: KeyboardEvent) => { if(e.key === 'Enter') cb() };
}