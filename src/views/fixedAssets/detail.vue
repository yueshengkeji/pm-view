<template>
    <div class="pa-3">
        <v-row justify="center" v-if="data != null">
            <v-col md="6" cols="12">
                <v-row>
                    <v-col cols="12">
                        <v-text-field label="资产类别" v-model="data.folderObj.name"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field label="资产名称" v-model="data.name"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field label="资产编号" v-model="data.series"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field label="型号" v-model="data.model"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field label="采购日期" v-model="data.proDate"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field label="存放部门" v-model="data.section"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field label="使用人" v-model="data.person"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field label="数量" v-model="data.haveSum"></v-text-field>
                    </v-col>
                </v-row>
            </v-col>

        </v-row>
        <h3 v-else>{{msg}}</h3>
    </div>
</template>

<script>
    import {detailById} from '@/api/fixedAssets'

    export default {
        name: "detail",
        data: () => ({
            data: null,
            msg: '正在查询',
            id: String
        }),
        props: {
            frameId: null,
        },
        watch: {
            frameId() {
                if (this.frameId) {
                    this.id = this.frameId
                }
            },
            id() {
                this.loadData()
            },
            "$route.params": {
                handler() {
                    this.id = this.$route.params.id
                }
            }
        },
        created() {
            this.id = this.$route.params.id
            if (this.frameId) {
                this.id = this.frameId
            }
            this.loadData()
        },
        methods: {
            loadData() {
                if (this.id) {
                    detailById(this.id).then(result => this.data = result).finally(() => {
                        if (this.data == null) {
                            this.msg = "固定资产不存在"
                        }
                    })
                }
            },
            reset() {
                this.data = {
                    folderObj: {name: null},
                    name: null,
                    series: null,
                    model: null,
                    section: null,
                    proDate: null,
                    person: null,
                    haveSum: null,
                }
            }
        }
    }
</script>

<style scoped>

</style>