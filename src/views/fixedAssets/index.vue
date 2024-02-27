<template>
    <div>
        <insert-fixed-apply :cols="cols"></insert-fixed-apply>
    </div>
</template>

<script>

    export default {
        name: "index",
        components: {
            insertFixedApply: () => import('@/components/1320283')
        },
        data:()=>({
            cols:12
        }),
        created() {
            this.cols = this.$vuetify.breakpoint.xs ? 12 : 6
        }
    }
</script>

<style scoped>

</style>