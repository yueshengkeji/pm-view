<template>
    <div>
        <v-form ref="checkMaterForm" :disabled="data.state == 1">
            <v-row dense>
                <v-col sm="3">
                    <storage-manager ref="sm" label="盘点仓库" v-model="data.storage" :rules="rules.s"></storage-manager>
                </v-col>
                <v-col sm="3">
                    <v-text-field label="盘点单号" v-model="data.checkNumber"></v-text-field>
                </v-col>
                <v-col sm="3">
                    <v-text-field label="备注" v-model="data.remark"></v-text-field>
                </v-col>
                <v-col sm="3">
                    <v-menu ref="menu" v-model="menu">
                        <template v-slot:default="{on,attrs}">
                            <v-text-field label="盘点日期"
                                          v-on="on"
                                          v-bind="attrs"
                                          v-model="data.checkDate" :rules="rules.cd"></v-text-field>
                        </template>
                        <v-date-picker v-model="data.checkDate" @change="$refs.menu.save()"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" class="text-right">
                    <input style="position: absolute;width:100%;height: 100%;opacity: 0" v-show="false"
                           type="file"
                           ref="excelUpload"
                           id="excelUpload"
                           @change="implUserExcel" accept=".xlsx,.xls"/>
                    <v-btn small @click="downloadExcel">下载导入模板</v-btn>
                    <v-btn small class="ml-1" @click="exportHandler">导入材料</v-btn>
                    <v-btn small class="ml-1" @click="selectDialog = true">选择系统材料</v-btn>
                </v-col>
                <v-col cols="12">
                    <v-data-table :items="data.materList"
                                  hide-default-footer
                                  :items-per-page="-1"
                                  :headers="headers">
                        <template v-slot:item.material.id="{item}">
                            {{formatId(item.material.id)}}
                        </template>
                        <template v-slot:item.price="{item}">
                            <v-text-field dense
                                          @change="priceChange(item)"
                                          v-model="item.price"></v-text-field>
                        </template>
                        <template v-slot:item.money="{item}">
                            <v-text-field dense
                                          @change="moneyChange(item)"
                                          v-model="item.money"></v-text-field>
                        </template>
                        <template v-slot:item.realitySum="{item}">
                            <v-text-field :rules="rules.rs"
                                          @change="priceChange(item)"
                                          dense
                                          v-model="item.realitySum"></v-text-field>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-form>
        <!--选择系统材料-->
        <select-material v-model="selectDialog" @select="selectHandler"></select-material>
        <!--        导出异常材料清单-->
        <v-dialog v-model="errorDialog" width="80%">
            <v-card class="pa-3">
                <v-data-table :items="errorArray"
                              hide-default-footer
                              :headers="errorHeader">
                    <template v-slot:item.name="{item}">
                        {{isNotNull(item.name) ? item.name : '材料名称不能为空'}}
                    </template>
                    <template v-slot:item.unitName="{item}">
                        {{isNotNull(item.unitName) ? item.unitName : '单位不能为空'}}
                    </template>
                    <template v-slot:item.brand="{item}">
                        {{isNotNull(item.brand) ? item.brand : '品牌不能为空'}}
                    </template>
                    <template v-slot:item.storageSum="{item}">
                        {{isNotNull(item.storageSum) ? item.storageSum : '库存实际数量不能为空'}}
                    </template>
                </v-data-table>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="errorDialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>
    import storageManager from "../views/storage/storageManager"
    import excelExport from '@/utils/excel-export'
    const xlsx = () => import("xlsx")
    import material from "@/api/material"
    import {insert, update} from '@/api/check'

    export default {
        name: "frame-15309",
        components: {
            storageManager,
            selectMaterial: () => import('@/components/material/select')
        },
        props: {
            checkData: Object
        },
        watch: {
            checkData: {
                handler() {
                    if (this.checkData) {
                        this.data = this.checkData
                    }
                },
                deep: true
            },
            data: {
                handler() {
                    this.$emit("change", this.data)
                },
                deep: true
            }
        },
        model: {
            prop: 'checkData',
            event: "change"
        },
        data: () => ({
            data: null,
            rules: {
                s: [
                    v => (!!v && !!v.id) || '请选择盘点仓库'
                ],
                cd: [
                    v => (!!v) || '请选择盘点日期'
                ],
                rs: [
                    v => (!!v) || '请输入库存实际数量'
                ],
            },
            headers: [
                {text: '材料编码', value: 'material.id'},
                {text: '材料名称', value: 'material.name'},
                {text: '型号', value: 'material.model'},
                {text: '品牌', value: 'material.brand'},
                {text: '盘点前数量', value: 'sum'},
                {text: '单价', value: 'price'},
                {text: '金额', value: 'money'},
                {text: '实际数量', value: 'realitySum'},
            ],
            selectDialog: false,
            menu: false,
            errorArray: [],
            errorDialog: false,
            errorHeader: [
                {text: '行号', value: 'index'},
                {text: '材料名称', value: 'name'},
                {text: '型号', value: 'model'},
                {text: '品牌', value: 'brand'},
                {text: '单位', value: 'unitName'},
                {text: '实际数量', value: 'storageSum'},
                {text: '单价', value: 'planPrice'},
                {text: '备注', value: 'remark'},
            ]
        }),
        created() {
            if (this.checkData && this.checkData.materList) {
                this.data = this.checkData
            } else {
                this.reset()
            }
        },
        methods: {
            priceChange(item) {
                let p = parseFloat(item.price)
                let s = parseFloat(item.realitySum)
                if (!isNaN(p) && !isNaN(s)) {
                    item.money = new Number((p * s).toFixed(2))
                }
            },
            moneyChange(item) {
                let m = parseFloat(item.money)
                let s = parseFloat(item.realitySum)
                if (!isNaN(m) && !isNaN(s)) {
                    item.price = new Number((m / s).toFixed(2))
                }
            },
            implUserExcel(e) {
                this.errorArray = []
                let reader = new FileReader()
                let than = this;
                reader.onload = function (e) {
                    this.exportLoading = true
                    const workbook = xlsx.read(e.target.result, {type: 'binary'})
                    let sheetList = workbook.SheetNames
                    sheetList.forEach(async (name) => {
                        let importArray = []
                        let worksheet = workbook.Sheets[name]
                        let newMater = xlsx.utils.sheet_to_json(worksheet, {header: ["index", "name", "model", "brand", "unitName", "storageSum", "planPrice"]})
                        for (let x = 1; x < newMater.length; x++) {
                            let m = newMater[x]
                            if (than.isNotNull(m.name) &&
                                than.isNotNull(m.unitName) &&
                                than.isNotNull(m.brand) &&
                                than.isNotNull(m.storageSum)) {
                                m.unit = {name: m.unitName}
                                importArray.push(m)
                            } else {
                                than.errorArray.push(m)
                            }
                        }
                        if (than.errorArray.length > 0) {
                            than.errorDialog = true
                        }
                        importArray.forEach(item => {
                            material.newmaterial(item).then(result => {
                                if (result && result.id) {
                                    let checkMater = {
                                        material: result,
                                        realitySum: result.storageSum,
                                        price: result.planPrice,
                                        money: '0'
                                    }
                                    let p = parseFloat(checkMater.planPrice)
                                    let s = parseFloat(checkMater.storageSum)
                                    if (!isNaN(p) && !isNaN(s)) {
                                        checkMater.money = new Number((p * s).toFixed(2))
                                    }
                                    than.data.materList.push(checkMater)
                                }
                            })
                        })
                    })
                }
                if (e.target.files[0] != null) {
                    //读取数据
                    reader.readAsBinaryString(e.target.files[0])
                }
            },
            exportHandler() {
                this.$refs.excelUpload.click()
            },
            downloadExcel() {
                excelExport([
                    {key: 'index', title: '序号'},
                    {key: 'name', title: '材料名称'},
                    {key: 'model', title: '规格型号'},
                    {key: 'brand', title: '品牌'},
                    {key: 'unitName', title: '单位'},
                    {key: 'storageSum', title: '实际数量'},
                    {key: 'planPrice', title: '单价'},
                ], [
                    {index: '', name: '', model: "", brand: "", unitName: "", storageSum: "", planPrice: ""},
                ], "库存盘点单导入模板.xlsx");
            },
            selectHandler(items) {
                this.selectDialog = false
                items.forEach(item => {
                    this.data.materList.push({
                        material: item,
                        price: item.costPrice,
                        money: '0',
                        realitySum: null,
                        sum: item.storageSum
                    })
                })
            },
            reset() {
                this.data = {
                    storage: null,
                    checkNumber: null,
                    checkDate: this.dateFormat(new Date(), 'YYYY-mm-dd'),
                    remark: null,
                    materList: []
                }
                if (this.$refs.checkMaterForm) {
                    this.$refs.checkMaterForm.resetValidation()
                    this.data.storage = this.$refs.sm.getLocalStorage()
                }
            },
            save() {
                if (this.$refs.checkMaterForm.validate()) {
                    if (this.data.id) {
                        return update(this.data)
                    } else {
                        return insert(this.data)
                    }
                } else {
                    return new Promise((resolve, reject) => {
                        reject()
                    })
                }
            }
        }
    }
</script>

<style scoped>

</style>