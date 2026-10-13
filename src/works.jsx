import React from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { projects } from './projects.js';
import { videoUrl } from './video-url.js';
import './style.css';
const baseUrl = import.meta.env.BASE_URL;
const assetUrl = (path) => baseUrl + path.replace(/^\/+/, '');

function Works() {
  return <main className="works-page">
    <header className="nav nav-scrolled works-nav">
      <a href={baseUrl + '#home'} className="brand"><span className="brand-mark"><img src={assetUrl('/avatar-yuta.jpg')} alt="Yuta Okkotsu 头像"/></span><span className="brand-copy">YUTA OKKOTSU<small>VIDEO EDITOR / 影像剪辑师</small></span></a>
      <a href={baseUrl + '#work'} className="works-back"><ArrowLeft size={15}/> 返回首页</a>
    </header>
    <section className="works-content section-shell">
      <div className="section-kicker mono"><span>FULL PORTFOLIO / 2025</span><span>YUTA OKKOTSU</span></div>
      <div className="works-heading"><div><span className="works-overline mono">ALL PROJECTS · {String(projects.length).padStart(2, '0')}</span><h1>完整作品集</h1></div><p>游戏高光剪辑与 Frag Movie<br/>每一段作品都可以直接播放并开启声音</p></div>
      <div className="full-project-list">{projects.map((project) => <article className="full-project" key={project.id}>
        <div className="full-project-video project-image video-project"><video controls preload="metadata" playsInline aria-label={`${project.title} 视频作品`}><source src={videoUrl(project.video)} type="video/mp4"/>你的浏览器不支持视频播放</video><span className="project-num mono">{project.id} / {String(projects.length).padStart(2, '0')}</span><span className="video-audio-label mono">SOUND ON · USE PLAYER CONTROLS</span></div>
        <div className="project-info"><div><h2>{project.title}</h2><p>{project.note}</p></div><div className="project-meta mono"><span>{project.type}</span><span>{project.year}</span></div></div>
      </article>)}</div>
      <a className="works-home-link" href={baseUrl + '#work'}>回到精选项目 <ArrowUpRight size={15}/></a>
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<Works/>);
