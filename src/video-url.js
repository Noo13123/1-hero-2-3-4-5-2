const configuredVideoBaseUrl = import.meta.env.VITE_VIDEO_BASE_URL || '';
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
