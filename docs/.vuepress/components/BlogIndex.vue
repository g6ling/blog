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
        .filter(x => x.path.startsWith("/blog/posts/notes/"))
        .filter(x => !x.frontmatter.tags.includes('WIP'))
        .sort(
          (a, b) => new Date(b.frontmatter.created) - new Date(a.frontmatter.created)
        );
    }
  }
};
</script>