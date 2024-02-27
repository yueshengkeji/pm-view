<template>
    <div>
        <procurement-list ref="pl" isDownload @updateDownloadState="updateState"></procurement-list>
    </div>
</template>

<script>
    import procurementList from './list/list';

    export default {
        name: "index",
        components:{
            procurementList
        },
        methods:{
            updateState(){
                this.$refs.pl.list()
            }
        }
    }
</script>

<style scoped>

</style>