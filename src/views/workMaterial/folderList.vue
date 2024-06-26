<template>
  <div>
    <v-btn outlined color="primary" @click="insertHandler" small>新增</v-btn>
    <v-treeview
        :active.sync="active"
        :items="items"
        :load-children="fetchUsers"
        activatable
        color="warning"
        open-on-click
        transition
    >
      <template v-slot:append="{item}">
        <v-btn outlined x-small @click="editHandler(item)">编辑</v-btn>
      </template>
    </v-treeview>

    <v-dialog width="50%" v-model="editDialog">
      <v-card class="pa-3">
        <v-form ref="form">
          <v-text-field v-model="item.name" :rules="[v => !!v || '请输入名称']" label="名称"></v-text-field>
          <v-btn color="primary" outlined @click="saveHandler" :loading="loading">保存</v-btn>
        </v-form>
      </v-card>
    </v-dialog>
  </div>


</template>

<script>
import {folderList, updateFolder, insertFolder} from "@/api/workMaterial";

export default {
  name: "workMater-folder-list",
  data: () => ({
    items: [],
    active: [],
    item: {
      name: null
    },
    editDialog: false,
    loading: false
  }),
  created() {
    this.list()
  },
  methods: {
    saveHandler() {
      if(this.$refs.form.validate()){
        this.loading = true
        let t
        if (this.item.id) {
          t = updateFolder(this.item)
        } else {
          t = insertFolder(this.item)
        }
        t.finally(() => {
          this.editDialog = false
          this.loading = false
          this.list()
        })
      }

    },
    list() {
      folderList().then(res => {
        this.items = res
      })
    },
    fetchUsers(item) {
      console.log(item)
    },
    editHandler(item) {
      this.item = item
      this.editDialog = true
    },
    insertHandler() {
      this.item = {
        id: null,
        name: null,
        parent:''
      }
      this.editDialog = true
    }
  }
}
</script>

<style scoped>

</style>