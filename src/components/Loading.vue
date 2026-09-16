<template>
    <div class="flex h-screen w-screen items-center justify-center bg-slate-100 text-slate-800" style="font-family: 'Inter', sans-serif;">
    <div class="loading-card">
      <div class="signature-wrap" aria-label="WebNote" role="img">
        <svg class="signature-svg" viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="signatureGradient" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stop-color="#0f172a" stop-opacity="0.6" />
              <stop offset="50%" stop-color="#0f172a" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#0f172a" stop-opacity="0.7" />
            </linearGradient>
          </defs>
          <path class="signature-underline" d="M 80 160 C 185 170, 290 170, 390 150 S 560 130, 680 150" />
          <text x="60" y="128" class="signature-text">WebNote</text>
          <g class="signature-pen">
            <path d="M 598 48 L 640 82 L 618 88 L 576 54 Z" />
            <path d="M 576 54 L 548 35 L 562 20 L 590 38 Z" />
            <circle cx="605" cy="76" r="7" />
          </g>
        </svg>
      </div>

      <div class="loader-row">
        <span class="loader-pulse"></span>
        <span class="loading-message">認証状態を確認しています...</span>
      </div>
    </div>
  </div>
</template>