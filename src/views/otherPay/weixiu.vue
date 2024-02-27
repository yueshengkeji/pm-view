<template>
    <div>
        <list :pay-type="2" flow-name="设备维修付款"></list>
    </div>
</template>

<script>
    import list from "./list";

    export default {
        name: "weixu-pay",
        components:{
            list
        }
    }
</script>

<style scoped>

</style>