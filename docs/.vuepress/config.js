module.exports = {
  title: 'Cheol Blog',
  description: 'Just Writing',
  plugins: [
    ['@vuepress/blog',{
      postsDir: 'blog/posts/notes',
      permalink: '/posts/:slug',
    }],
    '@vuepress/back-to-top',
    '@vuepress/medium-zoom',
    '@vuepress/last-updated',
    ['@vuepress/pwa', {
        serviceWorker: true,
        updatePopup: true
    }],
    [ 
      '@vuepress/google-analytics',
      {
        'ga': 'UA-133232220-1',
      }
    ]  
  ],
  markdown: {
    extendMarkdown: md => {
      md.use(require("markdown-it-katex"));
    },
    linkify: true,
  },
  head: [
    ['link', { rel: 'icon', href: `/images/logo-144.png` }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/logo-180.png' }],
    ['link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/github-markdown-css/2.2.1/github-markdown.css' }],
  ],
  themeConfig: {
    nav: [{
        text: 'Home',
        link: '/'
      },
      {
        text: 'About',
        link: '/about/'
      },
      {
        text: 'Posts',
        link: '/posts/'
      },
      {
        text: 'Tag',
        link: '/tag/'
      },
      {
        text: 'Github',
        link: 'https://github.com/g6ling/blog'
      },
    ],
    sidebar: 'auto'
  },
  port: 7000,
  locales: {
    '/': { lang: 'ko-KR' }
  },
}