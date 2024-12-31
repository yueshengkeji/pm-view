<template>
  <div>
      <list :list-type="listType"></list>
  </div>
</template>
<script>
  import list from "@/views/zj/bill/list.vue";
  export default {
      name:'listPaid',
      components:{list},
      data:() => ({
        listType: 'listPaid'
      })
  }
</script>