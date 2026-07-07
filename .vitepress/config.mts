import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import sidebar from './sidebar.json'

const base = '/docs/'
const docsRoot = process.cwd()
const i18nDir = join(docsRoot, '.vitepress', 'i18n')

function discoverLocales() {
  if (!existsSync(i18nDir)) return []
  return readdirSync(i18nDir)
    .filter((name) => name.endsWith('.json') && name !== 'en.json')
    .map((name) => name.slice(0, -5))
    .sort((a, b) => a.localeCompare(b))
}

const localeCodes = discoverLocales()
const sourceMessages = readMessages('en')

function readMessages(locale: string) {
  const path = join(i18nDir, `${locale}.json`)
  if (!existsSync(path)) return {}
  const data = JSON.parse(readFileSync(path, 'utf8'))
  return data.translations || {}
}

function message(locale: string, key: string) {
  if (locale !== 'root' && locale !== 'en') {
    const messages = readMessages(locale)
    if (typeof messages[key] === 'string' && messages[key] !== '') return messages[key]
  }
  if (typeof sourceMessages[key] === 'string' && sourceMessages[key] !== '') return sourceMessages[key]
  return key
}

function languageLabel(code: string) {
  try {
    const display = new Intl.DisplayNames([code], { type: 'language' })
    const label = display.of(code)
    if (label) return label.charAt(0).toUpperCase() + label.slice(1)
  } catch {
    // Fall through to the raw code for unknown/custom locale identifiers.
  }
  return code
}

function localePath(locale: string, path: string) {
  if (locale === 'root') return path
  return `/${locale}${path === '/' ? '/' : path}`
}

function localeFromPath(path: string) {
  const parts = path.split('/').filter(Boolean)
  const first = parts[0] || ''
  if (localeCodes.includes(first)) return first
  if (first === 'translations' && localeCodes.includes(parts[1] || '')) return parts[1]
  return ''
}

function routeRewrite(id: string) {
  const parts = id.split('/')
  if (parts[0] === 'translations' && localeCodes.includes(parts[1] || '')) {
    return parts.slice(1).join('/')
  }
  return id
}

function localizeItems<T extends { text?: string; link?: string; items?: T[] }>(items: T[], locale: string): T[] {
  const sidebarTextKeys = {
    'About MiniOS': 'sidebar.about',
    'Overview': 'sidebar.overview',
    'System Architecture': 'sidebar.systemArchitecture',
    'Installation': 'sidebar.installation',
    'Quick Start Guide': 'sidebar.quickStartGuide',
    'Hardware Compatibility': 'sidebar.hardwareCompatibility',
    'Installing MiniOS': 'sidebar.installingMiniOS',
    'MiniOS Installer': 'sidebar.miniosInstaller',
    'USB Creation Tools': 'sidebar.usbCreationTools',
    'UNetbootin': 'sidebar.unetbootin',
    'dd command': 'sidebar.ddCommand',
    'Drive Utility': 'sidebar.driveUtility',
    'Original Method': 'sidebar.originalMethod',
    'Configuration': 'sidebar.configuration',
    'Boot Menus': 'sidebar.bootMenus',
    'Boot Parameters': 'sidebar.bootParameters',
    'Configuration File': 'sidebar.configurationFile',
    'live-config Parameters': 'sidebar.liveConfigParameters',
    'Session Management': 'sidebar.sessionManagement',
    'Administration': 'sidebar.administration',
    'Package List': 'sidebar.packageList',
    'Kernel Management': 'sidebar.kernelManagement',
    'Security Hardening': 'sidebar.securityHardening',
    'Performance Optimization': 'sidebar.performanceOptimization',
    'Virtualization': 'sidebar.virtualization',
    'Development': 'sidebar.development',
    'Building MiniOS': 'sidebar.buildingMiniOS',
    'Creating Modules': 'sidebar.creatingModules',
    'Rebuilding ISO': 'sidebar.rebuildingIso',
    'CondinAPT': 'sidebar.condinapt',
    'CondinAPT in MiniOS': 'sidebar.condinaptInMinios'
  }
  return items.map((item) => ({
    ...item,
    text: item.text ? message(locale, sidebarTextKeys[item.text] || item.text) : item.text,
    link: locale !== 'root' && item.link?.startsWith('/') ? localePath(locale, item.link) : item.link,
    items: item.items ? localizeItems(item.items, locale) : undefined
  }))
}

function nav(locale = 'root') {
  const p = (path: string) => localePath(locale, path)
  return [
    { text: message(locale, 'nav.home'), link: p('/') },
    { text: message(locale, 'nav.about'), link: p('/about/About-MiniOS') },
    { text: message(locale, 'nav.quickStart'), link: p('/installation/Quick-Start') },
    {
      text: message(locale, 'nav.install'),
      items: [
        { text: message(locale, 'nav.hardwareCompatibility'), link: p('/installation/Hardware-Compatibility') },
        { text: message(locale, 'nav.installingToDisk'), link: p('/installation/Installing-MiniOS') },
        {
          text: message(locale, 'nav.usbCreationTools'),
          link: p('/installation/tools/USB-Creation-Tools'),
          items: [
            { text: message(locale, 'nav.rufus'), link: p('/installation/tools/Rufus') },
            { text: message(locale, 'nav.ventoy'), link: p('/installation/tools/Ventoy') },
            { text: message(locale, 'nav.balenaEtcher'), link: p('/installation/tools/Balena-Etcher') },
            { text: message(locale, 'nav.originalMethod'), link: p('/installation/tools/Original-Method') }
          ]
        }
      ]
    },
    {
      text: message(locale, 'nav.configure'),
      items: [
        { text: message(locale, 'nav.bootMenus'), link: p('/configuration/Boot-Menus') },
        { text: message(locale, 'nav.bootParameters'), link: p('/configuration/Boot-Parameters') },
        { text: message(locale, 'nav.configurationFile'), link: p('/configuration/Configuration-File') },
        { text: message(locale, 'nav.liveConfigParameters'), link: p('/configuration/live-config') },
        { text: message(locale, 'nav.sessionManagement'), link: p('/configuration/Session-Management') }
      ]
    },
    {
      text: message(locale, 'nav.manage'),
      items: [
        { text: message(locale, 'nav.packages'), link: p('/administration/Packages') },
        { text: message(locale, 'nav.kernelManagement'), link: p('/administration/Kernel-Management') },
        { text: message(locale, 'nav.securityHardening'), link: p('/administration/Security-Hardening') },
        { text: message(locale, 'nav.performance'), link: p('/administration/Performance-Optimization') },
        { text: message(locale, 'nav.virtualization'), link: p('/administration/Virtualization') }
      ]
    },
    {
      text: message(locale, 'nav.develop'),
      items: [
        { text: message(locale, 'nav.buildingMiniOS'), link: p('/development/Building-MiniOS') },
        { text: message(locale, 'nav.creatingModules'), link: p('/development/Creating-Modules') },
        { text: message(locale, 'nav.rebuildingIso'), link: p('/development/Rebuilding-ISO') },
        { text: message(locale, 'nav.condinapt'), link: p('/development/CondinAPT') },
        { text: message(locale, 'nav.condinaptInMinios'), link: p('/development/CondinAPT-MiniOS') }
      ]
    }
  ]
}

function searchTranslations(locale = 'root') {
  return {
    button: {
      buttonText: message(locale, 'search.buttonText'),
      buttonAriaLabel: message(locale, 'search.buttonAriaLabel')
    },
    modal: {
      displayDetails: message(locale, 'search.displayDetails'),
      resetButtonTitle: message(locale, 'search.resetButtonTitle'),
      backButtonTitle: message(locale, 'search.backButtonTitle'),
      noResultsText: message(locale, 'search.noResultsText'),
      footer: {
        selectText: message(locale, 'search.selectText'),
        selectKeyAriaLabel: message(locale, 'search.selectKeyAriaLabel'),
        navigateText: message(locale, 'search.navigateText'),
        navigateUpKeyAriaLabel: message(locale, 'search.navigateUpKeyAriaLabel'),
        navigateDownKeyAriaLabel: message(locale, 'search.navigateDownKeyAriaLabel'),
        closeText: message(locale, 'search.closeText'),
        closeKeyAriaLabel: message(locale, 'search.closeKeyAriaLabel')
      }
    }
  }
}

function themeConfig(locale = 'root') {
  return {
    logo: '/favicon.svg',
    nav: nav(locale),
    sidebar: localizeItems(sidebar, locale),
    outline: {
      label: message(locale, 'theme.onThisPage')
    },
    darkModeSwitchLabel: message(locale, 'theme.appearance'),
    lightModeSwitchTitle: message(locale, 'theme.switchToLight'),
    darkModeSwitchTitle: message(locale, 'theme.switchToDark'),
    sidebarMenuLabel: message(locale, 'theme.menu'),
    returnToTopLabel: message(locale, 'theme.returnToTop'),
    langMenuLabel: message(locale, 'theme.changeLanguage'),
    skipToContentLabel: message(locale, 'theme.skipToContent'),
    socialLinks: [
      { icon: 'github', link: 'https://github.com/minios-linux/minios-live' }
    ],
    search: {
      provider: 'local',
      options: {
        translations: searchTranslations(locale)
      }
    },
    docFooter: {
      prev: message(locale, 'docFooter.prev'),
      next: message(locale, 'docFooter.next')
    },
    footer: {
      message: message(locale, 'footer.message'),
      copyright: message(locale, 'footer.copyright')
    }
  }
}

function localeConfig(code: string) {
  return {
    label: languageLabel(code),
    lang: code,
    link: `/${code}/`,
    title: message(code, 'site.title'),
    description: message(code, 'site.description'),
    themeConfig: themeConfig(code)
  }
}

const autoLanguageScript = `
  (function () {
    var base = ${JSON.stringify(base)};
    var locales = ${JSON.stringify(localeCodes)};
    var storageKey = 'minios-docs-language';

    function normalize(lang) {
      if (!lang) return '';
      var normalized = lang.replace('_', '-');
      var lower = normalized.toLowerCase();
      for (var i = 0; i < locales.length; i++) {
        if (locales[i].toLowerCase() === lower) return locales[i];
      }
      var short = lower.split('-')[0];
      for (var j = 0; j < locales.length; j++) {
        if (locales[j].toLowerCase().split('-')[0] === short) return locales[j];
      }
      return '';
    }

    function currentLocale(path) {
      var rest = path.indexOf(base) === 0 ? path.slice(base.length) : path.replace(new RegExp('^/'), '');
      var first = rest.split('/').filter(Boolean)[0] || '';
      return locales.indexOf(first) >= 0 ? first : 'en';
    }

    var stored = '';
    try { stored = localStorage.getItem(storageKey) || ''; } catch (e) {}
    var current = currentLocale(window.location.pathname);

    if (current === 'en' && (window.location.pathname === base || window.location.pathname === base + 'index.html')) {
      var preferred = stored && stored !== 'en' ? stored : '';
      if (!preferred && navigator.languages) {
        for (var i = 0; i < navigator.languages.length; i++) {
          preferred = normalize(navigator.languages[i]);
          if (preferred) break;
        }
      }
      if (preferred) window.location.replace(base + preferred + '/');
    }

    try { localStorage.setItem(storageKey, current); } catch (e) {}
  })();
`

function localizeFrontmatterLinks(value: unknown, locale: string): unknown {
  if (Array.isArray(value)) return value.map((item) => localizeFrontmatterLinks(item, locale))
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (key === 'link' && typeof item === 'string' && item.startsWith('/') && !localeCodes.some((code) => item.startsWith(`/${code}/`))) {
        return [key, localePath(locale, item)]
      }
      return [key, localizeFrontmatterLinks(item, locale)]
    })
  )
}

function localizeInternalLink(href: string, locale: string) {
  if (!href.startsWith('/') || href.startsWith('//')) return href

  const basePath = `/${base.replace(/^\//, '')}`
  const withoutBase = href.startsWith(basePath) ? href.slice(basePath.length - 1) : href
  const target = withoutBase.replace(/^\//, '')
  if (!target || target.startsWith(`${locale}/`) || localeCodes.some((code) => target.startsWith(`${code}/`))) return href
  if (target.startsWith('assets/')) return href

  const [pathAndQuery, hash = ''] = withoutBase.split('#')
  const [pathOnly, query = ''] = pathAndQuery.split('?')
  const fileName = pathOnly.split('/').pop() || ''
  const extension = fileName.includes('.') ? fileName.split('.').pop() : ''
  if (extension && extension !== 'md' && extension !== 'html') return href

  const cleanPath = pathOnly.replace(/\.(md|html)$/, '')
  return localePath(locale, cleanPath) + (query ? `?${query}` : '') + (hash ? `#${hash}` : '')
}

function localizeHtmlLinks(code: string, locale: string) {
  return code.replace(/href="([^"]+)"/g, (match, href: string) => {
    const localized = localizeInternalLink(href, locale)
    return localized === href ? match : `href="${localized}"`
  })
}

function normalizeHomeFrontmatter(pageData: { relativePath: string; frontmatter: Record<string, any> }) {
  const path = routeRewrite(pageData.relativePath)
  if (path !== 'index.md' && !localeCodes.some((code) => path === `${code}/index.md`)) return

  pageData.frontmatter.layout = 'home'
  const actions = pageData.frontmatter.hero?.actions
  if (Array.isArray(actions)) {
    actions.forEach((action, index) => {
      if (action && typeof action === 'object') action.theme = index === 0 ? 'brand' : 'alt'
    })
  }
}

export default withMermaid(defineConfig({
  base,
  cleanUrls: true,
  title: message('root', 'site.title'),
  description: message('root', 'site.description'),
  mermaid: {
    // refer to mermaid documentation for options
  },
  markdown: {
    config(md) {
      const defaultRender = md.renderer.rules.link_open || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))
      md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const locale = typeof env.relativePath === 'string' ? localeFromPath(env.relativePath) : ''
        const hrefIndex = tokens[idx].attrIndex('href')
        if (hrefIndex >= 0 && localeCodes.includes(locale)) {
          const attrs = tokens[idx].attrs
          const href = attrs?.[hrefIndex]?.[1]
          if (href) attrs[hrefIndex][1] = localizeInternalLink(href, locale)
        }
        return defaultRender(tokens, idx, options, env, self)
      }
    }
  },
  locales: {
    root: {
      label: languageLabel('en'),
      lang: 'en-US',
      link: '/',
      themeConfig: themeConfig('root')
    },
    ...Object.fromEntries(localeCodes.map((code) => [code, localeConfig(code)]))
  },
  rewrites: routeRewrite,
  head: [
    ['link', { rel: 'icon', href: '/docs/favicon.svg' }],
    ['script', {}, autoLanguageScript],
    // Yandex.Metrika
    ['script', {}, `
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

      ym(91951521, "init", {
           clickmap:true,
           trackLinks:true,
           accurateTrackBounce:true
      });
    `],
    // Google Analytics
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-DW6V3D3DVZ' }],
    ['script', {}, `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-DW6V3D3DVZ');
    `]
  ],
  transformPageData(pageData) {
    normalizeHomeFrontmatter(pageData)
    const locale = localeFromPath(pageData.relativePath)
    if (localeCodes.includes(locale)) {
      pageData.frontmatter = localizeFrontmatterLinks(pageData.frontmatter, locale)
    }
  },
  transformHtml(code, _id, ctx) {
    const locale = localeFromPath(ctx.page)
    if (!localeCodes.includes(locale)) return code
    return localizeHtmlLinks(code, locale)
  },
  themeConfig: themeConfig('root')
}))
