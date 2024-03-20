<template>
  <div>
    <v-subheader>办公用品领用</v-subheader>
    <v-form ref="workArticle" class="pa-3">
      <v-row>
        <v-col class="hidden-xs-only" md="3" cols="6">
          <v-menu v-model="menu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  ref="menu"
                  min-width="auto">
            <template v-slot:activator="{on,attrs}">
              <v-text-field
                  v-bind="attrs"
                  v-on="on"
                  label="领用日期"
                  v-model="data.outDate"></v-text-field>
            </template>
            <v-date-picker v-model="data.outDate" @change="$refs.menu.save()">

            </v-date-picker>
          </v-menu>
        </v-col>
        <v-col class="hidden-xs-only" md="3" cols="6">
          <v-text-field readonly label="领用人" v-model="data.staff.name"></v-text-field>
        </v-col>
        <v-col class="hidden-xs-only" md="3" cols="6">
          <easy-flow coding="15223" ref="flow" defaultFlowName="办公用品领用"></easy-flow>
        </v-col>
        <v-col md="3" cols="12">
          <v-autocomplete label="请输入需要的办公用品名称"
                          autofocus
                          v-model="selectList"
                          return-object
                          multiple
                          :search-input.sync="searchMater"
                          item-text="name"
                          :items.sync="items">
            <template v-slot:item="data">
              <div>{{ data.item.name + data.item.model + '(' + data.item.unit.name + ')' }}</div>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
      <v-data-table
          hide-default-header
          height="300"
          :items="data.materOutList"
          :headers="headers"
          :items-per-page="10000"
          hide-default-footer>
        <template v-slot:item.sum="{item}">
          <v-text-field style="width: 100%" v-model="item.sum" type="number"></v-text-field>
        </template>
        <template v-slot:item.material.unit.name="{item}">
          <v-text-field style="width: 100%" v-model="item.material.unit.name"></v-text-field>
        </template>
        <template v-slot:item.action="{item}">
          <v-btn x-small color="error" @click="deleteMater(item)">删除</v-btn>
        </template>
      </v-data-table>
    </v-form>
    <v-btn class="float-right" v-if="showSaveBtn" color="primary" @click="save" :block="$vuetify.breakpoint.xs">提交</v-btn>
  </div>
</template>

<script>
import {insert, loadById, loadMater} from '@/api/workMaterial'
import easyFlow from '@/components/easyflow/easyFlow'

export default {
  name: "frame-15223",
  components: {
    easyFlow
  },
  props: {
    frameId: String,
    form: null,
  },
  model: {
    prop: 'form',
    event: 'change'
  },
  watch: {
    frameId: {
      handler() {
        this.reset();
        this.loadData();
      },
      deep: true,
    },
    data: {
      handler() {
        this.$emit("change", this.data)
      },
      deep: true
    },
    searchMater: {
      handler(val) {
        if(val && val != ""){
          window.setTimeout(()=>{
            this.loadMaterList(val)
          },300)
        }
      },
      deep: true
    },
    selectList: {
      handler(val) {
        let idx = 0;
        val.forEach(item => {
          if(this.data.materOutList[idx] == null){
            this.data.materOutList.push({
              index: idx,
              sum: 1,
              taxPrice: 0,
              taxMoney: 0,
              outDate: this.data.outDate,
              material: item,
              remark: ''
            })
          }

          idx++
        })
        this.searchMater = ""
      },
      deep: true
    }
  },
  data: () => ({
    menu: false,
    data: null,
    headers: [
      {text: "办公用品名称", value: 'material.name', width: '20%'},
      {text: "领用数量", value: 'sum', width: '5%'},
      {text: "单位", value: 'material.unit.name', width: '9%'},
      {text: "操作", value: 'action', width: '6%'},
    ],
    items: [],
    searchMater: null,
    selectList: [],
    showSaveBtn:false,
  }),
  created() {
    this.showSaveBtn = this.$route.params.s == '1'
    this.reset();
    this.loadData();
    this.loadMaterList()
  },
  methods: {
    save() {
      return insert(this.data.materOutList).then(result => {
        if (result.id != null) {
          //发起流程
          this.$refs.flow.startFlow({
            title: result.staff.name + '-办公用品领用',
            content: '',
            frameId: result.id,
            frameCoding: 15223,
            frameColumn: 'po20401'
          }).then(() => {
            this.$emit("success", result)
            if(this.showSaveBtn){
              window.location.href = this.$router.options.base+'workMaterial/index'
            }
          })
        }
      })
    },
    deleteMater(deleteItem) {
      this.selectList.splice(deleteItem.index, 1)
    },
    loadMaterList(val) {
      this.items = []
      loadMater({searchText: val, type: 1}).then(result => {
        if (result.rows.length > 0) {
          this.items = result.rows
        } else {
          if (val != null) {
            this.items.push({id: "-1", name: val, model: '', unit: {name: '个'}})
          }
        }
      })
    },
    loadData() {
      if (this.frameId) {
        loadById(this.frameId).then(result => {
          this.data = result
        });
      }
    },
    reset() {
      if (this.form) {
        this.data = this.form
      } else {
        this.data = {
          outDate: this.formatTimer(new Date()),
          staff: {id: this.$store.state.user.id, name: this.$store.state.user.name},
          series: null,
          materOutList: []
        }
      }

    }
  }
}
</script>

<style scoped>

</style>