<template>
    <div>
        <v-row dense>
            <v-col lg="2">
                <v-btn color="primary" @click="insertHandler">新增</v-btn>
            </v-col>
        </v-row>
        <v-data-table :items.sync="data.rows"
                      :headers="headers"
                      :options.sync="options"
                      :loading="loading"
                      :server-items-length="data.total">

            <template v-slot:item.action="{item}">
                <v-btn x-small color="primary" @click="updateHandler(item)">修改</v-btn>
            </template>

        </v-data-table>


        <v-dialog width="50%" v-model="insertDialog">
            <v-card class="pa-3">
                <v-form ref="form">
                    <v-autocomplete :items="projectItems"
                                    :search-input.sync="searchProject"
                                    :rules="[v=> (!!v && !!v) || '请选择项目']"
                                    label="项目名称"
                                    return-object
                                    item-text="name"
                                    item-value="id"
                                    v-model="item.project"></v-autocomplete>
                    <v-autocomplete :items="staffItems"
                                    :rules="[v=>(!!v && !!v.length > 0) || '请选择售后负责人']"
                                    :search-input.sync="searchStaff"
                                    @change="staffChangeHandler"
                                    label="售后负责人"
                                    return-object
                                    item-text="name"
                                    item-value="id"
                                    multiple
                                    v-model="item.staff"></v-autocomplete>
                    <v-chip v-for="s in item.staff" :key="s.id">{{s.name}}</v-chip>
                    <v-menu ref="menu" v-model="menu" :close-on-content-click="false">
                        <template v-slot:activator="{on,attrs}">
                            <v-text-field :rules="[v=>!!v || '请选择移交日期']"
                                          readonly
                                          label="移交日期"
                                          v-model="item.yjDate"
                                          v-on="on" v-bind="attrs"></v-text-field>
                        </template>
                        <v-date-picker v-model="item.yjDate"
                                       @change="$refs.menu.save()"
                                       show-current></v-date-picker>
                    </v-menu>


                    <v-menu ref="menu2" v-model="menu2">
                        <template v-slot:activator="{on,attr}">
                            <v-text-field readonly label="维保结束日期（可选）" v-model="item.expireDate"
                                          v-on="on" v-bind="attr"></v-text-field>
                        </template>
                        <v-date-picker v-model="item.expireDate" show-current
                                       @change="$refs.menu2.save()"></v-date-picker>
                    </v-menu>

                    <v-btn block color="primary" class="mb-1" @click="submitHandler" :loading="loading">提交</v-btn>
                    <v-btn block @click="insertDialog = false" :loading="loading">关闭</v-btn>
                </v-form>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import {insertPerson, personList, updatePerson} from '@/api/weixiu'
    import {search} from '@/api/project'
    import {getStaff} from '@/api/staff'

    export default {
        name: "wxPersonList",
        data: () => ({
            options: {},
            data: {
                rows: [],
                total: 0,
            },
            headers: [
                {text: '项目名称', value: 'projectName'},
                {text: '售后负责人', value: 'staffName'},
                {text: '移交日期', value: 'yjDate'},
                {text: '维保结束日期', value: 'expireDate'},
                {text: '操作', value: 'action'},
            ],
            loading: false,

            insertDialog: false,
            projectItems: [],
            searchProject: null,
            searchStaff: null,
            staffItems: [],
            item: {
                project: null,
                staff: null,
                yjDate: null,
                staffName: null,
                staffId: null,
                expireDate: null
            },
            menu: false,
            menu2: false,
        }),
        watch: {
            options: {
                handler() {
                    this.list()
                },
                deep: true
            },
            searchProject(val) {
                if ((val && this.projectItems.length != 1) || (this.projectItems.length == 1 && this.projectItems[0].name != val)) {
                    search(val).then(result => this.projectItems = result).finally(() => {
                        if (this.projectItems.length == 0) {
                            this.projectItems.push({id: '-1', name: val})
                        }
                    })
                }
            },
            searchStaff(val) {
                if (val) {
                    getStaff(val).then(result => this.staffItems = result)
                }
            }
        },
        methods: {
            staffChangeHandler() {
                this.item.staffId = ''
                this.item.staffName = ''
                this.item.staff.forEach(item => {
                    this.item.staffId += item.id + ";"
                    this.item.staffName += item.name + ";"
                })
            },
            submitHandler() {
                if (this.$refs.form.validate()) {
                    let q = Object.assign({}, this.item)
                    q.projectId = q.project.id
                    q.projectName = q.project.name
                    this.loading = true
                    let http;
                    if(q.id){
                        http = updatePerson(q)
                    }else{
                        http = insertPerson(q)
                    }
                    http.then(() => {
                        this.loading = false
                        this.list()
                        this.insertDialog = false
                    })
                }
            },
            updateHandler(item) {
                let sa = item.staffId.split(";")
                let sn = item.staffName.split(";")
                item.staff = []
                for (let i = 0; i < sa.length; i++) {
                    if(sa[i] != null && sa[i] != ""){
                        let t = {id: sa[i], name: sn[i]}
                        this.staffItems.push(t)
                        item.staff.push(t)
                    }
                }
                item.project = {id: item.projectId, name: item.projectName}
                this.projectItems.push(item.project)
                this.item = item
                this.insertDialog = true
            },
            insertHandler() {
                if(this.$refs.form){
                    this.$refs.form.reset()
                }
                this.insertDialog = true
            },
            list() {
                this.loading = true
                let q = Object.assign({}, this.options)
                personList(q).then(result => {
                    this.data = result
                }).finally(() => this.loading = false)
            }
        }
    }
</script>

<style scoped>

</style>