import { useEffect, useRef, useState } from 'react';
import { RiTimeLine } from 'react-icons/ri';

interface TimerProps {
  durationMinutes: number;
  onExpire: () => void;
}

export default function Timer({ durationMinutes, onExpire }: TimerProps) {
  const total = durationMinutes * 60;
  const [secs, setSecs] = useState(total);
  const cb = useRef(onExpire);
  cb.current = onExpire;

  useEffect(() => {
    const id = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) { clearInterval(id); cb.current(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mm = Math.floor(secs / 60).toString().padStart(2, '0');
  const ss = (secs % 60).toString().padStart(2, '0');
  const cls = secs < 60 ? 'timer danger' : secs < 300 ? 'timer warning' : 'timer';

  return (
    <span className={cls}>
      <RiTimeLine size={15} />
      {mm}:{ss}
    </span>
  );
}
