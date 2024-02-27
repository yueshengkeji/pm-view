<template>
    <div>
        <list :pay-type="1" flow-name="采购付款申请"></list>
    </div>
</template>

<script>
    import list from "./list"

    export default {
        name: "pro-pay",
        components:{
            list
        }
    }
</script>

<style scoped>

</style>