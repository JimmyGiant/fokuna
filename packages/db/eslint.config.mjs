import nextVitals from "eslint-config-next/core-web-vitals";

const config = [...nextVitals, { ignores: ["drizzle/**"] }];

export default config;
