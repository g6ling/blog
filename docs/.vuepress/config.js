module.exports = {
  title: 'Cheol Blog',
  description: 'Just Writing',
  plugins: [
    '@vuepress/blog',
    '@vuepress/back-to-top',
    '@vuepress/medium-zoom',
    {
      postsDir: 'blog'
    }
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
  configureWebpack: {
    resolve: {
      alias: {
        '@attachment': 'blog/posts/attachments'
      }
    }
  }
}