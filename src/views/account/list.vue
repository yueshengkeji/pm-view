<template>
    <div>
        <v-row>
            <v-col sm="4">
                <v-btn color="primary" @click="$refs.excelUpload.click()">充值批量导入</v-btn>
                <input style="position: absolute;width:100%;height: 100%;opacity: 0" v-show="false"
                       type="file"
                       ref="excelUpload"
                       id="excelUpload" @change="implUserExcel" accept=".xlsx,.xls"/>
                <v-btn class="ml-1" @click="downloadExcel()">下载导入格式</v-btn>
                <v-btn class="ml-1" @click="exportExcelBalance">导出当前余额</v-btn>
            </v-col>
            <v-spacer></v-spacer>
            <v-col sm="2">
                <v-autocomplete clearable
                                label="部门过滤"
                                item-text="name"
                                item-value="id"
                                return-object
                                @change="filterData"
                                :items="sectionList"></v-autocomplete>
            </v-col>
            <v-col sm="3">
                <v-text-field label="搜索" v-model="search"></v-text-field>
            </v-col>
        </v-row>

        <v-data-table :items.sync="items"
                      :loading="loading"
                      :search="search"
                      hide-default-footer
                      :items-per-page="-1"
                      :headers="headers">
            <template v-slot:item.rechargeAmount="{item}">
                <v-text-field :title="item.staff.name"
                              :label="item.staff.name"
                              v-model="item.money"
                              @keyup.enter="rechargeAmount(item)"
                              type="number"></v-text-field>
            </template>
            <template v-slot:item.action="{item}">
                <v-btn x-small color="primary" class="mr-1" :loading="item.loading" @click="rechargeAmount(item)">确定充值
                </v-btn>
                <v-btn x-small color="error" class="mr-1" :loading="item.loading" @click="returnAmount(item)">确定退款
                </v-btn>
                <v-btn x-small @click="history(item)">充值记录</v-btn>
            </template>
        </v-data-table>
        <v-snackbar v-model="msgFlag">{{msg}}</v-snackbar>

        <v-dialog v-model="historyDialog">
            <v-card class="pa-5">
                <history :staffId="accountItem.staff.id"></history>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="historyDialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="exportDialog" width="50%">
            <v-card class="pa-3">

                <v-progress-linear :value="percentage.number"
                                   :height="18"
                                   rounded
                                   :active="percentage.linerActive">

                    <template v-slot:default="{value}">

                        <span v-if="value !== 100" style="color:#FFFF">{{ percentage.content + ' ' + value + '%' }}</span>

                        <span v-else style="color:#FFFF">{{ percentage.content }}</span>

                    </template>
                </v-progress-linear>

                <v-data-table :items="exportData"
                              hide-default-footer
                              :items-per-page="-1"
                              :headers="exportHeader">
                    <template v-slot:item.error="{item}">
                        <div v-if="item.error" class="red--text">{{item.error}}</div>
                    </template>
                </v-data-table>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-chip small color="success" class="mr-1">充值成功金额合计：{{rechargeMoney}}</v-chip>
                    <v-chip small color="error" class="mr-1">充值失败金额合计：{{errorMoney}}</v-chip>
                    <v-btn @click="downloadExcelError" color="error" class="mr-1">导出错误列表</v-btn>
                    <v-btn @click="exportDialog = false">关闭</v-btn>
                </v-card-actions>

            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import {list, rechargeAmount, returnAmount,exportExcelBalance} from '@/api/account'
    import history from './history'
    import excelExport from '@/utils/excel-export';

    export default {
        name: "account-list",
        components: {
            history
        },
        data: () => ({
            loading: false,
            items: [],
            filterItems: [],
            headers: [
                {text: '姓名', value: 'staff.name'},
                {text: '部门', value: 'staff.section.name'},
                {text: '余额', value: 'balance'},
                {text: '最后充值/消费时间', value: 'lastDatetime'},
                {text: '充值/退款操作', value: 'rechargeAmount', width: '300px'},
                {text: '其他', value: 'action', width: '300px'},
            ],
            search: null,
            msg: null,
            msgFlag: false,
            sectionList: [],
            accountItem: {
                staff: {id: null}
            },
            historyDialog: false,
            accountMap: [],
            rechargeMoney: 0,
            errorMoney: 0,
            exportDialog: false,
            exportData: [],
            exportHeader: [
                {text: '序号', value: 'index'},
                {text: '姓名', value: 'name'},
                {text: '充值金额', value: 'money'},
                {text: '异常信息', value: 'error'},
            ],
            percentage:{
                number:0,
                linerActive:false,
                content:''
            }
        }),
        created() {
            this.loadList()
        },
        methods: {
            implUserExcel(e) {
              import("xlsx").then(xlsx => {
                this.rechargeMoney = 0
                this.errorMoney = 0
                let reader = new FileReader();
                let than = this;
                than.exportDialog = true;
                than.exportData = []
                than.percentage.number = 0
                reader.onload = function (e) {
                  than.errorMaterData = [];
                  const workbook = xlsx.read(e.target.result, {type: 'binary'});
                  let sheetList = workbook.SheetNames
                  sheetList.forEach(async (name) => {
                    than.offEdit = true;
                    than.percentage.linerActive = true;
                    than.percentage.content = "正在处理清单"
                    let worksheet = workbook.Sheets[name];
                    let newMater = xlsx.utils.sheet_to_json(worksheet, {header: ["index", "name", "money"]});
                    for (let x = 1; x < newMater.length; x++) {
                      than.percentage.content = "正在处理清单,第" + x + "行"
                      await than.uploadMoney(newMater[x], x, newMater.length).then((data) => {
                        than.exportData.push(data)
                      }).catch(data => {
                        than.exportData.push(data)
                        than.errorMoney += data.money
                      })
                      if (x == newMater.length - 1) {
                        than.percentage.number = 100
                        than.percentage.content = `${name}导入完成`
                      }
                    }
                  });
                };
                if (e.target.files[0] != null) {
                  //读取数据
                  reader.readAsBinaryString(e.target.files[0]);
                }
              })

            },
            uploadMoney(data,index,total) {
                return new Promise((resolve, reject) => {
                    window.setTimeout(()=>{
                        if(data == null){
                            reject(data)
                            return
                        }
                        this.percentage.number = parseInt(index / total * 100);
                        data.money = parseFloat(data.money)
                        data.name = (data.name+"").trim("")
                        let account
                        if (isNaN(data.money)) {
                            this.$set(data, 'error', '充值金额不能为空')
                            reject(data)
                        } else if ((account = this.accountMap[data.name]) == null) {
                            this.$set(data, 'error', '账户信息不存在')
                            reject(data)
                        } else {
                            rechargeAmount({staff: account.staff, money: data.money, type: 0}).then(() => {
                                account.balance = (parseFloat(account.balance) + data.money).toFixed(2)
                                account.money = ""
                                this.rechargeMoney += data.money
                                resolve(data)
                            }).finally(() => {

                            })
                        }
                    },200)
                })
            },
            downloadExcel() {
                excelExport([
                    {key: 'index', title: '序号'},
                    {key: 'name', title: '姓名'},
                    {key: 'money', title: '充值金额'},
                ], [
                    {index: '', name: '', money: ""},
                ], "充值导入模板.xlsx");
            },
            downloadExcelError() {
                let dataArray = []
                this.exportData.forEach(item=>{
                    if(item.error){
                        dataArray.push(item)
                    }
                })
                excelExport([
                    {key: 'index', title: '序号'},
                    {key: 'name', title: '姓名'},
                    {key: 'money', title: '充值金额'},
                ],dataArray, "导入失败数据.xlsx");
            },
            filterData(value) {
                console.log(value)
                if (value != null) {
                    this.items = []
                    this.filterItems.forEach(item => {
                        try {
                            if (item.staff.section.name == value.name) {
                                this.items.push(item)
                            }
                        } catch (e) {
                            console.log(e)
                        }
                    })
                } else {
                    this.items = this.filterItems
                }
            },
            rechargeAmount(item) {
                if (item.money > 0) {
                    item.loading = true
                    rechargeAmount({staff: item.staff, money: item.money, type: 0}).then(() => {
                        item.balance = (parseFloat(item.balance) + parseFloat(item.money)).toFixed(2)
                        item.money = ""
                    }).finally(() => {
                        item.loading = false
                    })
                } else {
                    this.msg = "充值金额不能小于0"
                    this.msgFlag = true
                }
            },
            returnAmount(item) {
                if (item.money > 0) {
                    item.loading = true
                    returnAmount({staff: item.staff, money: item.money, type: 0}).then(() => {
                        item.balance = (parseFloat(item.balance) - parseFloat(item.money)).toFixed(2)
                        item.money = ""
                    }).finally(() => {
                        item.loading = false
                    })
                } else {
                    this.msg = "退款金额不能小于0"
                    this.msgFlag = true
                }
            },
            history(item) {
                this.accountItem.staff.id = item.staff.id
                this.historyDialog = true
            },
            loadList() {
                this.loading = true
                list().then((result) => {
                    result.forEach(item => {
                      if(item.staff){
                        this.accountMap[item.staff.name] = item
                        item.money = "";
                        item.loading = false
                        try {
                          this.sectionList.push(item.staff.section)
                        } catch (e) {
                          console.log(e)
                        }
                      }else{
                        item.staff = {name:''}
                      }

                    })
                    this.filterItems = result
                    this.items = result
                    // console.log(this.items)
                }).finally(() => this.loading = false)
            },
            exportExcelBalance(){
                exportExcelBalance().then(result => {
                    let a = document.createElement("a");
                    a.download = result.substr(result.lastIndexOf("/") + 1)
                    a.href = result
                    a.click()
                })
            },
        }
    }
</script>

<style scoped>

</style>