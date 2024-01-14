export function getApiURL() {
  if (!import.meta.env.VITE_API_URL) {
    const currentUrlWithoutPath =
      window.location.protocol +
      "//" +
      window.location.hostname +
      (window.location.port ? ":" + window.location.port : "");
    return currentUrlWithoutPath + "/api";
  } else return import.meta.env.VITE_API_URL;
}
