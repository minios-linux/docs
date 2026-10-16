import DefaultTheme from 'vitepress/theme'
import { useData, withBase } from 'vitepress'
import { h, nextTick, onMounted, watch } from 'vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: {
    setup() {
      const { page } = useData()
      // VPLink treats .conf as a static-file suffix and skips the site base.
      // Keep hydrated language-switch links consistent with the HTML build.
      const fixConfigLinks = () => {
        for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
          const href = link.getAttribute('href') || ''
          if (/^\/(?:[A-Za-z-]+\/)?reference\/configuration\/config\.conf(?:[?#].*)?$/.test(href)) {
            link.setAttribute('href', withBase(href))
          }
        }
      }
      onMounted(fixConfigLinks)
      watch(() => page.value.relativePath, () => nextTick(fixConfigLinks))
      return () => h(DefaultTheme.Layout)
    }
  }
}
