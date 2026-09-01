import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function useCanonical() {
  const location = useLocation();

  useEffect(() => {
    const href = `${window.location.origin}${location.pathname}`;
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }, [location.pathname]);
}
