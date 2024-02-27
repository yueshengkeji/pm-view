<template>
  <div>
    <v-select :items="storageList"
              :rules="rules"
              :dense="dense"
              return-object
              item-value="id"
              item-text="name"
              v-model="data"
              :label="label">
      <template v-slot:append-item>
        <v-btn x-small block color="primary" @click="insertDialogHandler">新增仓库</v-btn>
        <v-btn x-small block color="error" class="mt-1" @click="clearStorageHandler">清空所选仓库</v-btn>
      </template>
    </v-select>
    <v-dialog v-model="insertDialog" width="30%">
      <v-card class="pa-3">
        <v-form ref="storageForm">
          <v-text-field label="仓库名称" :rules="[v => !!v || '请输入仓库名称']" v-model="data.name"
                        dense></v-text-field>
          <v-text-field label="排序序号" v-model="data.sortNumber" dense></v-text-field>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="insertDialog=false" small>取消</v-btn>
          <v-btn color="primary" small @click="insertHeader">提交</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {putStorage, storageList} from '@/api/storage'

export default {
  name: "storageManager",
  props: {
    dense: Boolean,
    label: {
      type: String,
      default: '选择仓库'
    },
    putStorage: Object,
    rules: Array
  },
  watch: {
    putStorage: {
      handler() {
        if (this.putStorage) {
          this.$emit("change", this.putStorage)
        } else {
          this.reset()
        }
      },
      deep: true
    },
    data: {
      handler() {
        this.$emit("change", this.data)
        if (this.data != null && this.data.id != null) {
          localStorage.setItem("ls", JSON.stringify({
            id: this.data.id,
            name: this.data.name
          }))
        }
      },
      deep: true,
    },
  },
  model: {
    prop: 'putStorage',
    event: 'change'
  },
  data: () => ({
    storageList: [],
    insertDialog: false,
    data: {
      id: null,
      name: '',
      sortNumber: ""
    },
  }),
  created() {
    storageList().then(result => {
      this.storageList = result
      let data = this.getLocalStorage()
      if ((data == null || data.id == null) && this.storageList.length > 0) {
        this.data = this.storageList[0]
      } else {
        this.data = data
      }
    })
  },
  methods: {
    getLocalStorage() {
      let ls = localStorage.getItem("ls")
      if (ls == null || ls == "") {
        return {
          id: null,
          name: '',
          sortNumber: ""
        }
      } else {
        return JSON.parse(ls)
      }
    },
    clearStorageHandler() {
      localStorage.removeItem("ls")
      this.data = {
        id: null,
        name: '',
        sortNumber: ""
      }
    },
    insertDialogHandler() {
      this.reset()
      this.insertDialog = true
    },
    insertHeader() {
      let valid = this.$refs.storageForm.validate()
      if (valid) {
        putStorage(this.data).then(res => {
          if (res.id) {
            this.data = res
            this.storageList.push(res)
          }
          this.insertDialog = false
        })
      }
    },
    reset() {
      this.data = this.getLocalStorage()
    }
  }
}
</script>

<style scoped>

</style>