<template>
    <div>
        <v-data-table :items="items" :headers="headers" class="no-padding-table">
            <template v-slot:top>
                <v-btn class="mr-1" x-small color="primary" :disabled="offInsert" @click="insertHandler">添加</v-btn>
                <v-btn x-small :disabled="!offInsert" @click="cancelInsert" class="mr-1">取消</v-btn>
                <span class="grey--text font-weight-thin text-caption">选择日期，输入金额后，回车即可保存</span>
            </template>
            <template v-slot:item.index="{index}">
                {{index+1}}
            </template>
            <template v-slot:item.payDate="{item}">
                <div style="width: 85px">
                    <v-menu :ref="item.id"
                            v-if="item.edit"
                            v-model="menu"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="item.payDate"
                                          @change="save"
                                          class="pa-0"
                                          :ref="item.id+'payDate'"
                                          autofocus
                                          dense
                                          hide-details
                                          readonly
                                          v-bind="attrs"
                                          v-on="on"></v-text-field>
                        </template>
                        <v-date-picker @input="dateChange(item,'payDate')"
                                       v-model="item.payDate"
                                       no-title
                                       scrollable></v-date-picker>
                    </v-menu>
                    <div style="min-height:20px;" v-else @click.stop="editDetailItem('payDate',item)">{{item.payDate}}
                    </div>
                </div>
            </template>
            <template v-slot:item.payMoney="{item}">
                <td>
                    <div style="width:72px;">
                        <v-text-field hide-details
                                      :ref="item.id+'payMoney'"
                                      type="number"
                                      class="pa-0"
                                      dense
                                      @keyup.enter="save"
                                      v-if="item.edit"
                                      v-model="item.payMoney"></v-text-field>
                        <div style="min-height:20px;"
                             v-else
                             @click.stop="editDetailItem('payMoney',item)">
                            {{item.payMoney}}
                        </div>
                    </div>

                </td>
            </template>
            <template v-slot:item.dpDate="{item}">
                <div style="width: 85px;">
                    <v-menu :ref="item.id"
                            v-if="item.edit"
                            v-model="menu2"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="item.dpDate"
                                          class="pa-0"
                                          @change="save"
                                          :ref="item.id+'dpDate'"
                                          autofocus
                                          dense
                                          hide-details
                                          readonly
                                          v-bind="attrs"
                                          v-on="on"></v-text-field>
                        </template>
                        <v-date-picker @input="dateChange(item,'dpDate')"
                                       v-model="item.dpDate"
                                       no-title
                                       scrollable></v-date-picker>
                    </v-menu>
                    <div style="min-height:20px;" v-else @click.stop="editDetailItem('dpDate',item)">{{item.dpDate}}
                    </div>
                </div>
            </template>
            <template v-slot:item.dpMoney="{item}">
                <td>
                    <div style="width:72px">
                        <v-text-field hide-details
                                      :ref="item.id+'dpMoney'"
                                      type="number"
                                      class="pa-0"
                                      dense
                                      @keyup.enter="save"
                                      v-if="item.edit"
                                      v-model="item.dpMoney"></v-text-field>
                        <div style="min-height:20px;" v-else @click.stop="editDetailItem('dpMoney',item)">
                            {{item.dpMoney}}
                        </div>
                    </div>
                </td>
            </template>
            <template v-slot:item.remark="{item}">
                <div style="width:100px">
                    <v-text-field hide-details
                                  :ref="item.id+'remark'"
                                  class="pa-0"
                                  dense
                                  @keyup.enter="save"
                                  v-if="item.edit"
                                  v-model="item.remark"></v-text-field>
                    <div v-else style="min-height: 20px;width: 100%" @click="editDetailItem('remark',item)">{{item.remark}}</div>
                </div>
            </template>
        </v-data-table>
    </div>
</template>

<script>
    import {insert, proDetailDpList} from '@/api/proDetailDp'

    export default {
        name: "payAndBillList",
        data: () => ({
            items: [],
            headers: [
                {text: '序号', value: 'index'},
                {text: '付款日期', value: 'payDate'},
                {text: '付款金额', value: 'payMoney'},
                {text: '到票日期', value: 'dpDate'},
                {text: '到票金额', value: 'dpMoney'},
                {text: '备注', value: 'remark'},
            ],
            menu: false,
            menu2: false,
            offInsert: false,
            editItem: null
        }),
        props: {
            detailC: null
        },
        watch: {
            detailC: {
                handler() {
                    this.proDetailDpList()
                }
            }
        },
        created() {
            this.proDetailDpList()
        },
        methods: {
            proDetailDpList() {
                if (this.detailC && this.detailC.id) {
                    proDetailDpList(this.detailC.id).then(result => {
                        this.items = result
                    })
                }
            },
            save() {
                insert(this.editItem).then(this.proDetailDpList).finally(()=>{
                    this.offInsert = false
                    this.editItem.edit = false
                    this.$emit("update",this.detailC)
                })
            },
            insertHandler() {
                this.editItem = {
                    proDetailId: this.detailC.id,
                    edit: true,
                    index: (this.items.length + 1),
                    payDate: null,
                    payMoney: null,
                    dpMoney: null,
                    dpDate: null
                }
                this.items.push(this.editItem)
                this.offInsert = true
            },
            dateChange(item, prop) {
                if (prop == "payDate") {
                    this.menu = false
                } else {
                    this.menu2 = false
                }

                if(item.id){
                    this.save()
                }
            },
            editDetailItem(event, param) {
                if (param.edit == null) {
                    this.$set(param, 'edit', false)
                }
                if (this.offInsert) {
                    let isRequest = true
                    if (this.editItem.id === (event.id || param.id)) {
                        isRequest = false
                    }
                    if (this.editItem.id != null && isRequest) {
                        this.editItem.edit = false
                        this.openEdit(event, param)
                    } else if (isRequest) {
                        this.items.splice(this.editItem.index, 1)
                        this.openEdit(event, param)
                    }
                } else {
                    this.openEdit(event, param)
                }
            },
            openEdit(event, param) {
                if (event.id == null) {
                    window.setTimeout(() => {
                        let temp
                        if (this.$refs[param.id + event] instanceof Array) {
                            temp = this.$refs[param.id + event][0]
                        } else {
                            temp = this.$refs[param.id + event]
                        }
                        temp.focus()
                        temp.$refs.input.select()
                    }, 100)
                    this.editItem = param
                } else {
                    this.editItem = param.item
                }
                if (event == "payDate") {
                    this.menu = true
                } else if (event == "dpDate") {
                    this.menu2 = true
                } else {
                    this.menu = false
                    this.menu2 = false
                }
                this.editItem.edit = true
                this.offInsert = true
            },
            cancelInsert() {
                if (this.editItem.id == null) {
                    this.items.splice(this.editItem.index, 1)
                }
                this.editItem.edit = false
                this.offInsert = false
            },
        }
    }
</script>

<style scoped>

</style>