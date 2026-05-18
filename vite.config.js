import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Vercel 정적 배포 시 base 경로는 루트(/)로 고정
  base: '/',

  build: {
    // 빌드 결과물 폴더 (vercel.json의 outputDirectory와 일치)
    outDir: 'dist',

    // 소스맵 비활성화 (배포 환경 최적화)
    sourcemap: false,

    // 청크 크기 경고 기준 (기본 500KB → 700KB로 완화)
    chunkSizeWarningLimit: 700,

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html')
      },
      output: {
        // 정적 assets 파일명 패턴 통일
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },

  // 개발 서버 설정
  server: {
    port: 5173,
    open: true
  }
});
