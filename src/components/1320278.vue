<template>
    <div>
        <v-subheader>投标盖章申请表</v-subheader>
        <v-form ref="projectForm" :disabled="offEdit">
            <v-row dense>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field autofocus
                                  v-model="data.projectName"
                                  label="项目名称(必填)"
                                  :rules="rules.projectName"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-autocomplete v-model="data.company"
                                    :items="companyList"
                                    return-object
                                    auto-select-first
                                    item-text="name"
                                    @change="constructionChange"
                                    :search-input.sync="searchCompany"
                                    label="建设单位"></v-autocomplete>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-autocomplete v-model="data.biddingDlCo"
                                    :items="ownerList"
                                    item-value="name"
                                    item-text="name"
                                    auto-select-first
                                    :search-input.sync="searchOwner"
                                    label="招标代理单位"></v-autocomplete>
                </v-col>

                <v-col lg="4" md="4" cols="12">
                    <v-autocomplete v-model="data.projectSource"
                                    :items="projectSources"
                                    label="项目来源"></v-autocomplete>
                </v-col>
                <!--<v-col lg="4" md="4" cols="12">
                    <v-text-field v-model="data.feeNote" label="收费情况"></v-text-field>
                </v-col>-->
                <v-col lg="4" md="4" cols="12">
                    <v-autocomplete v-model="data.busPerson"
                                    :items.sync="staffList"
                                    item-text="name"
                                    return-object
                                    :search-input.sync="searchStaff"
                                    label="负责人"></v-autocomplete>
                </v-col>
                <!--<v-col lg="2" md="2" cols="12" v-if="false">
                    <v-checkbox v-model="data.self"
                                label="是否自营项目"></v-checkbox>
                </v-col>-->
                <v-col md="4" cols="12" >
                    <v-radio-group v-model="data.type" row>
                        <v-radio value="纸质标" label="纸质标"></v-radio>
                        <v-radio value="电子标" label="电子标"></v-radio>
                    </v-radio-group>
                </v-col>
                <!--<v-col lg="4" md="4" cols="12"  v-if="false">
                    <v-text-field v-model="data.coordinateName" label="配合方名称"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12"  v-if="false">
                    <v-text-field v-model="data.cooperate" label="合作方名称"></v-text-field>
                </v-col>-->
                <v-col md="2" cols="12">
                    <v-text-field type="number"
                                  v-model="data.bidMoney"
                                  :rules="rules.bidMoney"
                                  label="投标金额(必填)"></v-text-field>
                </v-col>
                <v-col md="2" cols="12">
                    <v-text-field v-model="data.cost"
                                  :rules="rules.cost"
                                  label="成本(必填)"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field v-model="data.address" :rules="rules.address" label="项目地点(必填)"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-menu v-model="menu"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            ref="menu"
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="data.date"
                                          label="投标时间"
                                          readonly
                                          v-bind="attrs"
                                          v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="data.date" @change="$refs.menu.save()" no-title
                                       scrollable></v-date-picker>
                    </v-menu>
                </v-col>

                <v-col lg="4" md="4" cols="12">
                    <v-text-field v-model="data.remark" label="备注"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <easy-flow ref="flow"
                               defaultFlowName="工程投标盖章申请表"
                               :instance="flowMsg"
                               coding="1320278"></easy-flow>
                </v-col>
            </v-row>
        </v-form>
    </div>
</template>

<script>
    import {getBidById} from '@/api/proBid'
    import {loadRegion} from '@/api/region'
    import {list} from '@/api/company'
    import {getStaff} from '@/api/staff'
    import easyFlow from '@/components/easyflow/easyFlow'

    export default {
        components: {
            easyFlow
        },
        name: "frame-1320278",
        props: {
            // 窗口id
            frameId: String,
            // 绑定项目对象
            project: Object,
            //是否禁止编辑
            offEdit:Boolean,
        },
        model: {
            prop: 'project',
            event: 'change'
        },
        data: () => ({
            menu: false,
            data: null,
            rules: {
                bidMoney: [
                    v => (!!v && v > 0) || '请输入投标价格并且不能小于0'
                ],
                cost: [
                    v => (!!v) || '请输入成本'
                ],
                projectName: [
                    v => (!!v) || '项目名称不能为空'
                ],
                address: [
                    v => (!!v) || '项目地点不能为空'
                ],
            },
            citys: [],
            searchCity: null,

            companyList: [],
            searchCompany: null,

            ownerList: [],
            searchOwner: null,

            projectFolder: [],

            flowMsg: {
                message: {
                    title: null,
                    content: null,
                    frameId: null,
                    frameCoding: 1320278,
                    frameColumn: 'id'
                }
            },

            errorMessages: null,
            projectSources: ['邀标', '公开招标'],
            staffList: [],
            searchStaff: null
        }),
        watch: {
            frameId: {
                handler() {
                    this.reset();
                    this.loadData();
                },
                deep: true,
            },
            project: {
                handler() {
                    this.setData()
                },
                deep: true
            },
            data: {
                handler() {
                    this.$emit("change", this.data)
                },
                deep: true,
            },
            searchCity(value) {
                loadRegion(value).then(result => this.citys = result).finally(() => {
                    if (this.citys.length <= 0) {
                        this.citys.push({name: value, id: -1});
                    }
                })
            },
            searchCompany(value) {
                list(value).then(result => this.companyList = result).finally(() => {
                    if (this.companyList.length <= 0) {
                        this.companyList.push({name: value, id: -1});
                    }
                })
            },
            searchOwner(value) {
                if (value != null) {
                    list(value).then(result => this.ownerList = result).finally(() => {
                        if (this.ownerList.length <= 0) {
                            this.ownerList.push({name: value, id: -1});
                        }
                        console.log(this.ownerList)
                    })
                }

            },
            searchStaff(value) {
                getStaff(value).then(result => {
                    this.staffList = result
                })
            }
        },
        created() {
            this.reset()
            if (this.frameId != null) {
                this.loadData();
            } else {
                this.setData()
            }
        },
        mounted() {
            loadRegion().then(result => this.citys = result)
        },
        methods: {
            setData(){
                if(this.project != null){
                    this.data = this.project
                    this.companyList.push(this.data.company)
                    if(this.data.biddingDlCo != null){
                        this.ownerList.push({name: this.data.biddingDlCo,id:-1})
                    }
                    this.staffList.push(this.project.busPerson)
                }else{
                    this.reset()
                }
            },
            errorIsNull() {
                return this.errorMessages == null
            },
            startFlow(project) {
                this.flowMsg.message.title = project.projectName + "投标盖章申请"
                if (project.remark != null) {
                    this.flowMsg.message.content = project.remark
                }
                this.flowMsg.message.frameId = project.id
                return this.$refs['flow'].startFlow(this.flowMsg.message).then(() => {
                    this.reset()
                })
            },
            constructionChange() {

            },
            validate() {
                return this.$refs['projectForm'].validate()
            },
            blurCitys() {

            },
            loadData() {
                getBidById(this.frameId).then(data => {
                    if (data.folder == null) {
                        data.folder = {name: '', id: ''}
                    }
                    if(data.company == null){
                        data.company = {name:null,id:null}
                    }
                    if(data.biddingDlCo == null){
                        data.biddingDlCo = {name:null,id:null}
                    }
                    if(data.busPerson == null){
                        data.busPerson = {name:null,id:null}
                    }
                    this.staffList.push(data.busPerson)
                    this.companyList.push(data.company)
                    this.ownerList.push(data.company)
                    this.data = data;
                });
            },
            reset() {
                this.data = {
                    projectName: null,
                    company: {name: null, id: null},
                    projectId: null,
                    biddingDlCo: null,
                    projectSource: "邀标",
                    feeNote: '',
                    busPerson: {
                        name: this.$store.state.user.name,
                        id: this.$store.state.user.id,
                    },
                    self: true,
                    cooperate: "",
                    coordinateName: "",
                    bidMoney: null,
                    address: null,
                    date: this.dateFormat(new Date(), 'YYYY-mm-dd'),
                    type: "电子标",
                    remark: null,
                    staff: {
                        name: this.$store.state.user.name,
                        id: this.$store.state.user.id,
                    },
                    cost:null,
                }
            }
        }
    }
</script>

<style scoped>

</style>