---
title: Vuepress Blog Plugin 이해하기
created: '2019-01-28T11:31:37.532Z'
modified: '2019-01-28T12:25:33.624Z'
tags: [Vuepress]
---

# Vuepress Blog Plugin 이해하기

제 블로그는 https://github.com/g6ling/blog 에 있습니다. 잘 안되는 부분이 있다면 코드를 보시고 분석하시면 금방 알수 있을것 이라고 생각됩니다. 

처음에 Vuepress 로 블로그를 만들기로 할때,  https://vuepress.vuejs.org/plugin/official/plugin-blog.html 가 있길래 이거 쓰면 좀 편하게 만들 수 있겟지 라고 생각했습니다.

## 너무 설명이 빈약한 공식문서

옵션만 몇개 띵그러니 있고 도대체 얘가 무슨 일을 하는지를 알수가 없습니다. 결국 들어가서 코드를 보니 `postsDir` 밑에 있는 markdown 파일들에 대해서 여러가지 전처리를 해줍니다. 딱히 얘가 있어서 실제로 글을 정리해 주거나 그런 기능은 없습니다.

## 사용해보기
일단 `vuepress eject docs` 을 통해서 default theme 을 꺼내야 합니다.

그러면 아마 `theme` 폴더에 많은 파일들이 생긴 것을 알수가 있을 것 입니다.

이제 `theme/layouts` 폴더에 `Tags.vue`,  `Tag.vue`, `Post.vue` 을 만듭시다.

그 뒤, 일단 `Layout.vue` 에 있는 내용을 전부다 복사 붙여넣기를 해봅시다.

이제 `블로그주소/tags/` 에 접속하게 되면 `Tags.vue` 가 보이게 되고, 각각의 글에 대해서는 `Post.vue` 가 보이게 됩니다. 

`tags` 에 아무것도 보이지 않을 것 입니다. 

`components/TagList.vue` 을 만들고

```html
<!-- .vuepress/components/TagList.vue -->
<template lang="html">
  <div>
    <span v-for="tag in tags">
      <h2 :id="tag">
        <router-link :to="{ path: tag.path }"> {{tag.name}} </router-link>
      </h2>
      <ul>
        <li v-for="page in tag.posts">
          <router-link
            :to="{ path: page.path}" >{{page.title}} </router-link>
        </li>
      </ul>
    </span>
  </div>
</template>

<script>
export default {
  props: ['tags'],
}
</script>
```

이렇게 만들어 줍시다. 그뒤에, `Tags.vue` 에서

```js
import TagList from '../../components/TagList.vue'

// 컴포넌트 마지막에 추가
components: { Home, Page, Sidebar, Navbar, TagList },
// computed 에 추가
computed: {
    tagItems () {
      return this.$tags.list
    }, ...
}
```

을 추가해 줍시다.

그릭고 다시 `Tags.vue` 에서

```html
    <Page
      v-else
      :sidebar-items="sidebarItems"
    >
      <slot
        name="page-top"
        slot="top"
      >
        <TagList
          class="custom-component top"
          :tags="tagItems"
        />
      </slot>
      <slot
        name="page-bottom"
        slot="bottom"
      />
    </Page>
```

을 추가

이제 다시 `블로그주소/tags/` 에 접속하게 되면 모든글에 대해서 Tag 가 정리되서 보일 것 입니다.

## Blog plugin 이 하는일

markdown 에 있는 태그들을 읽고 각각의 태그들에 대해서 글을 정리합니다. 그리고 그 값을 `this.$tags` 에 넣는것 이지요. 궁금하시면 저기 `tagItems()` 함수 안에 `console.log(this.$tags)` 을 하시고 개발자 도구를 켜보세요. 어떤 값들이 들어가 있는지 알수 있습니다.

그리고 우리는 tags 에 해당하는 markdown 파일을 만들지 않았지만 blog-plugin 이 자동으로 빈 파일을 만들어 줍니다. 그리고 그걸 `Tags.vue` 에 연결을 시켜주죠.

또한 각각의 블로그 글은 `Post` 에 연결을 시켜줍니다.

예를 들어 각각의 블로그 글 밑에 댓글을 만들고 싶다면

```html
	<Page
      v-else
      :sidebar-items="sidebarItems"
    >
      <slot
        name="page-top"
        slot="top"
      >
      </slot>
      <slot
        name="page-bottom"
        slot="bottom"
      >
        <Disqus class="custom-component disqus bottom" />
      </slot>
    </Page>
```

`Post.vue` 안에서 저 Disqus 부분만 추가 해주시면 홈화면등 다른 화면에서는 영향이 없고 실제 블로그 글 밑에만 댓글창을 만들 수 있습니다. 또한 `Tag.vue` 을 추가하시면

`/tag/태그이름.html` 과 연결된 화면을 만들고 `this.$tag`  에 값을 넣어줍니다.

예를들어 `vue` 라는 태그가 있다고 하면 `/tag/vue.html`  이라는 파일을 새로 생성해 주지 않더라도 자동으로 만들어 주게 되죠.

이제 여기에 vue 태그가 붙은 글들만 리스트로 보여주고 싶다면 `Tag.vue` 파일에 `Tags.vue` 과 비슷하게 수정하고 tagItems 부분만

```js
tagItems () {
      const nowTag = this.$tag.path.split('/')[2].split('.')[0]
      
      return this.$tags.list.filter(tag => tag.name === nowTag)
    }
```

이렇게 바꾸어 주시면 됩니다. 현재의 Tag 와 똑같은 Tag 만 리스트로 만들어 주는것 이지요.

`this.$page` `this.$site` `this.$tag` `this.$tags` 들만 잘 사용해도 대부분의 글들에 접근이 가능하고 정보를 얻을수 있습니다. 하나하나 `console.log` 로 찍어보면서 값들을 보시면 무엇을 어떻게 수정해야 할지 조금씩 보일것 같습니다.
