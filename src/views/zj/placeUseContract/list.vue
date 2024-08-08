<template>
    <div>
        <v-row>
            <v-col sm="5" cols="12">
                <v-btn small color="primary" @click="addContract()">新增场地合同</v-btn>
                <v-btn @click="modelPrintDialog = true" small class="ml-1">合同模板</v-btn>
            </v-col>
            <v-spacer></v-spacer>
            <v-col lg="1" sm="1">
                <v-text-field dense label="搜索" v-model="queryParams.searchStr"
                              @change="loadContractList"></v-text-field>
            </v-col>
        </v-row>
        <v-data-table
                :headers="contractHeader"
                :items="contractList"
                :options.sync="options"
                :server-items-length="total"
                :loading="loading"
                @dblclick:row="detail"
                class="elevation-1"
        >
            <template v-slot:item.action="item">
                <v-btn x-small @click="detail($event, item)">明细</v-btn>
                <v-btn :disabled="item.item.type == 9" x-small @click="cancelPlaceUseContract(item)">合同作废</v-btn>
                <v-btn :disabled="item.item.type == 9" class="ml-1" color="error" x-small @click="deleteItem(item)">
                    删除
                </v-btn>
            </template>
        </v-data-table>
        <!--新增-->
        <v-dialog v-model="addDialog" width="60%">
            <v-toolbar flat>
                <v-toolbar-title>场地使用合同</v-toolbar-title>
            </v-toolbar>
            <v-card>
                <add-place-contract ref="addPlaceContract"></add-place-contract>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="submitAdd">确定</v-btn>
                    <v-btn @click="addDialog=false">取消</v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>
        <!--详情更新-->
        <v-dialog v-model="updateDialog" :fullscreen="true">
            <v-card>
                <v-toolbar flat>
                    <v-toolbar-title>场地使用合同</v-toolbar-title>
                </v-toolbar>
                <update-place-contract ref="updatePlaceContract" :item="item"></update-place-contract>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="printContractWord">打印</v-btn>
                    <v-btn :disabled="item.type == 9" @click="saveData">仅保存数据</v-btn>
                    <v-btn :disabled="item.type == 9" @click="filesHandler">查看附件</v-btn>
                    <v-btn :disabled="item.type == 9" color="primary" @click="submitUpdate">确定</v-btn>
                    <v-btn @click="updateDialog=false">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!--删除-->
        <v-dialog v-model="deleteDialog" @close="deleteDialog = false" width="30%">
            <v-card>
                <v-card-actions>
                    <v-card-title>确定删除该场地合同？</v-card-title>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="deletePlaceContract" autofocus>确定</v-btn>
                    <v-btn @click="deleteDialog = false">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!--打印-->
        <component v-bind:is="printComponent"
                   v-bind:contractId="contractId"
                   v-on:success="printComponent = null"
        ></component>
        <!--合同模板-->
        <v-dialog v-model="modelPrintDialog">
            <v-card>
                <contract-word-model ref="contractWordModel"></contract-word-model>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="submitContractWordModel" color="primary">提交</v-btn>
                    <v-btn class="ml-1" @click="modelPrintDialog = false">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!--查看附件详情-->
        <instance-detail :frame="frameId"
                         @close="closeFrameHandler"></instance-detail>
    </div>
</template>
<script>
    import {list,deleteById,update} from "../../../api/placeUseContract";
    import addPlaceContract from "./components/addPlaceContract";
    import updatePlaceContract from "./components/updatePlaceContract";
    import contractWordModel from "../components/contractWordModel";

    export default {
        name: 'placeUseContract',
        components: {addPlaceContract,updatePlaceContract,contractWordModel,
            instanceDetail:() => import('@/components/easyflow/instance-detail.vue')},
        data: () => ({
            contractList: [],
            contractHeader: [
                {text: '合同名称', value: 'contractName'},
                {text: '乙方', value: 'partB.name'},
                {text: '场地编号', value: 'placeNum'},
                {text: '场地面积', value: 'placeArea'},
                {text: '场地用途', value: 'placeUseFor'},
                {text: '场地总费用', value: 'money'},
                {text: '保证金', value: 'bond'},
                {text: '登记人', value: 'recordStaff.name'},
                {text: '操作', value: 'action'},
            ],

            total: 0,
            loading: true,
            options: {},
            queryParams: {
                searchStr: null,
                page: 1,
                pageSize: 10
            },

            //新增
            addDialog: false,
            //详情更新
            updateDialog:false,
            item:{
                type:9
            },
            //删除
            deleteDialog:false,
            //打印
            contractId: null,
            printComponent: null,
            //合同模板
            btnLoading:false,
            modelPrintDialog:false,
            //查看附件详情
            frameId:null
        }),
        created() {
            this.loadContractList()
        },
        watch: {
            options: {
                handler() {
                    this.loadContractList()
                },
                deep: true,
            }
        },
        methods: {
            loadContractList() {
                this.queryParams.page = this.options.page
                this.queryParams.pageSize = this.options.itemsPerPage
                this.loading = true
                list(this.queryParams).then(res => {
                    this.contractList = res.list
                    this.total = res.total
                    this.loading = false
                })
            },

            addContract() {
                this.addDialog = true
            },
            submitAdd() {
                if (this.$refs.addPlaceContract.validateForm()) {
                    this.$refs.addPlaceContract.submitAdd().then(() => {
                        this.loadContractList()
                        this.$refs.addPlaceContract.reset()
                    })
                    this.addDialog = false
                }
            },

            detail(event, row) {
                this.updateDialog = true
                this.$nextTick(() => {
                    this.item = row.item
                    console.log(this.item)
                })
            },
            cancelPlaceUseContract(item){
                console.log('item1',item)
                let updateItem = item.item
                this.confirm("确定作废该合同?").then(() => {
                    console.log('updateItem',updateItem)
                    updateItem.type = 9
                    update(updateItem).then(res => {
                        if (res > 0){
                            this.loadContractList()
                        }
                    })
                })
            },
            submitUpdate(){
                if (this.$refs.updatePlaceContract.validateForm()){
                    this.$refs.updatePlaceContract.submitUpdate().then(() => {
                        this.loadContractList()
                        this.$refs.updatePlaceContract.reset()
                    })
                    this.updateDialog = false
                }
            },
            saveData(){
                if (this.$refs.updatePlaceContract.validateForm()){
                    this.$refs.updatePlaceContract.savePlaceContract().then(() => {
                        this.loadContractList()
                        this.$refs.updatePlaceContract.reset()
                    })
                    this.updateDialog = false
                }
            },
            filesHandler() {
                this.frameId = this.item.id
            },
            closeFrameHandler(isClose) {
                if (!isClose) {
                    this.frameId = null
                }
            },

            deleteItem(item){
                this.item = item.item
                this.deleteDialog = true
            },
            deletePlaceContract(){
                deleteById({id:this.item.id}).then(res => {
                    if (res > 0){
                        this.deleteDialog = false
                        this.item = null
                    }
                    this.loadContractList()
                })
            },
            //打印
            printContractWord() {
                this.contractId = this.item.id
                this.printComponent = () => import('@/components/print/contractWordModelRecord.vue')
            },
            //模板
            submitContractWordModel() {
                this.btnLoading = true
                this.$refs.contractWordModel.submit().then(res => {
                    if (res == 1) {
                        console.log('success')
                    }
                }).catch(error => {
                    console.log(error)
                }).finally(() => {
                    this.btnLoading = false
                    this.modelPrintDialog = false
                })
            },
        }
    }
</script>
