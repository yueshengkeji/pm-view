<template>
  <v-menu ref="toolMenu" v-model="m" :activator="menuActivator" offset-y top>
    <v-data-table :items="items" :headers="headers" :loading="loading" height="250px" hide-default-footer>

    </v-data-table>
  </v-menu>
</template>

<script>
export default {
  name: "absMenu",
  props: {
    items: Array,
    headers: Array,
    loading:Boolean
  },
  data() {
    return {
      m: false,
      menuActivator: null
    }
  },
  methods: {
    showTolMenu(e) {
      let btn = e.target
      if (btn.tagName == "span") {
        btn = btn.parentElement
      } else if (btn.tagName == "td") {
        btn = btn.children()[0]
      }
      this.m = false
      this.menuActivator = btn
      window.setTimeout(() => {
        this.m = true
      }, 50)
    },
  }
}

</script>

<style scoped>

</style>