<template>
    <div>
        <v-card class="pa-3">
            <v-form ref="applyDeleteForm">
                <v-text-field v-model="applyDelete.remark"
                              autofocus
                              :disabled="disabled"
                              label="请输入删除订单说明"
                              :rules="[v => !!v || '请输入删除订单说明',
                              v => v.length < 1000 || '说明信息过长！']"></v-text-field>
            </v-form>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-chip class="mr-1" x-small color="error" v-if="disabled">该订单已经申请过删除</v-chip>
                <v-btn @click="cancelDelete" color="error" v-if="disabled">取消删除</v-btn>
                <v-btn @click="$emit('cancel')">关闭</v-btn>
                <v-btn :disabled="disabled" color="primary" @click="insertDeleteHandler" :loading="deleteLoading">确定
                </v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
    import {applyDelete, cancelApplyDeleteState, getApplyDeleteByProId} from '@/api/procurement'

    export default {
        name: "applyDeleteForm",
        props: {
            deleteData: Object
        },
        watch: {
            deleteData: {
                handler(val, oldVal) {
                    if (val.proId != oldVal.proId) {
                        this.reset()
                        this.checkApplyDeleteData()
                    }
                },
                deep: true
            },
            applyDelete: {
                handler() {
                    this.$emit("change", this.applyDelete)
                },
                deep: true
            }
        },
        model: {
            prop: 'deleteData',
            event: 'change'
        },
        data: () => ({
            deleteLoading: false,
            disabled: false,
            applyDelete: null,
        }),
        created() {
            this.reset()
            this.checkApplyDeleteData()
        },
        methods: {
            cancelDelete() {
                cancelApplyDeleteState(this.applyDelete).then(() => this.$emit("success"))
            },
            reset() {
                this.applyDelete = this.deleteData
                let form = this.$refs.applyDeleteForm
                if (form) {
                    form.reset()
                }
            },
            checkApplyDeleteData() {
                this.deleteLoading = true
                this.disabled = false
                getApplyDeleteByProId(this.deleteData.proId).then(result => {
                    if (result.id) {
                        this.disabled = true
                        this.applyDelete = result
                    }
                }).catch(() => this.disabled = false).finally(() => this.deleteLoading = false)
            },
            insertDeleteHandler() {
                let valid = this.$refs.applyDeleteForm.validate()
                if (valid) {
                    this.deleteLoading = true
                    applyDelete(this.applyDelete).then(() => {
                        this.$emit('success')
                    }).finally(() => this.deleteLoading = false)
                }
            }
        }
    }
</script>

<style scoped>

</style>