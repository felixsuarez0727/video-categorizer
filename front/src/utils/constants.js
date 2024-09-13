const protocol = window.location.protocol === "https:" ? "https" : "http";
const hostname = window.location.hostname;
const port = 20002;

export const fullUrl = `${protocol}://${hostname}:${port}`;