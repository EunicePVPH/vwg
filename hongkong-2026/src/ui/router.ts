import { useEffect, useState } from 'react';
const parse = () => (location.hash.replace(/^#\/?/, '') || 'home').split('/').filter(Boolean);
export function useRoute(): [string[], (to: string) => void] {
  const [r, setR] = useState<string[]>(parse());
  useEffect(() => {
    const h = () => setR(parse());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return [r, (to) => { location.hash = '/' + to; }];
}
export const go = (to: string) => { location.hash = '/' + to; };
