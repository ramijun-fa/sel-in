// generate_sitemap.js - 정적 sitemap.xml 자동 생성 빌드 스크립트
const fs = require('fs');
const path = require('path');

const guideDataPath = path.join(__dirname, 'guide_data.js');
const sitemapPath = path.join(__dirname, 'sitemap.xml');

// 1. guide_data.js 파일 텍스트 분석하여 슬그(slug) 목록 추출
const fileContent = fs.readFileSync(guideDataPath, 'utf8');
const slugRegex = /slug:\s*["']([^"']+)["']/g;
const slugs = [];
let match;

while ((match = slugRegex.exec(fileContent)) !== null) {
    slugs.push(match[1]);
}

// 2. XML 뼈대 생성
const domain = "https://sel-in-care.pages.dev";
const currentDate = new Date().toISOString().split('T')[0];

let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 메인 루트 -->
  <url>
    <loc>${domain}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- 가이드 목록 -->
  <url>
    <loc>${domain}/#guide</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;

// 3. 동적 아티클 엔트리 추가
slugs.forEach(slug => {
    xmlContent += `  <url>
    <loc>${domain}/#guide-detail?slug=${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
});

xmlContent += `</urlset>`;

// 4. 파일 쓰기
fs.writeFileSync(sitemapPath, xmlContent.trim(), 'utf8');
console.log(`✅ [성공] guideArticles 총 ${slugs.length}개 데이터를 기반으로 sitemap.xml 빌드가 완료되었습니다.`);
