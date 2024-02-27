<template>
    <div>
        <v-data-table :headers="headers"
                      :items-per-page="-1"
                      :items="items">
            <template v-slot:top>
                <v-row>
                    <v-col sm="2" v-if="$store.state.user.name == '1001'">
                        <v-file-input label="导入" v-model="importFile" @change="fileChange"></v-file-input>
                    </v-col>
                    <v-col sm="2">
                        <v-btn color="primary" @click="dialog = true">新增</v-btn>
                    </v-col>
                    <v-col sm="2" offset="6">
                        <v-text-field label="搜索" v-model="searchText" @change="list"></v-text-field>
                    </v-col>
                </v-row>
            </template>
            <template v-slot:item.action="{item}">
                <v-btn @click="update(item)" x-small>修改</v-btn>
            </template>
        </v-data-table>
        <v-dialog v-model="dialog" width="50%" @close="reset">
            <v-card class="pa-5">
                <v-form ref="ytForm">
                    <v-text-field :rules="rules.name" label="业态名称" v-model="data.name"></v-text-field>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="insertYt" color="primary">确定</v-btn>
                    <v-btn @click="dialog = false">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import {insert, list, update} from '@/api/yetai'

    export default {
        name: "yetai-list",
        data: () => ({
            importFile: null,
            items: [],
            headers: [
                {text: '序号', value: 'index'},
                {text: '业态名称', value: 'name'},
                {text: '操作', value: 'action'}
            ],
            data: null,
            dialog: false,
            searchText: null,
            rules:{
                name:[v => !!v || '请输入业态名称']
            }
        }),
        created() {
            this.reset()
            this.list()
        },
        methods: {
            insertYt() {
                let valid = this.$refs['ytForm'].validate()
                if (valid) {
                    if (this.data.id != null) {
                        update(this.data).then(() => {
                            this.reset()
                            this.dialog = false
                            this.list()
                        })
                    } else {
                        insert(this.data).then(() => {
                            this.reset()
                            this.dialog = false
                            this.list()
                        })
                    }

                }
            },
            list() {
                list({name: this.searchText}).then(data => {
                    data.forEach((item, idx) => {
                        item.index = idx + 1
                    })
                    this.items = data
                })
            },
            reset() {
                this.data = {
                    name: null,
                    id: null,
                }
            },
            fileChange() {

              import("xlsx").then(xlsx => {
                let reader = new FileReader()
                let than = this;
                reader.onload = function (e) {
                  than.errorMaterData = []
                  const workbook = xlsx.read(e.target.result, {type: 'binary'})
                  let sheetList = workbook.SheetNames
                  sheetList.forEach((name) => {
                    let worksheet = workbook.Sheets[name]
                    let newMater = xlsx.utils.sheet_to_json(worksheet, {
                      header: ["series", "floor", "house_number", "yetai",
                        "pinlei", "areanumber"]
                    })

                    newMater.forEach(item => {
                      if (item.yetai != null) {
                        item.yetai = item.yetai.trim("")
                        insert({name: item.yetai})
                      }
                    });
                  })
                  console.log("导入完成");
                }
                reader.readAsBinaryString(this.importFile)
              })

            },
            update(item) {
                this.data = item
                this.dialog = true
            }
        }
    }
</script>

<style scoped>

</style>