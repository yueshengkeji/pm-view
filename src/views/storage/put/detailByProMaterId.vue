<template>
    <div>

        <v-data-table :items="items" hide-default-footer :headers="headers">
            <template v-slot:item.putStorage.approveType="{item}">
                {{formatApproveType(item.putStorage.approveType)}}
            </template>
            <template v-slot:item.action="{item}">
                <v-btn x-small @click="detailHandler(item)">明细</v-btn>
            </template>
        </v-data-table>

        <v-row justify="center"  v-if="rebackBtn">
            <v-col cols="12">
                <h3 class="text-center">{{msg}}</h3>
            </v-col>
            <v-col sm="1" cols="12">
                <v-btn :disabled="disabled" :loading="loading" color="primary" @click="rebackPutStateHandler">回退采购订单入库状态
                </v-btn>
            </v-col>
        </v-row>

        <v-dialog width="90%" v-model="dialog">
            <v-card class="pa-3">
                <put-detail v-model="putItem"></put-detail>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="dialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import {getMaterByProMaterId, getMaterial, loadById} from '@/api/put'
    import {updateProState} from '@/api/procurement'

    export default {
        name: "detailByProMaterId",
        components: {
            putDetail: () => import('@/components/15327')
        },
        data: () => ({
            putItem: null,
            headers: [
                {text: "入库单号", value: 'putStorage.putSerial'},
                {text: "入库日期", value: 'putStorage.putDate'},
                {text: "材料名称", value: 'material.name'},
                {text: "型号", value: 'material.model'},
                {text: "品牌", value: 'material.brand'},
                {text: "数量", value: 'putSum'},
                {text: "单位", value: 'material.unit.name'},
                {text: "单价", value: 'taxPrice'},
                {text: "金额", value: 'moneyTax'},
                {text: "审核状态", value: 'putStorage.approveType'},
                {text: "操作", value: 'action'},
            ],
            items: [],
            dialog: false,
            rebackBtn: false,
            proId: null,
            msg: '未查询到采购单入库信息，可以点击下方按钮修复',
            loading: false,
            disabled:false,
        }),
        created() {
            let id = this.$route.params.proMaterId
            this.proId = this.$route.params.proId
            this.list(id)
        },
        methods: {
            rebackPutStateHandler() {
                this.loading = true
                updateProState(this.proId).then((result) => {
                    if (result && result.putState < 4) {
                        this.msg = "操作成功，请返回到采购订单列表页，刷新数据，重新入库"
                        this.loading = false
                        this.disabled = true
                    } else {
                        this.msg = "操作失败，请确定采购订单存在，并且有未入库的材料"
                        this.loading = false
                    }
                })
            },
            detailHandler(item) {
                loadById(item.putStorage.id).then(put => {
                    getMaterial(item.putStorage.id).then(result => {
                        this.$set(put, "materialList", result)
                        this.$set(put, "project", item.project)
                        this.putItem = put
                        this.dialog = true
                    })
                })
            },
            list(id) {
                getMaterByProMaterId(id).then(result => {
                    this.items = result
                }).finally(() => {
                    this.rebackBtn = this.items.length === 0
                })
            }
        }
    }
</script>

<style scoped>

</style>