const productionVideoBaseUrl = 'https://github.com/Noo13123/1-hero-2-3-4-5-2/releases/download/portfolio-media-v1';
const configuredVideoBaseUrl = import.meta.env.VITE_VIDEO_BASE_URL || (import.meta.env.PROD ? productionVideoBaseUrl : '');
const videoBaseUrl = configuredVideoBaseUrl.replace(/\/$/, '');

const remoteKeyFor = (path) => `/${encodeURIComponent(path.split('/').pop())}`;

export function videoUrl(path) {
  if (videoBaseUrl) return `${videoBaseUrl}${remoteKeyFor(path)}`;

  if (import.meta.env.PROD) {
    const localPath = path.startsWith('/') ? path.slice(1) : path;
    return `${import.meta.env.BASE_URL}${localPath}`;
  }

  return path;
}
