import { resolveHeaders } from './index'

export function resolveSidebarItems (store, tags, page, pages) {
  if (store.sidebar.mode === 'tags') {
    return tags.list.filter(tag => tag.name !== 'WIP').map(tag => ({
      type: 'group',
      title: tag.name,
      children: tag.posts.filter(post => !post.frontmatter.tags.includes('WIP')).map(post => ({
        title: post.title,
        basePath: post.path,
        path: post.path,
      })),
      collapsable: true
    }))
  } if (store.sidebar.mode === 'tag') {
    const tag = tags.list.filter(tag => tag.name === store.sidebar.option)[0]
    return tag.posts.filter(post => !post.frontmatter.tags.includes('WIP')).map(post => {
      if (post.path === page.path) {
        return resolveHeaders(page)[0]
      } return {
        title: post.title,
        basePath: post.path,
        path: post.path,
      }
    })
  } if (store.sidebar.mode === 'all') {
    return pages
    .filter(page => page.type === 'post')
    .filter(x => x.frontmatter.tags && !x.frontmatter.tags.includes('WIP'))
    .sort(
      (a, b) => new Date(b.frontmatter.created) - new Date(a.frontmatter.created)
    ).map(post => {

      if (post.path === page.path) {
        return resolveHeaders(page)[0]
      } return {
        title: post.title,
        basePath: post.path,
        path: post.path,
      }
    })
  } if (store.sidebar.mode === 'none') {
    return []
  }

  return []
}