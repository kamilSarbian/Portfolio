const COUNTRY_LANGUAGE = {
  NO: "no",
  PL: "pl",
};

export function countryToLanguage(country) {
  const countryCode = typeof country === "string" ? country.trim().toUpperCase() : "";
  return COUNTRY_LANGUAGE[countryCode] || "en";
}

export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const countryHeader = request.headers["x-vercel-ip-country"];
  const country = Array.isArray(countryHeader) ? countryHeader[0] : countryHeader;

  response.setHeader("Cache-Control", "private, no-store");
  return response.status(200).json({ language: countryToLanguage(country) });
}
