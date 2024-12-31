<template>
    <v-container>
        <v-form ref="shopUserForm">
            <v-row>
                <v-col>
                    <v-btn @click="showShops">选择商户</v-btn>
                </v-col>
                <v-col md="12">
                    <v-text-field v-model="shopUserItem.shopName" label="商铺" readonly></v-text-field>
                </v-col>

            </v-row>
            <v-row>
                <v-col md="3">
                    <v-text-field v-model="shopUserItem.name" label="昵称" :rules="rules.name"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field v-model="shopUserItem.loginName" label="账号" :rules="rules.loginName" readonly></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field v-model="shopUserItem.loginPassword" label="密码" :rules="rules.loginPassword"></v-text-field>
                </v-col>
            </v-row>
        </v-form>
        <v-dialog v-model="showShopsDialog" width="60%">
            <v-card>
                <v-card-title>
                    <v-text-field
                            v-model="shopSearch"
                            append-icon="mdi-magnify"
                            label="Search"
                            single-line
                            hide-details
                    ></v-text-field>
                </v-card-title>
                <v-data-table
                        :headers="shopHeaders"
                        :loading="shopsLoading"
                        :items="shopDesserts"
                        :search="shopSearch"
                        v-model="shopsSelected"
                        :options.sync="shopOptions"
                        @click:row="handleRowClick"
                        item-key="id"
                        show-select
                        class="elevation-1"
                ></v-data-table>
            </v-card>
        </v-dialog>
        <v-snackbar v-model="showSnackbarDialog"
                    :timeout="timeout"
                    :centered="true"
        >
            {{ msgStr }}
        </v-snackbar>
    </v-container>
</template>
<script>
import {zujinList} from "@/api/zujin";
import {updateShopUser,selectShopUserById} from "@/api/jxhShopUser";
export default {
    data:() => ({
        shopUserItem:{
            name:null,
            loginName:null,
            loginPassword:null,
            shopName:null,
            proZujin:null
        },

        //zujinList
        shopsQueryParams: {
            page: 1,
            itemsPerPage:500,
            endFlag2: 9
        },
        showShopsDialog: false,
        shopSearch: null,
        shopsLoading:false,
        shopHeaders: [
            {text: '商铺名', value: 'brand'},
        ],
        shopDesserts: [],
        shopsSelected: [],
        shopOptions: {},
        shopTotal: 0,

        //消息框
        showSnackbarDialog: false,
        msgStr: null,
        timeout: 2000,

        sameFlag:false,

        rules: {
            name: [v => !!v || '必填字段', v => (!!v && v.length < 50) || '不超过50个字符'],
            loginName: [v => !!v || '必填字段', v => (!!v && v.length < 20) || '不超过20个字符',
                v => {
                    const pattern = /^[^\u4e00-\u9fa5 ]{1,16}$/
                    return (pattern.test(v)) || "非中文1-16位"
                }
            ],
            loginPassword: [v => !!v || '必填字段', v => (!!v && v.length < 20) || '不超过20个字符',
                v => {
                    const pattern = /^[^\u4e00-\u9fa5 ]{6,16}$/
                    return (pattern.test(v)) || "密码非中文6-16位"
                }]
        },
    }),
    props:{
        item: {
            type: Object
        }
    },
    watch:{
        shopsSelected:{
            handler(){
                this.dealShopsSelected()
            },
            deep:true
        },
        item:{
            handler(){
                if (this.item != null){
                    this.getShopUser()
                }
            },
            deep:true
        }
    },
    created() {
        this.getShopUser()
    },
    methods:{
        listShops() {
            this.shopsLoading = true
            zujinList(this.shopsQueryParams).then(res => {
                this.shopDesserts = res.rows
                this.shopTotal = res.total
                this.shopsLoading = false
            })
        },
        showShops() {
            this.shopsSelected = []
            this.showShopsDialog = true
            this.listShops()
        },
        handleRowClick(rowData, item) {
            item.select(!item.isSelected);
        },
        dealShopsSelected(){
            if (this.shopsSelected.length == 1){
                this.shopUserItem.proZujin = this.shopsSelected[0]
                this.shopUserItem.shopName = this.shopsSelected[0].brand
                this.showShopsDialog = false
            }
        },
        validateForm() {
            let flag = null
            if (this.$refs['shopUserForm'].validate() && this.sameFlag) {
                flag = true
            } else {
                if (this.sameFlag == false){
                    this.msgStr = "该账号名已存在！"
                    this.showSnackbarDialog = true
                }
                flag = false
            }
            return flag
        },
        submitUpdate(){
            return updateShopUser(this.shopUserItem).then(res => {
                return res
            })
        },
        getShopUser(){
            selectShopUserById({id:this.item.id}).then(res => {
                this.shopUserItem = res
            })
        },
        reset(){
            this.shopUserItem = {
                name:null,
                loginName:null,
                loginPassword:null,
                shopName:null,
                proZujin:null
            }
            this.shopsSelected = []
        },
    }
}

</script>