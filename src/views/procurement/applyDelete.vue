<template>
    <div>
        <v-row class="ml-xs-2 ml-lg-5">
            <v-col>
                <v-list>
                    <v-virtual-scroll
                            :bench="2"
                            :items="applyDeleteList"
                            height="520" item-height="64">
                        <template v-slot:default="{item}">
                            <v-list-item @click="openApplyDelete(item)" link :key="item.id"
                                         v-if="item.procurement != null">
                                <v-list-item-avatar>
                                    <v-img :src="item.icon"></v-img>
                                </v-list-item-avatar>
                                <v-list-item-content>
                                    <v-list-item-title v-text="item.remark"></v-list-item-title>
                                    <v-list-item-subtitle v-text="item.date"></v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </template>
                    </v-virtual-scroll>
                </v-list>
            </v-col>
        </v-row>
        <!--        申请删除订单-->
        <v-dialog v-model="applyDeleteDialog" width="70%">
            <v-card class="pa-5">
                <procurement :frameId="applyDelete.proId"></procurement>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="cancelApplyDelete">取消</v-btn>
                    <v-btn color="primary" @click="deleteProcurement">确定删除</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import procurement from '@/components/15306'
    import {cancelApplyDelete, deleteProcurementByApply, getApplyDelete} from '@/api/procurement'
    import {drawAvatar} from '@/utils/avatarUtil';

    export default {
        name: "applyDelete",
        components: {
            procurement,
        },
        data: () => ({
            applyDeleteList: [],
            applyDelete: {proId: null},
            applyDeleteDialog: false,
        }),
        created() {
            this.applyList()
        },
        methods: {
            openApplyDelete(item) {
                if(item.id == null){
                    return;
                }
                this.applyDelete = item;
                this.applyDeleteDialog = true;
            },
            deleteProcurement() {
                deleteProcurementByApply(this.applyDelete).then(() => {
                    this.applyDeleteDialog = false;
                    this.applyList()
                }).catch(e => {
                    this.msg = "删除失败,订单不存在或已入库，异常信息：" + e;
                    this.showMsg = true;
                })
            },
            cancelApplyDelete() {
                this.applyDelete.state = true;
                cancelApplyDelete(this.applyDelete).then(() => {
                    this.applyDeleteDialog = false;
                    this.applyList()
                }).catch(e => {
                    this.msg = "操作失败" + e;
                    this.showMsg = true;
                })
            },
            applyList() {
                this.applyDeleteList = [];
                getApplyDelete().then(response => {
                    response.forEach((item, i) => {
                        try {
                            item.icon = drawAvatar(item.procurement.staff.name, "#81D4FA");
                            this.applyDeleteList.push(item);
                        } catch (e) {
                            response.slice(i, 1);
                            console.log("drawAvatarError",e);
                        }
                    })
                    if(this.applyDeleteList.length <= 0){
                        this.applyDeleteList.push({procurement:{},remark:"无数据"});
                    }
                })
            },
        }
    }
</script>

<style scoped>

</style>