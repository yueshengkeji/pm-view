<template>
    <div>
        <v-row dense justify="center">
            <v-col v-if="!showMsg" :cols="cols">
                <p v-if="!$vuetify.breakpoint.xs && frameId == null" style="position:absolute;top:80px;left: 80px;">
                    申请流程：<br/>
                    1.填写申请理由<br/>
                    2.填写采购资产名称<br/>
                    3.提交<br/>
                    4.等待审批完成<br/>
                    5.自动下发到采购部
                </p>
                <v-form ref="fixedForm">
                    <v-row dense>
                        <v-col cols="12" class="text-center">
                            <h3>固定资产采购申请表</h3>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field dense label="申请人" v-model="data.staff.name"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field dense label="申请部门" v-model="data.section.name"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field dense label="申请日期" v-model="data.datetime"></v-text-field>
                        </v-col>
                        <v-col cols="6" v-if="frameId == null">
                            <easy-flow coding="1320283" dense ref="flow"></easy-flow>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field :readonly="frameId != null"
                                          :rules="[v => !!v || '请输入申请理由',v => (!!v && v.length < 50) || '输入的信息过长']"
                                          autofocus
                                          label="申请理由" v-model="data.reason"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <p v-if="frameId != null">申请采购清单</p>
                            <v-data-table dense
                                          :headers="headers"
                                          hide-default-footer :items="data.assetsList">
                                <template v-slot:item.name="{item}">
                                    <v-text-field
                                            v-if="frameId == null"
                                            :rules="[v => !!v || '资产名称不能为空' , v => (!!v && v.length < 50) || '信息过长']"
                                            dense placeholder="请输入资产名称"
                                            v-model="item.name"
                                            append-outer-icon="mdi-plus"
                                            @click:append-outer="insertRowHandler"></v-text-field>
                                    <p v-else>{{item.name}}</p>
                                </template>
                                <template v-slot:item.model="{item}">
                                    <v-text-field v-if="frameId == null"
                                                  dense placeholder="型号(可选)"
                                                  v-model="item.model"></v-text-field>
                                    <p v-else>{{item.model}}</p>
                                </template>
                                <template v-slot:item.haveSum="{item}">
                                    <v-text-field :readonly="frameId != null"
                                                  v-if="frameId == null"
                                                  dense placeholder="申请数量"
                                                  v-model="item.haveSum"></v-text-field>
                                    <p v-else>{{item.haveSum}}</p>
                                </template>
                            </v-data-table>
                        </v-col>
                        <v-col cols="12" v-if="frameId == null">
                            <v-btn color="primary" block @click="saveHandler">提交</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-col>
            <v-col cols="12" v-if="showMsg">
                <h3 class="text-center">提交成功</h3>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    import {getById, insert} from '@/api/fixedAssets'

    export default {
        name: "index",
        components: {
            easyFlow: () => import('@/components/easyflow/easyFlow')
        },
        data: () => ({
            data: null,
            headers: [
                {text: '资产名称', value: 'name'},
                {text: '型号', value: 'model'},
                {text: '申请数量', value: 'haveSum'},
            ],
            showMsg: false
        }),
        created() {
            this.reset()
            if (this.frameId) {
                this.loadById()
            }
        },
        props: {
            frameId: String,
            cols: {
                type: Number,
                default: 12
            }
        },
        watch: {
            frameId() {
                if (this.frameId) {
                    this.loadById()
                }
            }
        },
        methods: {
            loadById() {
                getById(this.frameId).then(result => {
                    result.section = result.staff.section
                    this.data = result
                })
            },
            saveHandler() {
                if (this.$refs.fixedForm.validate()) {
                    insert(this.data).then(result => {
                        if (result) {
                            this.$refs.flow.startFlow({
                                title: result.staff.name + '-固定资产采购申请',
                                content: result.staff.name + '-固定资产采购申请',
                                frameId: result.id,
                                frameCoding: 1320283,
                                frameColumn: 'id'
                            }).then(() => {
                                this.showMsg = true
                            })
                        }
                    })
                }
            },
            insertRowHandler() {
                if (!this.frameId) {
                    this.data.assetsList.push({name: null, model: '', haveSum: '1'})
                }
            },
            reset() {
                this.data = {
                    staff: this.$store.state.user,
                    section: {name: this.$store.state.user.sectionName},
                    datetime: this.dateFormat(new Date(), 'YYYY-mm-dd HH:MM:SS'),
                    reason: null,
                    assetsList: [
                        {name: null, model: '', haveSum: '1'}
                    ],
                }
                this.data.title = this.data.staff.name + "-" + this.dateFormat(new Date(), 'YYYY-mm-dd') + "固定资产采购申请"
            }
        }
    }
</script>

<style scoped>

</style>