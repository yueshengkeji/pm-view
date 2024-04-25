<template>
    <v-card>
        <v-row>
            <v-col sm="6">
                <v-text-field label="合同名称" readonly
                              v-model="contractReceipt.contract.name"></v-text-field>
            </v-col>
            <v-col sm="6">
                <v-text-field label="开票单位" readonly
                              v-model="contractReceipt.company.name"></v-text-field>
            </v-col>
            <v-col sm="3">
                <v-text-field label="金额" type="number" :rules="[v => !!v || '请填写金额']" readonly
                              v-model="contractReceipt.money"></v-text-field>
            </v-col>
            <v-col sm="3">
                <v-radio-group v-model="contractReceipt.advanceFlag" label="预收票" mandatory row readonly>
                    <v-radio :value="0" label="否"></v-radio>
                    <v-radio :value="1" label="是"></v-radio>
                </v-radio-group>
            </v-col>
            <v-col sm="3" v-if="contractReceipt.advanceFlag == true">
                <v-text-field v-model="contractReceipt.advanceTime"
                              label="预收票日期" hide-details
                              readonly></v-text-field>
            </v-col>
            <v-col sm="3">
                <v-radio-group v-model="contractReceipt.state" label="已收票" mandatory row>
                    <v-radio :value="0" label="否"></v-radio>
                    <v-radio :value="1" label="是"></v-radio>
                </v-radio-group>
            </v-col>

            <v-col sm="9">
                <file-upload :dense="true" @change="fileChangeHandler"></file-upload>
            </v-col>
        </v-row>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="submitAdd" small color="primary" style="margin: 10px" @load="btnLoading">提交</v-btn>
        </v-card-actions>
    </v-card>
</template>
<script>
    import {update, selectById} from "../../../../api/contractReceipt";
    import FileUpload from "@/components/fileUpload.vue";

    export default {
        name: 'contractReceiptDetail',
        components: {FileUpload},
        data: () => ({
            btnLoading: false,
            contractReceipt: {
                contract: null,
                company: null,
                money: null,
                advanceFlag: 0,
                advanceTime: null,
                files: '',
                state: 0
            }
        }),

        created() {
            let id = this.$route.params.id
            if (id != null) {
                selectById({id: id}).then(res => {
                    this.contractReceipt = res
                })
            }
        },

        methods: {
            fileChangeHandler({files}) {
                this.contractReceipt.files = ""
                files.forEach(item => {
                    this.contractReceipt.files += item.id + ";"
                })
            },

            submitAdd() {
                this.btnLoading = true
                update(this.contractReceipt).then(() => {
                    this.contractReceipt.files = ''
                    this.btnLoading = false
                    this.$router.push("/purchaseContractForKaiLi/contractReceipt/list")
                })
            },
        }
    }
</script>
