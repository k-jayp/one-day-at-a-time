// postMessage RPC bridge — lets the iframe call Firestore methods on the parent app

let requestId = 0;
const pending = new Map<number, { resolve: (v: any) => void; reject: (e: Error) => void }>();

// Listen for responses from parent
window.addEventListener('message', (e) => {
  if (!e.data || e.data.source !== 'wdr-parent') return;
  const { id, result, error } = e.data;
  const p = pending.get(id);
  if (!p) return;
  pending.delete(id);
  if (error) {
    p.reject(new Error(error));
  } else {
    p.resolve(result);
  }
});

function callParent(method: string, args?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!isInIframe()) {
      console.warn('[bridge] Not in iframe, skipping', method);
      reject(new Error('Not running inside parent app'));
      return;
    }
    const id = ++requestId;
    console.log('[bridge] →', method, 'id=' + id, args || '');
    pending.set(id, {
      resolve: (v: any) => { console.log('[bridge] ←', method, 'id=' + id, JSON.stringify(v)?.slice(0, 200)); resolve(v); },
      reject: (e: Error) => { console.error('[bridge] ✗', method, 'id=' + id, e.message); reject(e); }
    });
    window.parent.postMessage({ source: 'wdr-challenges', id, method, args }, '*');
    // Timeout after 10s
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        console.error('[bridge] TIMEOUT', method, 'id=' + id);
        reject(new Error(`Bridge call "${method}" timed out`));
      }
    }, 10000);
  });
}

export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export interface GameData {
  reframeXP: number;
  reframeLevel: number;
  reframeLevelName: string;
  gameBadges: string[];
  reframeBadges: string[];
  reframeStats: {
    totalReframes: number;
    uniqueDistortions: string[];
    maxReduction: number;
    longestStreak: number;
  };
  growthLabStats: {
    worksheetsCompleted: number;
  };
}

export async function fetchGameData(): Promise<GameData> {
  return callParent('getGameData');
}

export async function awardXP(xpResult: { totalXP: number; breakdown?: Array<{ label: string; xp: number }> }): Promise<any> {
  return callParent('awardXP', xpResult);
}

export async function saveGameSession(data: { gameId: string; xpEarned: number; score: number; maxScore: number }): Promise<void> {
  return callParent('saveGameSession', data);
}

export async function saveGameData(data: Record<string, any>): Promise<void> {
  return callParent('saveGameData', data);
}

export interface UserInfo {
  displayName: string;
  email: string;
}

export async function fetchUserInfo(): Promise<UserInfo> {
  return callParent('getUserInfo');
}
