import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  base: '/docs/',
  title: "MiniOS Wiki",
  description: "Reliable and user-friendly portable Linux distribution",
  mermaid: {
    // refer to mermaid documentation for options
  },
  head: [
    ['link', { rel: 'icon', href: '/docs/favicon.svg' }],
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
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About MiniOS', link: '/About-MiniOS' },
      { text: 'Getting Started', link: '/Quick-Start' },
      {
        text: 'User Guide',
        items: [
          { text: 'Hardware Compatibility', link: '/Hardware-Compatibility' },
          { text: 'Installing MiniOS', link: '/Installing-MiniOS' },
          { text: 'Boot Menus', link: '/Boot-Menus' },
          { text: 'Configuration File', link: '/Configuration-File' },
          { text: 'Boot Parameters', link: '/Boot-Parameters' },
          { text: 'live-config Parameters', link: '/live-config' },
          { text: 'Session Management', link: '/Session-Management' },
          { text: 'Kernel Management', link: '/Kernel-Management' },
          { text: 'Security Hardening', link: '/Security-Hardening' },
          { text: 'Performance Optimization', link: '/Performance-Optimization' },
          { text: 'Virtualization', link: '/Virtualization' },
          { text: 'System Architecture', link: '/System-Architecture' },
          { text: 'Package List', link: '/Packages' }
        ]
      },
      {
        text: 'Development',
        items: [
          { text: 'Building MiniOS', link: '/Building-MiniOS' },
          { text: 'Creating Modules', link: '/Creating-Modules' },
          { text: 'Rebuilding ISO', link: '/Rebuilding-ISO' },
          { text: 'CondinAPT', link: '/CondinAPT' }
        ]
      }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Quick Start Guide', link: '/Quick-Start' },
          { text: 'About MiniOS', link: '/About-MiniOS' }
        ]
      },
      {
        text: 'User Guide',
        items: [
          { text: 'Hardware Compatibility', link: '/Hardware-Compatibility' },
          { text: 'Installing MiniOS', link: '/Installing-MiniOS' },
          { text: 'Boot Menus', link: '/Boot-Menus' },
          { text: 'Configuration File', link: '/Configuration-File' },
          { text: 'Boot Parameters', link: '/Boot-Parameters' },
          { text: 'live-config Parameters', link: '/live-config' },
          { text: 'Session Management', link: '/Session-Management' },
          { text: 'Kernel Management', link: '/Kernel-Management' },
          { text: 'Security Hardening', link: '/Security-Hardening' },
          { text: 'Performance Optimization', link: '/Performance-Optimization' },
          { text: 'Virtualization', link: '/Virtualization' },
          { text: 'System Architecture', link: '/System-Architecture' },
          { text: 'Package List', link: '/Packages' }
        ]
      },
      {
        text: 'Development',
        items: [
          { text: 'Building MiniOS', link: '/Building-MiniOS' },
          { text: 'Creating Modules', link: '/Creating-Modules' },
          { text: 'Rebuilding ISO', link: '/Rebuilding-ISO' },
          { text: 'CondinAPT', link: '/CondinAPT' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/minios-linux/minios-live' }
    ],
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Released under the GPL-3.0 License.',
      copyright: 'Copyright © 2025 MiniOS Team'
    }
  }
}))
