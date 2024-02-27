<template>
        <v-row>
            <v-col>
                <v-data-table :items="items"
                              :headers="headers"
                              :search="search"
                              sort-desc
                              sort-by="lastDate"
                              :items-per-page="10000">
                    <template v-slot:top>
                        <v-text-field label="搜索" v-model="search"></v-text-field>
                    </template>
                    <template v-slot:item.action="{item}">
                        <v-btn small @click="exit(item)">强退</v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
</template>

<script>
    import {exitUser, getOnlineUser} from '@/api/user'

    export default {
        name: "online-user",
        data: () => ({
            items: [],
            headers: [
                {text: '姓名', value: 'name'},
                {text: '部门', value: 'section.name'},
                {text: '登录时间', value: 'lastDate'},
                {text: 'token', value: 'token'},
                {text: '操作', value: 'action'},
            ],
            search:null,
        }),
        created() {
            this.list();
        },
        methods: {
            list() {
                getOnlineUser().then(users => {
                    users.forEach(item=>{
                        item.id = item.token + item.id + Math.random()
                    })
                    this.items = users;
                });
            },
            exit(staff) {
                exitUser(staff.token).then(() => {
                    this.list();
                });
            }
        }
    }
</script>

<style scoped>

</style>