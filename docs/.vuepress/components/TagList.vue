<!-- .vuepress/components/TagList.vue -->
<template lang="html">
  <div>
    <span v-for="tag in extractTags">
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
  computed: {
    extractTags () {
      return this.$props.tags.map(tag => ({
        ...tag,
        posts: tag.posts.filter(post => !post.frontmatter.tags.includes('WIP'))
      }))
    }
  }
}
</script>