export const siteDesc = {
  ja: "フロントエンドの開発記録",
  en: "Blog by a frontend developer",
  fr: "Blog par une développeuse front-end",
}

export const siteLocale = {
  ja: "ja_JP",
  en: "en_US",
  fr: "fr_FR",
}

export const homeText = {
  en: "Home",
  fr: "Accueil",
  ja: "ホーム",
}

export const pageIndexText = (currentPage, pages) => ({
  en: `Page ${currentPage} of ${pages}`,
  fr: `Page ${currentPage} de ${pages}`,
  ja: `${currentPage}ページ目 (${pages}ページ中)`,
})

export const archiveTitleText = (title) => ({
  en: `# ${title} archive`,
  fr: `# ${title} archive`,
  ja: `# ${title} アーカイブ`,
})
