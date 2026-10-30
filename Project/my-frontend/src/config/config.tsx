//. store API URL so i don't keep writing it
// Local dev (npm run dev): reads VITE_API_BASE_URL from .env.development = http://localhost:3001 (my local Express server)
// Production (npm run build): no value set, so it's "" and calls become relative like fetch("/api/changePic")
// A relative URL goes to the same domain as the page (https://trendbites.yasserswdev.com/api/...)
// CloudFront sends /api/* to API Gateway -> Lambda (my Express app) -> RDS, everything else comes from S3
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "";