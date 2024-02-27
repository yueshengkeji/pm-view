<template>
    <div>
        <v-row dense>
            <v-btn color="primary" @click="insertHandler">新增就餐申请</v-btn>
            <v-spacer></v-spacer>
            <v-col lg="2">
                <v-text-field label="搜索" dense v-model="searchText"></v-text-field>
            </v-col>
        </v-row>
        <v-data-table
                :items="items"
                :loading="loading"
                :options.sync="options"
                :server-items-length="total"
                :headers="headers">
            <template v-slot:item.action="{item}">
                <v-btn class="mr-1" x-small @click="showDetail(item)">明细</v-btn>
                <v-btn :disabled="!(item.state == 1)" class="mr-1" x-small @click="printHandler(item)">打印</v-btn>
                <v-btn :disabled="item.state == 1" class="mr-1" x-small @click="updateHandler(item)">修改</v-btn>
                <v-btn :disabled="item.state == 1" x-small color="error" @click="deleteHandler(item)">删除</v-btn>
            </template>

        </v-data-table>
        <!--明细-->
        <instance-detail :frame="item.id" :close="close"></instance-detail>

        <v-dialog v-model="insertDialog" width="50%" :fullscreen="$vuetify.breakpoint.xs">
            <v-card class="pa-3">
                <insert v-model="data" ref="insertRef"></insert>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :block="$vuetify.breakpoint.xs" @click="insertDialog = false">取消</v-btn>
                    <v-btn v-if="!$vuetify.breakpoint.xs" color="primary" @click="saveHandler">提交</v-btn>
                </v-card-actions>
                <div class="pa-4" v-if="$vuetify.breakpoint.xs">
                    <v-btn :block="$vuetify.breakpoint.xs" color="primary" @click="saveHandler">提交</v-btn>
                </div>
            </v-card>
        </v-dialog>

        <component v-bind:is="printComponent"
                   v-bind:approveList="approveList"
                   v-on:success="printComponent = null"
                   v-bind:message="flowMessage"></component>

    </div>
</template>

<script>
    import {deleteDine, list} from '@/api/applyDine'
    import insert from '@/components/1320280'
    import {getMessageByFrameId} from '@/api/usedFlowApi'
    import {getApproveSteps} from '@/api/approve'
    import instanceDetail from "@/components/easyflow/instance-detail";

    export default {
        name: "out-report",
        components: {
            insert,
            instanceDetail
        },
        data: () => ({
            headers: [
                {text: '序号', value: 'index'},
                {text: '项目名称', value: 'project.name'},
                {text: '事由', value: 'note'},
                {text: '申请时间', value: 'date'},
                {text: '就餐人数', value: 'personNum'},
                {text: '就餐标准', value: 'standard'},
                {text: '操作', value: 'action'},
            ],
            items: [],
            options: {},
            total: 0,
            query: {
                page: 1,
                itemsPerPage: 10,
                staffId: null,
            },
            loading: false,
            date: null,
            menu: false,
            searchText: null,
            insertDialog: false,
            data: null,
            flowMessage: null,
            approveList: null,
            printComponent: null,

            item: {id: null},
        }),
        watch: {
            options: {
                handler() {
                    this.list();
                },
                deep: true
            }
        },
        created() {
            this.$nextTick(() => {
                this.insertHandler()
            })
            this.query.staffId = this.$store.state.user.id
        },
        methods: {
            printHandler(item) {
                getMessageByFrameId(item.id).then(result => {
                    if (result) {
                        this.flowMessage = result
                        getApproveSteps(this.flowMessage.id).then(approveList => {
                            this.approveList = approveList
                            this.printComponent = () => import('@/components/print/1320280.vue')
                        })
                    }
                })
            },
            deleteHandler(item) {
                this.confirm("确定删除"+item.note+"吗？").then(() => {
                    this.loading = true
                    deleteDine(item.id).then(this.list).finally(() => this.loading = false)
                })
            },
            saveHandler() {
                this.$refs.insertRef.save().then(() => {
                    this.insertDialog = false
                    this.list()
                }).catch(e => {
                    console.log(e)
                })
            },
            updateHandler(item) {
                this.data = item
                this.insertDialog = true
            },
            insertHandler() {
                this.insertDialog = true
                window.setTimeout(() => {
                    this.$refs.insertRef.reset()
                }, 200)
            },
            list() {
                this.loading = true
                this.query.page = this.options.page
                this.query.itemsPerPage = this.options.itemsPerPage
                this.query.searchText = this.searchText
                list(this.query).then(data => {
                    data.rows.forEach((item, idx) => {
                        item.index = idx + 1
                    })
                    this.total = data.total
                    this.items = data.rows
                }).finally(() => {
                    this.loading = false
                });
            },

            showDetail(item){
                this.item = item
            },

            close() {
                this.item = {id: null}
            },
        }
    }
</script>

<style scoped>

</style>
