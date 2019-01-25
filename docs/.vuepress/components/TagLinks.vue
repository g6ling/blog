<template lang="html">
   <div v-if="isNotEmpty" class="wrap">
    Tags:
    <router-link
      v-for="tag in $page.frontmatter.tags"
      :key="tag"
      :to="{ path: `/tag/#${tag}`}">
      {{tag}}
    </router-link>
  </div>
</template>