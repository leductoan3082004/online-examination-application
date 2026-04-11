/** Best-effort fullscreen helpers; behavior varies by browser (especially mobile Safari). */

export function isFullscreenActive(): boolean {
  return !!(
    document.fullscreenElement ||
    (document as unknown as { webkitFullscreenElement?: Element | null }).webkitFullscreenElement ||
    (document as unknown as { mozFullScreenElement?: Element | null }).mozFullScreenElement ||
    (document as unknown as { msFullscreenElement?: Element | null }).msFullscreenElement
  );
}

export async function enterFullscreen(): Promise<void> {
  const el = document.documentElement;
  const w = el as unknown as {
    requestFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => void;
    mozRequestFullScreen?: () => void;
    msRequestFullscreen?: () => void;
  };
  if (w.requestFullscreen) {
    await w.requestFullscreen();
    return;
  }
  if (w.webkitRequestFullscreen) {
    w.webkitRequestFullscreen();
    return;
  }
  if (w.mozRequestFullScreen) {
    w.mozRequestFullScreen();
    return;
  }
  if (w.msRequestFullscreen) {
    w.msRequestFullscreen();
    return;
  }
  throw new Error('Fullscreen API not supported');
}

export async function exitFullscreenSafe(): Promise<void> {
  try {
    const d = document as unknown as {
      exitFullscreen?: () => Promise<void>;
      webkitExitFullscreen?: () => void;
      mozCancelFullScreen?: () => void;
      msExitFullscreen?: () => void;
    };
    if (document.fullscreenElement && d.exitFullscreen) await d.exitFullscreen();
    else if (d.webkitExitFullscreen) d.webkitExitFullscreen();
    else if (d.mozCancelFullScreen) d.mozCancelFullScreen();
    else if (d.msExitFullscreen) d.msExitFullscreen();
  } catch {
    // ignore
  }
}
