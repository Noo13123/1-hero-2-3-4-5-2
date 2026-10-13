export const projects = [
  { id: '01', title: 'Veil登神长阶', type: 'VALORANT · FRAG MOVIE', year: '2025', video: '/videos/cxyveil.mp4', note: '高光时刻，值得被重新看见', featured: true, ratio: 'wide' },
  { id: '02', title: 'MAMA', type: 'CS · FRAG MOVIE', year: '2025', video: '/videos/H9999.mp4', note: '把每一次精准击杀，留在节奏里', featured: true, ratio: 'tall' },
  { id: '03', title: '卡点', type: 'FPS · RHYTHM EDIT', year: '2026', video: '/videos/ka-dian.mp4', note: '跟着节奏，把每次高光卡进音乐里', featured: true, ratio: 'tall' },
  { id: '04', title: '馈赠', type: 'DOUYIN · EDIT', year: '2026', video: '/videos/gift.mp4', note: '把灵感与节奏，剪成一份馈赠', featured: true, ratio: 'wide' },
  { id: '05', title: '切刀慢动作', type: 'FPS · GAMEPLAY EDIT', year: '2025', video: '/videos/15.mp4', note: '缘分落地生根是我们' },
  { id: '06', title: '残局开头', type: 'FPS · FRAG MOVIE', year: '2025', video: '/videos/AAAme.mp4', note: '让操作与音乐，在同一个瞬间爆发' },
  { id: '07', title: '随便搞搞', type: 'FPS · FRAG MOVIE', year: '2026', video: '/videos/contact-background.mp4', note: '把每一帧灵感，剪成新的高光' },
  { id: '08', title: '切刀慢动作', type: 'FPS · GAMEPLAY EDIT', year: '2026', video: '/videos/knife-slowmo-01.mp4', note: '刀光掠过的瞬间，慢下来更有力量' },
  { id: '09', title: '切刀慢动作', type: 'FPS · GAMEPLAY EDIT', year: '2026', video: '/videos/knife-slowmo-02.mp4', note: '用慢动作留住每一次锋芒' },
];

export const featuredProjects = projects.filter((project) => project.featured);
