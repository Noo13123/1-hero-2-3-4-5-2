import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Asterisk, AtSign, Check, Clapperboard, Copy, Film, Instagram, Mail, Menu, MoveUpRight, Play, Plus, Video, X } from 'lucide-react';
import { featuredProjects } from './projects.js';
import { videoUrl } from './video-url.js';
import './style.css';
const baseUrl = import.meta.env.BASE_URL;
const assetUrl = (path) => baseUrl + path.replace(/^\/+/, '');
const strengths = ['视频节奏', '影像审美', '音画和谐', '客户满意'];
const workflow = [
  ['客户下单', '确认作品类型、用途与交付时间，先把需求和方向梳理清楚'],
  ['浏览素材', '一起查看录像、音乐与参考风格，挑出最值得呈现的高光'],
  ['相互沟通', '对齐节奏、情绪与重点内容，制作过程中保持同步交流'],
  ['成品预览', '交付初版供你预览，检查画面、节奏、字幕与音效细节'],
  ['无限修改', '根据反馈逐项调整，持续打磨到符合你的预期'],
  ['客户满意', '确认最终成片后，整理导出并交付完整文件'],
];

function FilmStrip() {
  return <div className="film-strip" aria-hidden="true"><div className="film-holes"/><div className="film-center"><span>FRAME BY FRAME&nbsp; · &nbsp;FRAME BY FRAME&nbsp; · &nbsp;FRAME BY FRAME&nbsp; · &nbsp;</span><span>FRAME BY FRAME&nbsp; · &nbsp;FRAME BY FRAME&nbsp; · &nbsp;FRAME BY FRAME&nbsp; · &nbsp;</span></div><div className="film-holes"/></div>;
}
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [wechatCopied, setWechatCopied] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 40); window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn); }, []);
  useEffect(() => {
    const videos = [...document.querySelectorAll('.background-video')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) target.play().catch(() => {});
        else target.pause();
      });
    }, { rootMargin: '160px 0px' });
    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!contactOpen) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') setContactOpen(false); };
    document.body.classList.add('modal-open');
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.classList.remove('modal-open'); window.removeEventListener('keydown', onKeyDown); };
  }, [contactOpen]);
  const copyWechat = async () => {
    try {
      await navigator.clipboard.writeText('R1Ce88');
    } catch {
      const input = document.createElement('textarea');
      input.value = 'R1Ce88';
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setWechatCopied(true);
    window.setTimeout(() => setWechatCopied(false), 2200);
  };
  const closeMenu = () => setMenuOpen(false);
  return <>
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <a href="#home" className="brand" onClick={closeMenu}><span className="brand-mark"><img src={assetUrl('/avatar-yuta.jpg')} alt="Yuta Okkotsu 头像"/></span><span className="brand-copy">YUTA OKKOTSU<small>VIDEO EDITOR / 影像剪辑师</small></span></a>
      <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
        <a href="#about" onClick={closeMenu}><span>01</span> 关于</a><a href="#work" onClick={closeMenu}><span>02</span> 作品</a><a href="#skills" onClick={closeMenu}><span>03</span> 优势</a><a href="#process" onClick={closeMenu}><span>04</span> 流程</a><a href="#clients" onClick={closeMenu}><span>05</span> 客户</a>
        <a className="nav-contact" href="#contact" onClick={closeMenu}>找我聊聊 <ArrowUpRight size={15}/></a>
      </nav>
      <button className="menu-toggle" aria-label={menuOpen ? '关闭菜单' : '打开菜单'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </header>

    <main>
      <section className="hero" id="home">
        <video className="hero-video background-video" autoPlay muted loop playsInline preload="metadata"><source src={videoUrl('/cxyveil.mp4')} type="video/mp4"/></video>
        <div className="hero-shade"/><div className="hero-grid"/>
        <div className="hero-meta mono"><span>INDEPENDENT VIDEO EDITOR</span><span>BASED IN SHANGHAI · AVAILABLE WORLDWIDE</span></div>
        <div className="hero-content"><div className="eyebrow"><span className="status-dot"/> VIDEO EDITOR <i>/</i> FRAG MOVIE CREATOR</div><h1>让每一次击杀<br/><em>都成为回忆</em></h1><div className="hero-bottom"><p>Yuta Okkotsu<br/>始于兴趣 忠于热爱</p><a href="#work" className="circle-link"><span>探索作品</span><ArrowDown size={18}/></a></div></div>
        <div className="hero-side mono"><span>VOL. 01 — 2025</span><span className="side-line"/><span>SCROLL TO EXPLORE</span></div>
        <div className="hero-index mono">01<span> / </span>05</div>
      </section>

      <section className="intro section-shell" id="about">
        <div className="section-kicker mono"><span>01 / ABOUT</span><span>一帧一帧，靠近想表达的事</span></div>
        <div className="intro-grid"><div className="portrait-wrap"><img src={assetUrl('/avatar-yuta.jpg')} alt="Yuta Okkotsu 头像"/><div className="portrait-caption mono"><span>YUTA OKKOTSU / 2025</span><span>FIG. 001</span></div><div className="portrait-cross">+</div></div>
          <div className="intro-copy"><p className="large-copy">始于兴趣<br/>忠于<span>热爱</span></p><p className="body-copy">5年剪辑经验从游戏片段中捕捉情绪与节奏，专注于瓦神话与 CS 魔王剪辑，让每一次击杀都成为值得回看的瞬间</p><p className="body-copy">服务多位瓦神话·CS魔王剪辑师用镜头、音乐与节奏，把高光操作剪成属于玩家的回忆</p>
            <div className="contact-row"><a href="mailto:275920625@qq.com"><Mail size={15}/> 275920625@qq.com <ArrowUpRight size={14}/></a></div>
            <div className="stats"><div><strong>5<span>年</span></strong><small>剪辑经验</small></div><div><strong>VAL</strong><small>瓦神话剪辑</small></div><div><strong>CS</strong><small>CS 魔王剪辑</small></div></div>
          </div></div>
      </section>

      <FilmStrip/>

      <section className="work section-shell" id="work"><div className="section-kicker mono"><span>02 / SELECTED WORK</span><span>影像，是最诚实的语言</span></div><div className="work-heading"><h2>抖音同款<span> SELECTED PROJECTS</span></h2><p>游戏高光剪辑与 Frag Movie，<br/>每一段都有声音，点击播放即可观看</p></div>
        <div className="project-grid">{featuredProjects.map((project) => <article className={`project-card ${project.ratio}`} key={project.id}><div className="project-image video-project"><video controls preload="metadata" playsInline aria-label={`${project.title} 视频作品`}><source src={videoUrl(project.video)} type="video/mp4"/>你的浏览器不支持视频播放</video><span className="project-num mono">{project.id} / {String(featuredProjects.length).padStart(2, '0')}</span><span className="video-audio-label mono">SOUND ON · USE PLAYER CONTROLS</span></div><div className="project-info"><div><h3>{project.title}</h3><p>{project.note}</p></div><div className="project-meta mono"><span>{project.type}</span><span>{project.year}</span></div></div></article>)}</div>
        <a href={assetUrl('/works.html')} className="all-work">完整作品集 <ArrowRight size={17}/></a>
      </section>

      <section className="skills section-shell" id="skills"><div className="section-kicker mono"><span>03 / WHAT MATTERS</span><span>比速度更重要的，是每一帧的表达</span></div><div className="skills-intro"><h2>相比于快速出片，<br/><em>我更在意</em></h2></div><div className="skill-grid">{strengths.map((title, i) => <div className="skill-word" key={title}><span className="mono">0{i + 1}</span><strong>{title}</strong></div>)}</div></section>

      <section className="process section-shell" id="process"><div className="section-kicker mono"><span>04 / HOW WE WORK</span><span>从想法到成片，每一步都清晰</span></div><div className="process-heading"><h2>每一步<em>都有<span>反馈</span></em></h2><p>把沟通放在剪辑过程里，<br/>让成片更接近你想要的样子</p></div><div className="process-grid">{workflow.map(([title, description], i) => <article className="process-step" key={title}><div className="process-marker"><span>{String(i + 1).padStart(2, '0')}</span><i/><ArrowUpRight size={15}/></div><h3>{title}</h3><p>{description}</p></article>)}</div><div className="process-foot"><span><i className="process-dot"/> 准备好开始了吗？先聊聊你想呈现的高光</span><a href="#contact">开始合作 <ArrowUpRight size={15}/></a></div></section>

      <section className="clients section-shell" id="clients"><div className="section-kicker mono"><span>05 / CLIENTS</span><span>合作伙伴</span></div><div className="clients-title"><h2>我的客户</h2><span className="mono">CLIENT ROSTER / 2025</span></div><div className="client-card"><div className="client-portrait"><img src={assetUrl('/clients/cs2-heiqi.jpg')} alt="CS2 黑崎头像"/><span className="mono">CLIENT / 001</span></div><div className="client-details"><div className="client-heading"><div><span className="client-kicker mono">CS2 · COACH / IGL</span><h2>黑崎</h2></div><span className="client-name-en mono">CS2 HEIQI</span></div><p className="client-bio">全图魔王 · 5E Top 50<br/>线下多次 PNL 与极限之地冠军</p><p className="client-roles">现任 Upset Gaming 教练、指挥<br/>前 Redstar Pro 指挥</p><div className="client-stats"><div><strong>500<span>+</span></strong><small>复盘教学指导</small></div><div><strong>15<span>+</span></strong><small>魔王</small></div><div><strong>20<span>+</span></strong><small>钻石</small></div><div><strong>∞</strong><small>S 数不胜数</small></div></div><div className="client-services"><span>教学</span><span>Demo 复盘</span><span className="client-wechat">微信：CS2heiqi</span></div><a className="client-profile-link" href="https://v.douyin.com/AMfLwGD_KVY/" target="_blank" rel="noreferrer">访问抖音主页 <ArrowUpRight size={15}/></a></div></div>
        <div className="client-card client-card-alt"><div className="client-portrait"><img src={assetUrl('/clients/ye-buguisu.jpg')} alt="夜不归宿头像"/><span className="mono">CLIENT / 002</span></div><div className="client-details"><div className="client-heading"><div><span className="client-kicker mono">DOUYIN · CREATOR</span><h2>夜不归宿</h2></div><span className="client-name-en mono">恩师</span></div><p className="client-bio">助力每一位有梦想的少年<br/>沉浸式 1v1 教学 · 魔王剪辑</p><p className="client-roles">专注剪辑案例拆解、基础流程教学与思路提升，分享剪辑变现经验；提供素材、软件与音效公益资源</p><div className="client-stats"><div><strong>47<span>万</span></strong><small>获赞</small></div><div><strong>3<span>万</span></strong><small>粉丝</small></div><div><strong>19</strong><small>作品</small></div><div><strong>1v1</strong><small>沉浸式教学</small></div></div><div className="client-services"><span>14 天速成课</span><span>提升剪辑思路</span><span>剪辑变现</span><span>公益素材</span><span>素材 QQ：586743123</span><span>学习咨询：chux13759</span></div><a className="client-profile-link" href="https://v.douyin.com/bcgUytsvvZM/" target="_blank" rel="noreferrer">访问抖音主页 <ArrowUpRight size={15}/></a></div></div>
        <div className="client-card"><div className="client-portrait"><img src={assetUrl('/clients/ami.jpg')} alt="Ami 头像"/><span className="mono">CLIENT / 003</span></div><div className="client-details"><div className="client-heading"><div><span className="client-kicker mono">CS2 · PLAYER / CREATOR</span><h2>Ami</h2></div><span className="client-name-en mono">5E TOP 20</span></div><p className="client-bio">1.4+ 赛季全图魔王 S<br/>1.8+ 全图钻石 S · 5E 1.8S+</p><p className="client-roles">5E Top 20<br/>专业研究迷城，带你理清思路、稳定上分</p><div className="client-stats"><div><strong>1.4<span>+</span></strong><small>赛季魔王 S</small></div><div><strong>1.8<span>+</span></strong><small>全图钻石 S</small></div><div><strong>TOP 20</strong><small>5E 排名</small></div><div><strong>PhD</strong><small>医学</small></div></div><div className="client-services"><span>迷城深度研究</span><span>思路提升</span><span>上分指导</span><span>188 cm · 男大学生</span></div><a className="client-profile-link" href="https://v.douyin.com/LizAprOHiQ8/" target="_blank" rel="noreferrer">访问抖音主页 <ArrowUpRight size={15}/></a></div></div>
      </section>

      <section className="contact" id="contact"><video className="contact-video background-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src={videoUrl('/videos/contact-background.mp4')} type="video/mp4"/></video><div className="contact-bg"/><div className="contact-content"><div className="section-kicker mono"><span>06 / YOUR NEXT FRAME</span><span>一个好故事，从一次对话开始</span></div><div className="contact-center"><span className="contact-overline mono"><span className="status-dot"/> OPEN FOR SELECT PROJECTS</span><h2>下一个高光<br/><em>我们一起剪</em></h2><button type="button" className="contact-cta" onClick={() => setContactOpen(true)}>和我聊聊你的高光 <MoveUpRight size={17}/></button></div><footer className="contact-bottom"><div className="footer-name"><strong>YUTA OKKOTSU</strong><span>乙骨</span></div><span className="mono footer-copy">© 2026 YUTA OKKOTSU · 始于兴趣 忠于热爱</span><a href="#home" className="back-top">BACK TO TOP <ArrowUpRight size={14}/></a></footer></div><div className="contact-watermark">Y.</div></section>
      {contactOpen && <div className="contact-modal-backdrop" onClick={() => setContactOpen(false)}><section className="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title" onClick={(event) => event.stopPropagation()}><header className="contact-modal-header"><span className="mono">LET’S TALK / 联系乙骨</span><button type="button" className="contact-modal-close" aria-label="关闭联系窗口" onClick={() => setContactOpen(false)}><X size={23}/></button></header><div className="contact-modal-content"><p className="contact-modal-kicker">你的<span className="modal-highlight">高光</span>，从我这里<span className="modal-start">开始</span></p><h2 id="contact-modal-title">你好，我是乙骨</h2><p className="contact-modal-welcome">欢迎合作</p><div className="wechat-block"><span className="mono">WECHAT ID / 微信号</span><strong>R1Ce88</strong></div><button type="button" className={`wechat-copy ${wechatCopied ? 'copied' : ''}`} onClick={copyWechat}>{wechatCopied ? '已复制微信号' : '复制微信号'} {wechatCopied ? <Check size={17}/> : <Copy size={17}/>}</button></div></section></div>}
    </main>
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);
