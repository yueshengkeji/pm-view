<template>
    <div>
        <v-container>
            <div style="display: flex">
                <span>合同类型</span>
                <v-spacer></v-spacer>
                <v-btn small color="primary" @click="addContractType">新增</v-btn>
            </div>
            <v-treeview
                    :items="treeData"
                    :load-children="loadChildren"
                    :open.sync="open"
                    activatable
                    open-on-click
                    item-key="name"
            >
                <template v-slot:append="{item}">
                    <v-btn x-small color="primary" @click="addContractType(item)">新增</v-btn>
                </template>
            </v-treeview>

        </v-container>
        <v-dialog v-model="addDialog" width="500px">
            <v-card>
                <v-container>
                    <v-form ref="contractTypeForm">
                        <v-row>
                            <v-col>
                                <v-text-field
                                        v-model="contractType.name"
                                        label="合同类型名"
                                        :rules="rules.nameRule"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col>
                                <v-text-field
                                        v-model="contractType.orderNumber"
                                        label="序号"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-container>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn small color="primary" @click="submitAdd">提交</v-btn>
                    <v-btn small @click="cancelAdd">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
    import {insertContractType,getByFatherId} from "../api/contractType";

    export default {
        name: "contractType",
        data: () => ({
            active: [],
            open: [],
            addDialog: false,

            contractType: null,

            items: [],
            fatherItem:null,

            rules: {
                nameRule: [
                    v => (!!v && v.length < 100) || "必填字段且不超过100字符"
                ],
            }
        }),
        computed:{
            treeData(){
                return this.items;
            }
        },

        watch: {
            addDialog(val) {
                val || this.cancelAdd()
            }
        },
        created() {
            this.reset()
            this.loadContractType()
        },
        methods: {
            addContractType(item) {
                this.addDialog = true
                if (item != null){
                    this.fatherItem = item
                }
            },

            loadContractType(parent) {
                getByFatherId({parentId:(parent == null ? '' : parent.id)}).then(res => {
                    if (parent == null){
                        res.forEach((r) => {
                            if (r.ifHaveChildren){
                                r.children = []
                            }
                        })
                        this.items = res
                    }else if (parent != null){
                        res.forEach((r) => {
                            if (r.ifHaveChildren){
                                r.children = []
                            }
                        })
                        parent.children = res
                        this.open.push(parent.name)
                    }

                })
            },

            async loadChildren(parent){
                const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
                await pause(1500)
                return this.loadContractType(parent)
            },

            submitAdd() {
                if (this.$refs['contractTypeForm'].validate()) {
                    this.contractType.parentId = this.fatherItem.id == null ? '' : this.fatherItem.id
                    this.contractType.tempRoot = this.fatherItem.rootId == null ? '' : this.fatherItem.rootId.substring(0,8)
                    insertContractType(this.contractType).then(res => {
                        if (res == 1) {
                            this.loadContractType()
                            this.reset()
                            this.addDialog = false
                        }
                    })
                }
            },

            cancelAdd() {
                this.addDialog = false
                this.$nextTick(() => {
                    this.contractType = {
                        name: null,
                        orderNumber: '',
                    }
                })
            },

            reset() {
                this.contractType = {
                    name: null,
                    orderNumber: '',
                }
                this.items = []
            }
        }
    }
</script>