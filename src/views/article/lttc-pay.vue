<template>
    <div>
        <myArticle :folderId="folderId"></myArticle>
    </div>
</template>

<script>
    import myArticle from './index'

    export default {
        name: "znh-pay",
        components: {
            myArticle
        },
        data: () => ({
            folderId: '9DN4YKLH'
        })
    }
</script>

<style scoped>

</style>