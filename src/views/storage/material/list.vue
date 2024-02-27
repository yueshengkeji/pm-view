<template>
    <div>
        <!--        http://192.168.2.254:8089/managent/getPage?pageName=material/materialManager-->
        <iframe frameborder="none" id="iframe" ref="iframe"
                :src="'/managent/getPage?pageName=material/materialManager&token='+$store.state.user.token"
                style="width: 100%;"></iframe>
    </div>
</template>

<script>
    export default {
        name: "putlist",
        mounted() {
            const iframe = document.querySelector('#iframe')
            // 处理兼容行问题
            if (iframe.attachEvent) {
                iframe.attachEvent('onload', () => {
                    // iframe加载完毕以后执行操作
                    this.setIframeHeight(iframe);
                })
            } else {
                iframe.onload = () => {
                    // iframe加载完毕以后执行操作
                    this.setIframeHeight(iframe);
                }
            }
        }
    }
</script>

<style scoped>

</style>