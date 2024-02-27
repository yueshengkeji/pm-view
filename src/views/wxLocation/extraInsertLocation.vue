<template>
    <v-container>
        <v-col
                class="d-flex"
                cols="12"
                sm="6"
                md="5"
        >
            <v-combobox
                    v-model="staffSearchItem"
                    :items="staffSearchItems"
                    :search-input.sync="searchName"
                    label="搜索姓名"
                    outlined
                    dense
                    @change="updateManager"
                    item-text="name"
            >
            </v-combobox>
        </v-col>
        <v-form ref="extraInsertForm">
            <v-row align="center">
                <v-col
                        class="d-flex"
                        cols="12"
                        sm="6"
                        md="5"
                >
                    <v-combobox
                            v-model="data.section"
                            :items="sectionItems"
                            label="部门"
                            outlined
                            dense
                            return-object
                            item-text="name"
                    >

                    </v-combobox>
                </v-col>

                <v-col
                        class="d-flex"
                        cols="12"
                        sm="6"
                        md="5"
                >
                    <v-combobox
                            v-model="data.staff"
                            :items="staffItems"
                            label="人员"
                            outlined
                            dense
                            return-object
                            item-text="name"
                    ></v-combobox>
                </v-col>
                <v-col cols="6">
                    <v-autocomplete label="项目名称"
                                    auto-select-first
                                    @change="projectChangeHandler"
                                    v-model="data.project"
                                    return-object
                                    :search-input.sync="searchProject"
                                    item-text="name"
                                    item-value="id"
                                    :rules="[v => !!v || '请填写项目名称！']"
                                    :items="projectItems"></v-autocomplete>
                </v-col>
                <v-col cols="3">
                    <v-text-field
                            v-model="data.inputKm" placeholder="实际里程"
                            :rules="[v => !!v || '请填写实际里程！']"
                            required
                    >
                    </v-text-field>
                </v-col>
<!--                <v-col cols="3">-->
<!--                    <v-text-field-->
<!--                            v-model="data.toll" placeholder="过路费"-->
<!--                            :rules="[v => !!v || '请填写过路费！']"-->
<!--                            required-->
<!--                    >-->
<!--                    </v-text-field>-->
<!--                </v-col>-->
                <v-col cols="12">
                    <v-text-field
                            v-model="data.remark" placeholder="事由"
                            :rules="[v => !!v || '请填写目事由！']"
                            required
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="12" md="3" sm="6" style="margin-top: -18px;">
                    <v-menu
                            ref="menu1"
                            v-model="menu1"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            max-width="290px"
                            min-width="290px"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                    v-model="data.startTime"
                                    label="开始时间"
                                    required
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    :rules="[v => !!v || '请选择日期！']"
                            ></v-text-field>
                        </template>
                        <v-date-picker
                                v-model="data.startTime"
                                @change="startTimeChanged"
                        ></v-date-picker>
                    </v-menu>
                </v-col>

                <v-col cols="12" md="3" sm="6" style="margin-top: -18px;">
                    <v-text-field
                            v-model="data.startAddrName" placeholder="出发地"
                            :rules="[v => !!v || '请填写目的地！']"
                            required
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="12" md="3" sm="6" style="margin-top: -18px;">
                    <v-menu
                            ref="menu2"
                            v-model="menu2"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            max-width="290px"
                            min-width="290px"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                    v-model="data.endTime"
                                    label="结束时间"
                                    required
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    :rules="[v => !!v || '请选择日期！']"
                            ></v-text-field>
                        </template>
                        <v-date-picker

                                v-model="data.endTime"
                                @change="endTimeChanged"
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" md="3" sm="6" style="margin-top: -18px;">
                    <v-text-field
                            v-model="data.endAddrName" placeholder="目的地"
                            required
                            :rules="[v => !!v || '请填写目的地！']"
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-radio-group row v-model="data.carType" :rules="[v => (!!v || v == 0) || '请选择车辆类型']">
                        <v-radio label="汽油车" :value="0"></v-radio>
                        <v-radio label="新能源车" :value="1"></v-radio>
                        <v-radio label="油电混动" :value="2"></v-radio>
                    </v-radio-group>
                </v-col>
            </v-row>
        </v-form>
    </v-container>
</template>
<script>

    import {getStaffBySectionId, list} from "../../api/section";
    import {search} from '@/api/project'
    import {getStaff} from "../../api/staff";
    import {extraInsert} from "../../api/outCarHistory";

    export default {
        name: 'extraInsertLocation',
        data: () => ({
            sectionItems: [],
            staffItems: [],

            staffSearchItems: [],
            staffSearchItem: null,
            searchName: null,

            searchProject: null,
            projectItems: [],

            menu1: false,
            menu2: false,

            data: {
                staff: {
                    name: ""
                },
                section: {
                    name: ""
                },
                startAddrName: null,
                endAddrName: null,
                remark: null,
                project: {
                    name: null,
                    id: null,
                },
                inputKm: null,
                toll: null,
                carType: null,
                startTime: null,
                endTime: null,
                startImg: " ",
                endImg: " ",

                startLatitude: 0,
                startLongitude: 0
            }
        }),

        created() {
            this.getSections()
        },

        watch: {
            searchName: {
                handler() {
                    this.staffSearchItems = []
                    this.searchManager()
                },
                deep: true,
            },
            'data.section': {
                handler() {
                    this.staffItems = []
                    this.getStaffListBySection()
                },
                deep: true,
            },
            searchProject(val) {
                if (val && val != "" && val != this.data.project.name) {
                    this.projectItems = []
                    search(val).then(result => {
                        if (result.length <= 0) {
                            this.projectItems.push({id: '-1', name: val})
                        } else {
                            this.projectItems = result
                        }
                    })
                }
            },
        },

        methods: {
            searchManager() {
                getStaff(this.searchName).then(res => {
                    this.staffSearchItems = res
                })
            },
            getStaffListBySection() {
                if (this.data.section != null) {
                    getStaffBySectionId(this.data.section.id).then(res => {
                        this.staffItems = res
                    })
                }
            },
            projectChangeHandler() {
                if (this.data.project && this.data.project.id && this.data.project.id != "") {
                    localStorage.setItem("locationProject", JSON.stringify(this.data.project))
                }
            },
            updateManager() {
                this.data.section = this.staffSearchItem.section
                this.data.staff = this.staffSearchItem
            },
            getSections() {
                this.sectionItems = []
                list().then(res => {
                    this.sectionItems = res
                })
            },
            startTimeChanged() {
                this.$refs.menu1.save(this.data.startTime)
            },

            endTimeChanged() {
                this.$refs.menu2.save(this.data.endTime)
            },

            validateForm() {
                let flag = null
                if (this.$refs['extraInsertForm'].validate()) {
                    flag = true
                } else {
                    flag = false
                }
                return flag
            },

            resetFormRules() {
                this.$refs['extraInsertForm'].resetValidation()
            },

            submitExtraInsert() {
                return extraInsert(this.data).then(res => {
                    this.reset()
                    return res
                })
            },

            reset() {
                this.data = {
                    staff: {
                        name: ""
                    },
                    section: {
                        name: ""
                    },
                    startAddrName: null,
                    endAddrName: null,
                    remark: null,
                    project: {
                        name: null,
                        id: null,
                    },
                    inputKm: null,
                    toll: null,
                    carType: null,
                    startTime: null,
                    endTime: null,

                    startImg: " ",
                    endImg: " ",

                    startLatitude: 0,
                    startLongitude: 0

                }
            }
        }
    }
</script>
