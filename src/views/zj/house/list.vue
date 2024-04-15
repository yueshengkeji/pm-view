<template>
  <div>
    <v-data-table :headers="headers"
                  :items-per-page="query.itemsPerPage"
                  :options.sync="options"
                  :server-items-length="query.total"
                  :items="items">
      <template v-slot:top>
        <v-row>
          <v-col sm="2" v-if="$store.state.user.name == '1001'">
            <v-file-input label="导入" v-model="importFile" @change="fileChange"></v-file-input>
          </v-col>
          <v-col sm="1">
            <v-btn color="primary" @click="dialog = true">新增</v-btn>
          </v-col>
          <v-col sm="2">
            <v-select v-model="query.floor" :items="floors" label="指定楼层" @change="list"></v-select>
          </v-col>
          <v-col sm="2">
            <v-select v-model="query.yetaiId" item-text="name" item-value="id" :items="ytItems" label="指定业态"
                      @change="list"></v-select>
          </v-col>
          <v-col sm="2">
            <v-select v-model="query.flag" item-text="name" item-value="id" :items="flags" label="租赁状态"
                      @change="list"></v-select>
          </v-col>
          <v-col sm="2">
            <v-text-field label="搜索" v-model="query.searchText" @change="list"></v-text-field>
          </v-col>
          <v-col sm="1">
            <v-btn @click="resetQuery">清空条件</v-btn>
          </v-col>
        </v-row>
      </template>
      <template v-slot:item.action="{item}">
        <v-btn @click="update(item)" x-small outlined class="mr-1" v-if="actionFlag">修改</v-btn>
        <v-btn @click="deleteHandler(item)" x-small outlined color="error" v-if="actionFlag">删除</v-btn>
      </template>
      <template v-slot:item.flag="{item}">
        <v-chip :color="format(item.flag)" outlined x-small>{{ item.flag == 0 ? '未租' : '已租' }}</v-chip>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" width="50%" @close="reset">
      <v-card class="pa-5">
        <v-form ref="houseForm">
          <v-text-field :rules="rules.floor" label="楼层" v-model="data.floor"></v-text-field>
          <v-text-field :rules="rules.pwNumber" label="铺位号" v-model="data.pwNumber"></v-text-field>
          <v-select :rules="rules.yt" v-model="data.yt" label="业态" :items="ytItems" return-object
                    item-text="name"></v-select>
          <v-text-field v-model="data.type" label="品类"></v-text-field>
          <v-text-field v-model="data.acreage" label="面积" type="number"></v-text-field>
          <v-text-field v-model="data.money" label="每月单价" type="number"></v-text-field>
          <v-text-field v-model="data.wyMoney" label="每月物业单价" type="number"></v-text-field>
          <v-text-field v-model="data.remark" label="备注"></v-text-field>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="insertYt" color="primary">确定</v-btn>
          <v-btn @click="dialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {list, insert as insertYt} from '@/api/yetai'
import {floors, houseList, insert, update,del} from '@/api/house'

export default {
  name: "house-list",
  data: () => ({
    actionFlag:false,
    ytItems: [],
    importFile: null,
    items: [],
    headers: [
      {text: '序号', value: 'index'},
      {text: '楼层', value: 'floor'},
      {text: '铺位号', value: 'pwNumber'},
      {text: '业态', value: 'yt.name'},
      {text: '品类', value: 'type'},
      {text: '面积', value: 'acreage'},
      {text: '月单价', value: 'money'},
      {text: '物业费单价', value: 'wyMoney'},
      {text: '备注', value: 'remark'},
      {text: '租赁状态', value: 'flag'},
      {text: '操作', value: 'action'}
    ],
    data: null,
    dialog: false,
    query: {
      total: -1,
      itemsPerPage: 10,
      searchText: null,
      yetaiId: null,
      type: null,
      floor: null
    },
    options: {},
    flags: [
      {name: '未租', id: 0},
      {name: '已租', id: 1}
    ],
    floors: [],

    rules: {
      floor: [v => !!v || '请输入楼层信息'],
      pwNumber: [v => !!v || '请输入铺位号'],
      yt: [v => (!!v && v.id != null) || '请选择业态'],
    }
  }),
  watch: {
    options: {
      handler() {
        this.list()
      },
      deep: true,
    }
  },
  created() {

    if(this.$store.state.user.roles.indexOf('系统') !== -1 || this.$store.state.user.roles.indexOf('管理员') !== -1){
      this.actionFlag = true
    }

    list().then(data => {
      this.ytItems = data
    })
    floors().then(data => {
      this.floors = data
    })
    this.reset()
  },
  methods: {
    deleteHandler(item){
      if(item.flag == 0){
        this.confirm(`确定删除${item.pwNumber}?`).then(()=>{
          del(item.id).then(this.list)
        })
      }else{
        this.message('已经租赁，禁止删除')
      }
    },
    format(flag) {
      if (flag == 1) {
        return "success"
      } else {
        return ""
      }
    },
    resetQuery() {
      this.query = {
        total: -1,
        itemsPerPage: 10,
        searchText: null,
        yetaiId: null,
        type: null,
        floor: null
      }
      this.options.page = 0;
      this.list()
    },
    insertYt() {
      let valid = this.$refs['houseForm'].validate()
      console.log('this.data',this.data)
      if (valid) {
        if (this.data.id != null) {
          update(this.data).then(() => {
            this.reset()
            this.dialog = false
            this.list()
          })
        } else {
          insert(this.data).then(() => {
            this.reset()
            this.dialog = false
            this.list()
          })
        }
      }
    },
    list() {
      const {page, itemsPerPage} = this.options
      this.query.page = page
      this.query.itemsPerPage = itemsPerPage

      houseList(this.query).then(data => {
        let {rows, total} = data
        rows.forEach((item, idx) => {
          item.index = idx + 1
        })
        this.items = rows
        this.query.total = total
      })
    },
    reset() {
      this.data = {
        id: null,
        acreage: null,
        yt: {id: null},
        pwNumber: null,
        floor: null,
        type: null,
        remark: null,
        money: null
      }
    },
    fileChange() {
      import("xlsx").then(xlsx => {
        let reader = new FileReader()
        let than = this;
        reader.onload = (e) => {
          than.errorMaterData = []
          const workbook = xlsx.read(e.target.result, {type: 'binary'})
          let sheetList = workbook.SheetNames
          sheetList.forEach((name) => {
            let worksheet = workbook.Sheets[name]
            let newMater = xlsx.utils.sheet_to_json(worksheet, {
              header: ["series", "floor", "pwNumber", "yetaiName", "type", "acreage", "money", "wyMoney","remark"]
            })
            newMater.forEach((item, idx2) => {
              if (idx2 > 0) {
                if (item.floor != null && item.pwNumber != null && item.yetaiName != null && item.acreage != null) {
                  item.floor = item.floor.trim("")
                  item.pwNumber = (item.pwNumber + "").trim("")
                  item.acreage = parseFloat(item.acreage)
                  item.money = parseFloat(item.money)
                  if (isNaN(item.acreage)) {
                    item.acreage = 0
                  }
                  if (isNaN(item.money)) {
                    item.money = 0
                  }
                  if (isNaN(item.wyMoney)) {
                    item.wyMoney = 0
                  }
                  try {
                    item.type = item.type.trim("")
                  } catch (e) {
                    item.type = ""
                  }
                  item.yetaiName = item.yetaiName.trim("")
                  this.ytItems.forEach(yt => {
                    if (item.yetaiName == yt.name) {
                      item.yt = yt
                      return false
                    }
                  })
                  if (item.yt != null) {
                    insert(item);
                  } else {
                    insertYt({name: item.yetaiName}).then(result => {
                      if (result.id) {
                        item.yt = result
                        insert(item)
                      }
                    })
                  }
                }
              }
            });
          })

          window.setTimeout(() => {
            this.list()
          }, 1000)
        }
        reader.readAsBinaryString(this.importFile)
      })

    },
    update(item) {
      this.data = item
      console.log("item", item)
      this.dialog = true
    }
  }
}
</script>

<style scoped>

</style>
