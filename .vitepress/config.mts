import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  base: '/docs/',
  cleanUrls: true,
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
      { text: 'About', link: '/about/About-MiniOS' },
      { text: 'Quick Start', link: '/installation/Quick-Start' },
      {
        text: 'Install',
        items: [
          { text: 'Hardware Compatibility', link: '/installation/Hardware-Compatibility' },
          { text: 'Installing to Disk', link: '/installation/Installing-MiniOS' },
          {
            text: 'USB Creation Tools',
            link: '/installation/tools/USB-Creation-Tools',
            items: [
              { text: 'Rufus', link: '/installation/tools/Rufus' },
              { text: 'Ventoy', link: '/installation/tools/Ventoy' },
              { text: 'Balena Etcher', link: '/installation/tools/Balena-Etcher' },
              { text: 'Original Method', link: '/installation/tools/Original-Method' }
            ]
          }
        ]
      },
      {
        text: 'Configure',
        items: [
          { text: 'Boot Menus', link: '/configuration/Boot-Menus' },
          { text: 'Boot Parameters', link: '/configuration/Boot-Parameters' },
          { text: 'Configuration File', link: '/configuration/Configuration-File' },
          { text: 'live-config Parameters', link: '/configuration/live-config' },
          { text: 'Session Management', link: '/configuration/Session-Management' }
        ]
      },
      {
        text: 'Manage',
        items: [
          { text: 'Packages', link: '/administration/Packages' },
          { text: 'Kernel Management', link: '/administration/Kernel-Management' },
          { text: 'Security Hardening', link: '/administration/Security-Hardening' },
          { text: 'Performance', link: '/administration/Performance-Optimization' },
          { text: 'Virtualization', link: '/administration/Virtualization' }
        ]
      },
      {
        text: 'Develop',
        items: [
          { text: 'Building MiniOS', link: '/development/Building-MiniOS' },
          { text: 'Creating Modules', link: '/development/Creating-Modules' },
          { text: 'Rebuilding ISO', link: '/development/Rebuilding-ISO' },
          { text: 'CondinAPT', link: '/development/CondinAPT' },
          { text: 'CondinAPT in MiniOS', link: '/development/CondinAPT-MiniOS' }
        ]
      }
    ],
    sidebar: [
      {
        text: 'About MiniOS',
        items: [
          { text: 'Overview', link: '/about/About-MiniOS' },
          { text: 'System Architecture', link: '/about/System-Architecture' }
        ]
      },
      {
        text: 'Installation',
        items: [
          { text: 'Quick Start Guide', link: '/installation/Quick-Start' },
          { text: 'Hardware Compatibility', link: '/installation/Hardware-Compatibility' },
          { text: 'Installing MiniOS', link: '/installation/Installing-MiniOS' },
          { text: 'MiniOS Installer', link: '/installation/MiniOS-Installer' },
          {
            text: 'USB Creation Tools',
            link: '/installation/tools/USB-Creation-Tools',
            collapsed: true,
            items: [
              { text: 'Rufus', link: '/installation/tools/Rufus' },
              { text: 'Ventoy', link: '/installation/tools/Ventoy' },
              { text: 'Balena Etcher', link: '/installation/tools/Balena-Etcher' },
              { text: 'UNetbootin', link: '/installation/tools/UNetbootin' },
              { text: 'dd command', link: '/installation/tools/dd' },
              { text: 'Drive Utility', link: '/installation/tools/Drive-Utility' },
              { text: 'Original Method', link: '/installation/tools/Original-Method' }
            ]
          }
        ]
      },
      {
        text: 'Configuration',
        items: [
          { text: 'Boot Menus', link: '/configuration/Boot-Menus' },
          { text: 'Boot Parameters', link: '/configuration/Boot-Parameters' },
          { text: 'Configuration File', link: '/configuration/Configuration-File' },
          { text: 'live-config Parameters', link: '/configuration/live-config' },
          { text: 'Session Management', link: '/configuration/Session-Management' }
        ]
      },
      {
        text: 'Administration',
        items: [
          { text: 'Package List', link: '/administration/Packages' },
          { text: 'Kernel Management', link: '/administration/Kernel-Management' },
          { text: 'Security Hardening', link: '/administration/Security-Hardening' },
          { text: 'Performance Optimization', link: '/administration/Performance-Optimization' },
          { text: 'Virtualization', link: '/administration/Virtualization' }
        ]
      },
      {
        text: 'Development',
        items: [
          { text: 'Building MiniOS', link: '/development/Building-MiniOS' },
          { text: 'Creating Modules', link: '/development/Creating-Modules' },
          { text: 'Rebuilding ISO', link: '/development/Rebuilding-ISO' },
          { text: 'CondinAPT', link: '/development/CondinAPT' },
          { text: 'CondinAPT in MiniOS', link: '/development/CondinAPT-MiniOS' }
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
      message: 'Released under the GPL-3.0 License. <br/> <a href="https://minios.dev">Official Website</a> | <a href="https://github.com/minios-linux/minios-live">Source Code</a> | <a href="https://github.com/minios-linux/minios-live/releases">Download</a>',
      copyright: 'Copyright © 2025 MiniOS Team'
    }
  }
}))
