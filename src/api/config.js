export function apiBase(value = "https://f1-circuit-api.onrender.com") {
  const url = new URL(value);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname)
      ))
  )
    throw new Error(
      "Use a public HTTPS API URL or local development URL without credentials.",
    );
  return value.replace(/\/+$/, "") + "/api/v1";
}
