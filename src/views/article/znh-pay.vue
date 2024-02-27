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
            folderId: 'U0XT#CYV;U0TAVJ6E'
        })
    }
</script>

<style scoped>

</style>