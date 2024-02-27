<template>
    <div>
        <v-data-table :items="items"
                      :options.sync="options"
                      sort-desc
                      sort-by="putDate"
                      :loading="loading"
                      hide-default-footer
                      :headers="headers">
            <template v-slot:item.type="{item}">
                <div>{{item.type == 0 ? '未签字' : '已签字'}}</div>
            </template>
            <template v-slot:item.signImg="{item}">
                <v-img :src="item.signImg" width="200px" @click="imgPreviewHandler(item)"></v-img>
            </template>
            <template v-slot:item.action="{item}">
                <v-btn x-small v-if="item.type == 0 && !$vuetify.breakpoint.xs" @click="notifyHandler(item.id)">推送到手机</v-btn>
                <a v-if="item.type == 0 && $vuetify.breakpoint.xs"
                   target="_blank"
                   :href="$router.options.base+'procurement/signPut/'+item.id"
                >签字确认</a>
            </template>
        </v-data-table>
        <v-dialog width="70%" v-model="imgDialog">
            <v-card class="pa-3">
                <v-img :src="item.signImg" width="100%"></v-img>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="imgDialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-snackbar centered v-model="msgFlag">{{msg}}</v-snackbar>
    </div>
</template>

<script>
    import {myList, wxNotify} from '@/api/proSign'

    export default {
        name: "signList",
        data: () => ({
            imgDialog:false,
            items: [],
            headers: [
                {text: '采购员', value: 'procurement.staff.name'},
                {text: '发起时间', value: 'putDate'},
                {text: '签字时间', value: 'signDate'},
                {text: '签名', value: 'signImg'},
                {text: '过期时间', value: 'pastDate'},
                {text: '状态', value: 'type'},
                {text: '操作', value: 'action'},
            ],
            loading: false,
            options: {},
            msgFlag:false,
            msg:null,
            item:{
                signImg:null
            }
        }),
        watch: {
            options: {
                handler() {
                    this.list()
                },
                deep: true
            }
        },
        methods: {
            imgPreviewHandler(item){
                this.item = item
                this.imgDialog = true
            },
            notifyHandler(item){
                wxNotify(item).then(()=>{
                    this.msg = '操作成功'
                    this.msgFlag = true
                })
            },
            list() {
                let q = Object.assign({}, this.options)
                q.sortBy = q.sortBy[0]
                q.sortDesc = q.sortDesc[0]
                this.loading = true
                myList(q).then(result => this.items = result).finally(() => this.loading = false)
            }
        }
    }
</script>

<style scoped>

</style>