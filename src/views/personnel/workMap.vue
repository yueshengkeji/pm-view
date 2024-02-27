<template>
    <div>
        <iframe frameborder="none" id="iframe" ref="iframe"
                :src="'/managent/getPage?pageName=personnel/WorkMap&token='+$store.state.user.token"
                style="width: 100%;"></iframe>
    </div>
</template>

<script>
    export default {
        name: "index",
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