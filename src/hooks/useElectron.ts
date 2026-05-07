/**
 * Detects whether the app is running inside an Electron renderer process
 * and identifies the host platform so the Navbar can reserve space for
 * the native window-control buttons (traffic lights on macOS, caption
 * buttons on Windows / Linux).
 */

export type ElectronPlatform = 'mac' | 'windows' | 'linux' | null;

export interface ElectronInfo {
  /** True when running inside an Electron renderer. */
  isElectron: boolean;
  /** Host platform, or null when not running in Electron. */
  platform: ElectronPlatform;
  /**
   * Pixels to reserve on the LEFT for window controls.
   * macOS places traffic-light buttons on the left (~72 px).
   */
  leftInset: number;
  /**
   * Pixels to reserve on the RIGHT for window controls.
   * Windows and Linux place caption buttons on the right (~138 px).
   */
  rightInset: number;
}

function detectPlatform(): ElectronPlatform {
  const ua = navigator.userAgent;
  // Electron exposes process.platform on window.process in some setups;
  // fall back to UA sniffing which is reliable for platform detection.
  const winProcess = (window as unknown as { process?: { platform?: string } }).process;
  const platformStr = winProcess?.platform ?? '';

  if (platformStr === 'darwin' || /Macintosh|MacIntel|MacPPC|Mac68K/i.test(ua)) return 'mac';
  if (platformStr === 'win32'  || /Win(dows|32|64|CE|95|98|NT|ME)/i.test(ua))   return 'windows';
  if (platformStr === 'linux'  || /Linux/i.test(ua))                              return 'linux';
  return null;
}

function buildInfo(): ElectronInfo {
  const isElectron = /Electron\//.test(navigator.userAgent);

  if (!isElectron) {
    return { isElectron: false, platform: null, leftInset: 0, rightInset: 0 };
  }

  const platform = detectPlatform();

  // macOS traffic-light buttons sit on the left; other platforms use the right.
  const leftInset  = platform === 'mac'                         ? 72 : 0;
  const rightInset = platform === 'windows' || platform === 'linux' ? 138 : 0;

  return { isElectron, platform, leftInset, rightInset };
}

// Compute once – the environment never changes at runtime.
const electronInfo = buildInfo();

export function useElectron(): ElectronInfo {
  return electronInfo;
}
