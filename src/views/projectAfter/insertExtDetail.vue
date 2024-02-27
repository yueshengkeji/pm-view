<template>
    <div class="pa-3">
        <h3>项目报修明细</h3>
        <v-row v-if="showForm">
            <v-col lg="6" offset-lg="3" cols="12">
                <v-form ref="formWeixiu">
                    <v-row>

                        <v-col cols="12">
                            <div class="text-caption">项目名称</div>
                            <div class="text-h6">{{data.projectName}}</div>
                        </v-col>

                        <v-col cols="12">
                            <div class="text-caption">报修内容</div>
                            <div class="text-h6">{{data.title}}</div>
                        </v-col>

                        <v-col cols="12">
                            <div class="text-caption">报修人姓名</div>
                            <div class="text-h6">{{data.name}}</div>
                        </v-col>

                        <v-col cols="12">
                            <div class="text-caption">报修人手机号</div>
                            <div class="text-h6"><a :href="'tel:'+data.tel">{{data.tel}}</a></div>
                        </v-col>

                        <v-col cols="12">
                            <v-file-input dense disabled label="报修附件" accept="image/*"></v-file-input>
                            <img :src="data.files" ref="prevImg" width="1024" style="width:100%;max-height: 300px">
                        </v-col>

                        <v-col cols="12">
                            <div style="position: fixed;top:50px;width: 100%" class="white pr-3" v-if="showReturnMsg">
                                <v-textarea readonly v-model="data.returnContent"></v-textarea>
                            </div>
                            <v-textarea label="请输入反馈信息"
                                        rows="3"
                                        @focus="showReturnMsg = true"
                                        @blur="showReturnMsg = false"
                                        :rules="rules.returnContent"
                                        v-model="data.returnContent"></v-textarea>
                        </v-col>

                        <v-col cols="12">
                            <v-file-input dense :loading="loading" label="反馈附件（可选）" @change="fileChange"
                                          accept="image/*"></v-file-input>
                            <img :src="imgUrl" ref="returnPrevImg" width="1024" style="width:100%;max-height: 300px">
                        </v-col>

                        <v-btn :disabled="data.id == null" :loading="loading" color="primary" block
                               @click="updateReturnValue">提交反馈
                        </v-btn>
                    </v-row>
                </v-form>
            </v-col>
        </v-row>
        <v-row v-else>
            <v-col cols="12">
                <h3 class="text-center mt-5">{{msg}}</h3>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    import {getById, updateWeixiu} from '@/api/weixiu'

    export default {
        name: "insert-weixiu-ext",
        data: () => ({
            showReturnMsg: false,
            loading: false,
            materialLoading: false,
            data: {
                project: {id: null, name: null},
                title: '',
                returnContent: '',
                isService: 0,
                files: null,
                name: '',
                tel: '',
                projectName: null,
                returnFile: null
            },
            searchProject: null,
            projects: [],
            rules: {
                title: [
                    v => !!v || "请输入报修内容",
                    v => v.length < 1000 || "报修内容过长",
                ],
                name: [
                    v => !!v || "请输入您的姓名！",
                    v => v.length < 50 || '姓名过长，请重新输入！'
                ],
                tel: [
                    v => !!v || "请输入您的手机号！",
                    v => v.length < 12 || '手机号过长，请重新输入！'
                ],
                returnContent: [
                    v => !!v || "请输入反馈信息！",
                    v => v.length < 4000 || '反馈信息过长！'
                ],
            },
            showMsg: false,
            msg: null,
            errorMsg: null,

            showForm: true,
            imgUrl: null
        }),
        created() {
            this.reset()
        },
        methods: {
            fileChange(files) {
                this.loading = true
                let reader = new FileReader()
                reader.onload = () => {
                    this.imgUrl = reader.result
                    let img = this.$refs.returnPrevImg
                    console.log("reader onload", img)
                    let b = 3;
                    if (img.width > 700) {
                        b = 1
                    }
                    this.dealImageByTag(img, {width: img.width * b, height: img.height * b}, (dealRes) => {
                        img.onload = null
                        this.imgUrl = dealRes
                        this.loading = false
                        this.data.returnFile = dealRes
                    })
                }
                reader.readAsDataURL(files)
                console.log("fileChange", files)
            },
            updateReturnValue() {
                let valid = this.$refs['formWeixiu'].validate();
                if (valid) {
                    this.data.project = {id: this.data.projectId, name: this.data.projectName}
                    this.loading = true
                    let ajax;
                    ajax = updateWeixiu(this.data)
                    ajax.then(() => {
                        this.showForm = false
                        this.reset();
                        this.msg = "反馈成功"
                    }).catch(() => {
                        this.msg = "操作失败"
                    }).finally(() => {
                        this.errorMsg = null
                        this.showMsg = true
                        this.loading = false
                        this.$emit('success');
                    });
                }
            },
            reset() {
                this.loading = true
                let id = this.$route.params.id
                getById(id).then(result => {
                    result.returnContent = result.returnContent || ''
                    if (result.returnFile && result.returnFile != '') {
                        this.imgUrl = result.returnFile
                    } else {
                        result.returnFile = ''
                    }
                    this.data = result
                }).finally(() => {
                    this.loading = false
                })
            },
            handleSelect() {
                this.$refs['content'].focus();
            },
        }
    }
</script>

<style scoped>
    .focus-mb-15:focus {
        margin-bottom: 15%;
    }
</style>