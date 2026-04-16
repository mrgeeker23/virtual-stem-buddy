

## Plan: Fix Build Error & Add Audio Files

### 1. Fix TypeScript build error
Replace `NodeJS.Timeout` with `ReturnType<typeof setTimeout>` on line 38 of `src/components/VirtualPiano.tsx` to fix the `Cannot find namespace 'NodeJS'` error.

### 2. Copy uploaded audio files
Copy all 8 uploaded key files (`key1.mp3` through `key8.mp3`) into `public/audio/` so the piano keys produce sound.

