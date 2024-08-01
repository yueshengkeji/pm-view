<template>
    <div>
        <v-autocomplete :dense="dense"
                        :label="label"
                        :items="list"
                        :clearable="clearable"
                        item-text="name"
                        item-value="id"
                        return-object
                        :search-input.sync="searchStaff"
                        @click:clear="clearData"
                        v-model="data"></v-autocomplete>
    </div>
</template>

<script>
    import {getStaff} from '@/api/staff'

    export default {
        name: "select-staff",
        props: {
            label: String,
            staff: Object,
            dense: Boolean,
            clearable:{
                type:Boolean,
                default:false
            }
        },
        model: {
            prop: 'staff',
            event: 'change'
        },
        data: () => ({
            searchStaff: null,
            list: [],
            data: null,
        }),
        watch: {
            staff: {
                handler() {
                    this.setData()
                },
                deep: true
            },
            data: {
                handler() {
                    this.$emit("change", this.data)
                },
                deep: true
            },
            searchStaff(val) {
                getStaff(val).then(result => {
                    this.list = result
                })
            }
        },
        created() {
            this.setData()
        },
        methods:{
            setData(){
                if(this.staff){
                    this.list.push(this.staff)
                }
                this.data = this.staff
            },
            clearData(){
                this.data = null
            }
        }
    }
</script>

<style scoped>

</style>
