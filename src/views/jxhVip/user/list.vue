<template>
    <v-card>
        <v-row>
            <v-col md="2">
                <v-text-field v-model="queryParams.name" label="用户名"></v-text-field>
            </v-col>
            <v-col md="2">
                <v-text-field v-model="queryParams.mobilePhone" label="手机号"></v-text-field>
            </v-col>
            <v-col md="1">
                <v-select v-model="queryParams.type" :items="typeItems" label="类型"></v-select>
            </v-col>
            <v-spacer></v-spacer>
            <v-col md="2">
                <div style="margin-top: 20px">
                    <v-btn small @click="loadList">搜索</v-btn>
                    <v-icon @click="resetQueryParams" style="margin-left: 5px">mdi-refresh</v-icon>
                </div>
            </v-col>
        </v-row>
        <v-data-table
                :headers="headers"
                :items="desserts"
                :options.sync="options"
                :server-items-length="totalDesserts"
                class="elevation-1"
        >
            <template v-slot:item.gender="{item}">
                <span>{{item.gender == 0 ? '男' : '女'}}</span>
            </template>
            <template v-slot:item.type="{item}">
                <span>{{item.type == 0 ? '普通会员' : '高级会员'}}</span>
            </template>
        </v-data-table>
    </v-card>
</template>
<script>
import {list} from "@/api/jxhVipUser";

export default {
    name: 'jxhVipUser',
    data: () => ({
        headers: [
            {text: '用户名', value: 'name', sortable: false},
            {text: '手机号', value: 'mobilePhone', sortable: false},
            {text: '性别', value: 'gender', sortable: false},
            {text: '用户类型', value: 'type', sortable: false},
            {text: '会员到期时间', value: 'vipEndTime', sortable: false},
            {text: '注册时间', value: 'createTime', sortable: false},
            // {text: '操作', value: 'actions', sortable: false},
        ],
        desserts: [],
        options: {},
        totalDesserts: null,
        queryParams: {
            page: 1,
            itemsPerPage: 10,
            name: null,
            mobilePhone: null,
            type: null
        },
        typeItems: [
            {text: '普通会员', value: 0},
            {text: '高级会员', value: 1}
        ],
    }),

    created() {
        this.loadList()
    },

    methods: {
        loadList() {
            this.queryParams.itemsPerPage = this.options.itemsPerPage
            this.queryParams.page = this.options.page
            list(this.queryParams).then(res => {
                console.log(res)
                this.desserts = res.rows
                this.totalDesserts = res.total

            })
        },
        resetQueryParams() {
            this.queryParams = {
                page: 1,
                itemsPerPage: 10,
                name: null,
                mobilePhone: null,
                type: null
            }
        }
    }
}
</script>