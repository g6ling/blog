<template>
    <ParentLayout >
        <TagList />
    </ParentLayout>
</template>

<script>
    import ParentLayout from '@parent-theme/layouts/Layout.vue'
    import TagList from '../../components/TagList'
    export default {
        components: {
            ParentLayout,
            TagList,
        }
    }
</script>

<style>
    .padding_top_zero {
        padding-top: 0 !important;
    }
    .padding_bottom_zero {
        padding-bottom: 0 !important;
    }
</style>