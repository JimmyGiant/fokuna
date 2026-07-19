import type { Config } from 'tailwindcss';
import fokunaTailwindPreset from './tailwind/fokuna.tailwind.preset';

const config = {
  presets: [fokunaTailwindPreset],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
} satisfies Config;

export default config;
