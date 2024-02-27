<template>
    <div>
      <v-card class="pa-3">
        <v-data-table :items="putMaterList"
                      selectable-key="id"
                      v-model="selectItems"
                      @click:row="selectHandler"
                      show-select
                      :headers="headers">
          <template v-slot:top>
            <v-row dense>
              <v-spacer></v-spacer>
              <v-col>
                <v-text-field label="搜索" v-model="searchText" dense hide-details @change="list"></v-text-field>
              </v-col>
            </v-row>
          </template>
          <template v-slot:item.material.id="{item}">
            {{ formatId(item) }}
          </template>
          <template v-slot:item.index="{index}">
            {{ index + 1 }}
          </template>
        </v-data-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="change">确定</v-btn>
        </v-card-actions>
      </v-card>

    </div>
</template>

<script>
    import {getMaterByProject} from '@/api/put'

    export default {
        name: "putMaterialByProject",
        data: () => ({
            putMaterList: [],
            headers: [
                {text: '序号', value: 'index', width: '60px'},
                {text: '材料编码', value: 'material.id'},
                {text: '材料名称', value: 'material.name'},
                {text: '型号', value: 'material.model'},
                {text: '品牌', value: 'material.brand'},
                {text: '单位', value: 'material.unit.name'},
                {text: '入库数量', value: 'putSum', width: '150px'},
                {text: '库存数量', value: 'material.storageSum', width: '150px'},
                {text: '单价', value: 'taxPrice', width: '150px'},
                {text: '金额', value: 'moneyTax'},
                {text: '入库单号', value: 'putNumber'},
            ],
            selectItems: [],
            searchText: null
        }),
        props: {
            projectId: String,
            materialList: Array
        },
        watch: {
            selectItems: {
                handler() {
                    this.$emit("input", this.selectItems)
                },
                deep: true
            },
            projectId(){
                this.list()
            }
        },
        model: {
            event: "input",
            prop: 'materialList'
        },
        created() {
            this.list()
        },
        methods: {
            change(){
                this.$emit('change',this.selectItems)
            },
            selectHandler(e, props) {
                props.select(!props.isSelected)
            },
            formatId(item) {
                let id = item.material.id
                let x = id.indexOf("-");
                return id.substring(0, x === -1 ? id.length : x)
            },
            list() {
                getMaterByProject({projectId: this.projectId, searchText: this.searchText}).then(result => {
                    this.putMaterList = result
                })
            }
        }
    }
</script>

<style scoped>

</style>