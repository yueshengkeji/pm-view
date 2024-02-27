<template>
    <div>
        <v-row>
            <v-col sm="1">
                <v-btn color="primary" @click="exportMater">导入</v-btn>
                <input style="position: absolute;width:100%;height: 100%;opacity: 0" v-show="false"
                       type="file"
                       ref="excelUpload"
                       id="excelUpload"
                       @change="implUserExcel" accept=".xlsx,.xls"/>
            </v-col>
            <v-col sm="1">
                <v-btn @click="downloadModule">下载导入模板</v-btn>
            </v-col>
            <v-spacer></v-spacer>
            <v-col sm="2">
                <v-menu ref="menu1" v-model="menu1">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                                v-model="options.startDate"
                                label="开始日期"
                                prepend-icon="mdi-calendar"
                                v-bind="attrs"
                                v-on="on"

                        ></v-text-field>
                    </template>
                    <v-date-picker
                            v-model="options.startDate"
                            no-title
                            scrollable
                            @change="$refs.menu1.save()"
                    >
                    </v-date-picker>
                </v-menu>
            </v-col>
            <v-col sm="2">
                <v-menu ref="menu2" v-model="menu2">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                                v-model="options.endDate"
                                label="截止日期"
                                prepend-icon="mdi-calendar"
                                v-bind="attrs"
                                v-on="on"

                        ></v-text-field>
                    </template>
                    <v-date-picker
                            v-model="options.endDate"
                            no-title
                            scrollable
                            @change="$refs.menu1.save()"
                    >
                    </v-date-picker>
                </v-menu>
            </v-col>
            <v-col sm="2">
                <v-text-field label="搜索" :loading="loading" v-model="options.searchText"></v-text-field>
            </v-col>
        </v-row>

        <v-data-table :headers="headers"
                      :loading="loading"
                      sort-desc
                      sort-by="po20203"
                      :options.sync="options"
                      :server-items-length="query.total"
                      :items="items">

        </v-data-table>

        <v-dialog v-model="detailDialog">
            <v-card class="pa-5">
                <v-data-table :headers="headers"
                              :items="importArray"
                              hide-default-footer>

                </v-data-table>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-chip class="mr-1">{{msg}}，合计：{{sums}}个耗材，{{moneys}}元，{{importArray.length}}个种类</v-chip>
                    <v-btn @click="detailDialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
            <v-snackbar v-model="msgFlag">{{msg}}</v-snackbar>
        </v-dialog>

    </div>
</template>

<script>
    import {insert, list} from '@/api/workMaterialPut'
    import excelExport from '@/utils/excel-export'

    export default {
        name: "workMaterPut-index",
        components: {},
        data: () => ({
            loading: false,
            menu1: false,
            menu2: false,
            items: [],
            headers: [
                {
                    text: "材料名称",
                    value: 'material.name'
                },
                {
                    text: "型号",
                    value: 'material.model'
                },
                {
                    text: "入库数量",
                    value: 'sum'
                },
                {
                    text: "单位",
                    value: 'material.unit.name'
                },
                {
                    text: "单价",
                    value: 'price'
                },
                {
                    text: "金额",
                    value: 'money'
                },

            ],
            query: {total: 0},
            options: {searchText: null, startDate: null, endDate: null},
            detailDialog: false,
            item: null,

            importArray: new Array(),
            msg: null,
            msgFlag: false,
            sums: 0,
            moneys: 0,
        }),
        watch: {
            options: {
                handler() {
                    this.list()
                },
                deep: true
            },
            detailDialog(){
                if(!this.detailDialog){
                    this.list()
                }
            }
        },
        created() {

        },
        methods: {
            downloadModule() {
                excelExport([
                    {key: 'index', title: '序号'},
                    {key: 'name', title: '材料名称'},
                    {key: 'model', title: '型号'},
                    {key: 'storageSum', title: '数量'},
                    {key: 'unitName', title: '单位'},
                    {key: 'planPrice', title: '单价'},
                ], [
                    {index: '', name: '', model: "", storageSum: "", unitName: "", planPrice: ""},
                ], "办公用品导入模板.xlsx");
            },
            list() {
                this.loading = true
                this.query = Object.assign({}, this.options)
                this.query.sortBy = this.query.sortBy[0]
                this.query.sortDesc = this.query.sortDesc[0]
                list(this.query).then(result => {
                    this.items = result.rows
                    this.query.total = result.total
                }).finally(() => this.loading = false)
            },
            exportMater() {
                this.importArray = new Array()
                this.detailDialog = true
                this.$refs.excelUpload.click()
            },
            implUserExcel(e) {
              import("xlsx").then(xlsx => {
                this.sums = 0
                this.moneys = 0
                let reader = new FileReader()
                let than = this;
                reader.onload = function (e) {
                  than.errorMaterData = []
                  const workbook = xlsx.read(e.target.result, {type: 'binary'})
                  let sheetList = workbook.SheetNames
                  than.msg = '处理材料'
                  sheetList.forEach(async (name) => {
                    let worksheet = workbook.Sheets[name]
                    let newMater = xlsx.utils.sheet_to_json(worksheet, {header: ["series", "name", "model", "storageSum", "unitName", "planPrice", "money"]})
                    for (let x = 1; x < newMater.length; x++) {
                      await new Promise((resolve, reject) => {
                        window.setTimeout((j) => {
                          try {
                            let m = than.sheetMaterialModel(newMater[j])
                            m.index = j + 1
                            if (than.verifyMaterial(m)) {
                              let r = {material: m, sum: m.storageSum, price: m.planPrice, money: 0}
                              r.sum = parseFloat(r.sum)
                              r.price = parseFloat(r.price)
                              if (!isNaN(r.sum)) {
                                than.sums += r.sum
                                if (!isNaN(r.price)) {
                                  r.money = r.sum * r.price
                                  than.moneys += r.money
                                }
                              }
                              than.importArray.push(r)
                            } else {
                              than.msgFlag = true
                            }
                            resolve(m)
                          } catch (e) {
                            reject(e)
                          }
                        }, 10, x)
                      })
                    }
                    than.msg = '正在上传'
                    than.save()
                  })
                }
                if (e.target.files[0] != null) {
                  //读取数据
                  reader.readAsBinaryString(e.target.files[0])
                }
              })

            },
            save() {
                let data = {
                    name: '办公用品入库' + this.formatTimer(new Date()),
                    detailList: this.importArray,
                    remark: ''
                }
                this.loading = true
                insert(data).then(result => {
                    if (result.id) {
                        this.msg = "导入成功"
                    }
                }).finally(()=>{
                    this.loading = false
                })
            },
            verifyMaterial(m) {
                let result = false;
                if (m.material !== null) {
                    if (!this.isNotNull(m.model)) {
                        m.model = ""
                    }
                    if (!this.isNotNull(m.remark)) {
                        m.remark = ""
                    }
                    if (!this.isNotNull(m.name)) {
                        this.msg = "第" + m.index + "行，材料名称不能为空"
                    } else if (!this.isNotNull(m.storageSum)) {
                        this.msg = "第" + m.index + "行，数量不能为空"
                    } else if (!this.isNotNull(m.unit) || !this.isNotNull(m.unit.name)) {
                        this.msg = "第" + m.index + "行，材料单位不能为空"
                    } else if (!this.isNotNull(m.planPrice) || isNaN(m.planPrice)) {
                        m.planPrice = 0;
                        result = true
                    } else {
                        result = true
                    }
                }
                return result
            },
        }
    }
</script>

<style scoped>

</style>