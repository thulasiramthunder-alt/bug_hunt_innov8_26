import { API } from './api';

export class AntiCheatMonitor {
  constructor(onViolation) {
    this.onViolation = onViolation;
    this.cleanups = [];
  }

  listen(target, event, handler) {
    target.addEventListener(event, handler);
    this.cleanups.push(() => target.removeEventListener(event, handler));
  }

  report(type, details='') {
    this.onViolation?.(type);
    const token = localStorage.getItem('teamToken');
    fetch(`${API}/api/violations`, {
      method:'POST',
      headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
      body:JSON.stringify({violationType:type, details})
    }).catch(()=>{});
  }

  async enterFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    } catch {
      this.onViolation?.('Fullscreen permission was not granted');
    }
  }

  init() {
    this.listen(document,'contextmenu',e=>{e.preventDefault();this.report('right_click','Context menu blocked');});
    ['copy','cut','paste'].forEach(evt=>{
      this.listen(document,evt,e=>{e.preventDefault();this.report('copy_paste',`${evt} blocked`);});
    });
    this.listen(document,'visibilitychange',()=>{
      if(document.hidden) this.report('tab_switch','Document became hidden');
    });
    this.listen(document,'fullscreenchange',()=>{
      if(!document.fullscreenElement) this.report('fullscreen_exit','Fullscreen exited');
    });
    this.listen(window,'blur',()=>{
      this.report('window_blur','Browser window lost focus; this also covers many minimize/window-change events');
    });
    this.listen(window,'resize',()=>{
      if(document.fullscreenElement===null) return;
      // A resize while an arena session is active is treated as a window-change signal.
      this.report('window_change','Browser viewport changed during fullscreen session');
    });
  }

  destroy() {
    this.cleanups.forEach(fn=>fn());
    this.cleanups=[];
  }
}
