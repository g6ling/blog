module.exports = {
  title: 'Cheol Blog',
  description: 'Just Writing',
  plugins: [
    ['@vuepress/blog',{
      postsDir: 'blog/posts/notes',
      permalink: '/:regular',
    }],
    '@vuepress/back-to-top',
    '@vuepress/medium-zoom',
  ],
  markdown: {
    extendMarkdown: md => {
      md.use(require("markdown-it-katex"));
    }
  },
  head: [
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
        text: 'Blog',
        link: '/blog/'
      },
      {
        text: 'Tag',
        link: '/tag/'
      },
    ],
    sidebar: 'auto'
  },
  port: 7000,
  ga: 'UA-133232220-1',
}