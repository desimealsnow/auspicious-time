# Configuration

## Next.js Config

- File: `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

## Package Scripts

- `npm run dev` — start dev server with Turbopack
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint

## Dependencies

- next `15.4.6`
- react `19.1.0`
- react-dom `19.1.0`

## Dev Dependencies

- typescript `^5`
- @types/node `^20`
- @types/react `^19`
- @types/react-dom `^19`
- eslint `^9`
- eslint-config-next `15.4.6`
- tailwindcss `^4`
- @tailwindcss/postcss `^4`