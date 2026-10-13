export function videoUrl(path) {
  const localPath = path.startsWith('/') ? path.slice(1) : path;
  return import.meta.env.PROD ? `${import.meta.env.BASE_URL}${localPath}` : path;
}
