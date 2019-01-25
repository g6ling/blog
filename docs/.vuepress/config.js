module.exports = {
  title: 'Cheol Blog',
  description: 'Just Writing',
  plugins: ['@vuepress/blog', '@vuepress/back-to-top', {
    postsDir: 'blog'
  }],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about/' },
      { text: 'Blog', link: '/blog/' },
      { text: 'Tag', link: '/tag/' },
      { text: 'Category', link: '/category/' },
    ],
    sidebar: 'auto'
  }
}
