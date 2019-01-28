---
title: VuePress 화면마다 다른 Sidebar 만들기
created: '2019-01-28T12:00:19.650Z'
modified: '2019-01-28T12:21:25.326Z'
tags: [Vuepress]
---

# VuePress 화면마다 다른 Sidebar 만들기(Vuex 연동)

Vuepress 에서 가장 핵심은 Sidebar 라고 생각합니다. (개인적인 생각입니다.) 현재 자신의 글에 대한 목차도 보이고, 다른 글로 넘어갈수 있는 내비게이션 역할도 하기 때문이죠. 하지만 sidebar 가 자동적으로 만들어 지기 때문에 좀더 유동적인 Sidebar 을 만들기가 힘듭니다.

제 블로그 같은 경우는 Tags 를 통해서 포스트로 들어오면 sidebar 가 Tags 에 고정되어 있고, Tag 을 통해 들어오면 Tag, Blog 을 통해서 들어오면 Blog 로 고정되게 해놨습니다. 만약 특정 Tag 에 대한 글만 보고 싶다면 Tag 을 들어가서 글을 보게 되면 다음글이 같은 태그의 글이 되게 말이죠. 

이 기능은 Vuepress 에서 지원하지 않기 때문에 조금의 귀찮은 과정이 필요합니다.

일단 현재 sidebar 의 상태를 어딘가에 저장을 해야합니다. 그렇기 때문에 `vuex` 을 설치하고 적용하겠습니다.

`./vuepress/enhanceApp.js` 에 밑을 추가해줍니다.

```js
import Vuex from 'vuex'

export default ({
  Vue, // the version of Vue being used in the VuePress app
  // options, // the options for the root Vue instance
  router, // the router instance for the app
  // siteData // site metadata
}) => {
  Vue.use(Vuex)

  const store = new Vuex.Store({
    state: { 
      sidebar: {
        mode: 'all', // 'tag', 'tags', 'group',
        name: 'All Posts',
        option: '', // 'tag 이름', 'group 이름'
      }
    },
    mutations: {
      changeSidebar: (state, sidebar) => { state.sidebar = sidebar }
    },
    actions: {
      changeSidebar: ({ commit }, sidebar) =>  { commit('changeSidebar', sidebar) }
    },
  })
  Vue.mixin({ store })
}
```

vuex 에 관한 기본적인 설명은 vuex 홈페이지을 참고해주세요. https://vuex.vuejs.org/kr/guide/

이렇게 하면 `this.$store.state` 을 통해서 어디서든 `state` 을 참조할수 있습니다.

`layouts/Tags.vue` 을 들어가서 `mounted`  부분을 추가해줍시다. 

```js
  mounted () {
      // 밑의 코드를 통해서 state 을 값을 바꿉니다.
    this.$store.dispatch('changeSidebar', { mode: 'tags', name: 'All Tags' })
    this.$router.afterEach(() => {
      this.isSidebarOpen = false
    })
```

마찬가지로 `layouts/Tag.vue` 는

```js
const tag = this.$tag.path.split('/')[2].split('.')[0]
this.$store.dispatch('changeSidebar', { mode: 'tag', name: `Tag: ${tag}`, option: tag })
```

그리고 `docs/blog/index.md` 파일을 만듭니다.

```html
# Blog

<BlogIndex />
```

이제 BlogIndex 을 만듭시다.

`.vuepress/components/BlogIndex.vue`

```html
<template>
  <div>
    <div v-for="post in posts">
      <h2>
        <router-link :to="post.path">{{ post.frontmatter.title }}</router-link>
      </h2>
      <p>{{ post.frontmatter.description }}</p>
      <p>{{ post.frontmatter.created.slice(0,10) }}</p>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    posts() {
      return this.$site.pages
        .filter(x => x.type === 'post')
        .sort(
          (a, b) => new Date(b.frontmatter.created) - new Date(a.frontmatter.created)
        );
    }
  }
};
</script>
```

이제 `블로그주소/blog/` 을 들어가시면 모든 글이 보이실 것 입니다. 얘는 `layouts/Layout.vue` 을 통해서 만들어 집니다. 

```js
if (this.$page.path === '/blog/') {
      this.$store.dispatch('changeSidebar', { mode: 'all', name: `All Posts` })
}
```

`Layout.vue`의 mounted 에 저렇게 추가해줍시다. 

이제 `/tag/` 을 접속하면 `{ mode: 'tags' }` , `/tag/vue.html` 을 접속하면 `{ mode: 'tag' }`, `/blog/` 을 접속하면 `{ mode: 'all'}` 이 될 것 입니다. 궁금하시면 `console.log` 을 통해서 확인해보세요.

`util/sidebar.js`  을 만들어 줍시다.

```js
import { resolveHeaders } from './index'

export function resolveSidebarItems (store, tags, page, pages) {
  if (store.sidebar.mode === 'tags') {
    return tags.list.map(tag => ({
      type: 'group',
      title: tag.name,
      children: tag.posts..map(post => ({
        title: post.title,
        basePath: post.path,
        path: post.path,
      })),
      collapsable: true
    }))
  } if (store.sidebar.mode === 'tag') {
    const tag = tags.list.filter(tag => tag.name === store.sidebar.option)[0]
    return tag.posts.map(post => {
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
```

요롷게 만들어 줍시다.

이제 각각의 `Tag.vue` `Tags.vue`, `Layout.vue` 의 `sidebarItems` 을 

```js
    sidebarItems () {
      return resolveSidebarItems(this.$store.state, this.$tags, this.$page, this.$site.pages)
    },
```

요렇게 수정하시면 됩니다. 

결과적으로는 각각의 페이지에 들어오면 각기 다른 layout 파일로 접속이 하게됨.  그걸 이용해서 vuex 을 이용해서 state 을 값을 변경. 그 state 의 값으로 sidebarItem 을 만든다. 정도가 되겠네요. 

확실히 `vue` 을 base 로 하다보니 이런저런 기능들을 추가하기 쉬운게 정말 큰 장점같네요.

이글 같은 경우는 좀 설명이 많이 부족한 느낌입니다. 혹시 애매하시거나 잘 안되시는게 있다면 댓글이나 메일 보내주시면 최대한 도움드리겠습니다.
