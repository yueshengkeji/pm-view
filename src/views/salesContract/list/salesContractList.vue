<template>
    <v-card>
        <v-row>
            <v-col
                    cols="12"
                    xl="2"
                    lg="2"
                    md="2"
                    sm="2"
                    xs="1"
            >
                <v-menu
                        ref="menu"
                        v-model="menu"
                        :close-on-content-click="false"
                        :return-value.sync="monthData.dateSearch"
                        transition="scale-transition"
                        offset-y
                        max-width="290px"
                        min-width="auto"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                                v-model="monthData.dateSearch"
                                label="查询年月"
                                prepend-icon="mdi-calendar"
                                v-bind="attrs"
                                v-on="on"
                        ></v-text-field>
                    </template>
                    <v-date-picker
                            v-model="monthData.dateSearch"
                            type="month"
                            no-title
                            scrollable
                            @change="monthChanged"

                    >
                        <v-spacer></v-spacer>
                    </v-date-picker>
                </v-menu>

            </v-col>
            <v-col
                    cols="12"
                    xl="2"
                    lg="2"
                    md="2"
                    sm="2"
                    xs="1"
            >
                <v-text-field
                        v-model="monthData.monthTotalMoney"
                        :label=labelMonthTotalMoney
                        readonly
                >
                </v-text-field>
            </v-col>
            <v-col
                    cols="12"
                    xl="2"
                    lg="2"
                    md="2"
                    sm="2"
                    xs="1"
            >
                <v-text-field
                        v-model="monthData.monthTotalInvoiced"
                        :label=labelMonthTotalInvoiced
                        readonly
                >
                </v-text-field>
            </v-col>
            <v-col
                    cols="12"
                    xl="2"
                    lg="2"
                    md="2"
                    sm="2"
                    xs="1"
            >
                <v-text-field
                        v-model="monthData.monthTotalCollected"
                        :label=labelMonthTotalCollected
                        readonly
                >
                </v-text-field>
            </v-col>
            <v-col
                    cols="12"
                    xl="2"
                    lg="1"
                    md="1"
                    sm="2"
                    xs="1"
            >
                <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="搜索"
                        single-line
                        hide-details
                        @change="searchContract"
                ></v-text-field>
            </v-col>

            <v-col
                    cols="12"
                    xl="2"
                    lg="3"
                    md="3"
                    sm="2"
                    xs="1"
            >
                <div style="width: 90%">
                    <v-switch label="我的"
                              v-model="mine"
                              @click="colorChange"
                              style="display: inline-block;width: 37%"
                    >
                    </v-switch>
                    <div style="display: inline-block;width: 45%">
                        <!--工程合同-->
                        <v-dialog
                                v-model="dialog"
                                max-width="1000px"
                        >
                            <template v-slot:activator="{ on, attrs }" style="float: right">
                                <v-btn
                                        color="primary"
                                        dark
                                        class="mb-2"
                                        v-bind="attrs"
                                        v-on="on"
                                        @click="resetClear"

                                >
                                    工程合同登记
                                </v-btn>
                            </template>
                            <v-card>
                                <v-form ref="editedItem" lazy-validation>
                                    <v-card-title>
                                        <span class="text-h5">{{ formTitle }}</span>
                                        <v-spacer></v-spacer>
                                        <v-col cols="12"
                                               sm="6"
                                               md="3">
                                            <v-combobox
                                                    v-model="editedItem.city"
                                                    :search-input.sync="searchPlace"
                                                    :items="placeItems"
                                                    label="地区"
                                                    item-text="name"
                                                    return-object
                                                    :rules="rules.paymentDaysRules"
                                            >
                                            </v-combobox>
                                        </v-col>

                                    </v-card-title>

                                    <v-card-text>

                                        <v-container>
                                            <v-row>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.projectBase"
                                                            label="项目地址(必填)"
                                                            :rules="rules.projectBaseRules"
                                                            required
                                                            @click="mapDialog = true"
                                                            :append-icon=" 'mdi-map-marker-plus-outline' "
                                                            @click:append="showMap"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.agreementID"
                                                            label="合同编号(必填)"
                                                            :rules="rules.agreementIDRules"
                                                            required
                                                            :readonly="isEdited"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.agreementName"
                                                            label="合同名称(必填)"
                                                            :rules="rules.agreementNameRules"
                                                            required
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.agreementMoney"
                                                            label="合同金额(￥)(必填)"
                                                            :rules="rules.agreementMoneyRules"
                                                            required
                                                            type="number"
                                                            onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            type="number"
                                                            v-model="editedItem.retentionPercent"
                                                            label="质保金比例(%)"
                                                            required
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            type="number"
                                                            v-model="editedItem.retentionMoney"
                                                            label="质保金"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.tax"
                                                            :append-icon=" 'mdi-plus' "
                                                            label="税率(%)"
                                                            onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                            @click:append="addTax"
                                                    >
                                                    </v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-menu
                                                            ref="menu2"
                                                            v-model="menu2"
                                                            :close-on-content-click="false"
                                                            :nudge-right="40"
                                                            transition="scale-transition"
                                                            offset-y
                                                            min-width="auto"
                                                    >
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-text-field
                                                                    v-model="editedItem.signDate"
                                                                    label="签订日期(必填)"
                                                                    :rules="rules.signDateRules"
                                                                    required
                                                                    prepend-icon="mdi-calendar"
                                                                    readonly
                                                                    v-bind="attrs"
                                                                    v-on="on"

                                                            ></v-text-field>
                                                        </template>
                                                        <v-date-picker
                                                                v-model="editedItem.signDate"
                                                                @change="signDateChanged"
                                                        ></v-date-picker>
                                                    </v-menu>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-menu
                                                            ref="menu3"
                                                            v-model="menu3"
                                                            :close-on-content-click="false"
                                                            :nudge-right="40"
                                                            transition="scale-transition"
                                                            offset-y
                                                            min-width="auto"
                                                    >
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-text-field
                                                                    v-model="editedItem.pDate"
                                                                    label="质保到期时间(必填)"
                                                                    required
                                                                    prepend-icon="mdi-calendar"
                                                                    readonly
                                                                    v-bind="attrs"
                                                                    v-on="on"
                                                                    :rules="rules.signDateRules"
                                                            ></v-text-field>
                                                        </template>
                                                        <v-date-picker
                                                                v-model="editedItem.pDate"
                                                                @change="pDateChanged"
                                                        ></v-date-picker>
                                                    </v-menu>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-combobox
                                                            v-model="editedItem.paymentDays"
                                                            :items="paymentItems"
                                                            label="账期(天)(必填)"
                                                            :rules="rules.paymentDaysRules"
                                                            aria-required="true"
                                                            oninput="value=value.replace(/[^\d]/g,'')"
                                                    ></v-combobox>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-combobox
                                                            v-model="editedItem.companyName"
                                                            :items="companyNameItems"
                                                            :search-input.sync="searchCompany"
                                                            label="单位名称(必填)"
                                                            :rules="rules.companyNameRules"
                                                            required
                                                            @change="updateMSG"
                                                    ></v-combobox>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.companyAddress"
                                                            label="单位地址(可选)"
                                                    ></v-text-field>

                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.contactMan"
                                                            :rules="rules.contactManRule"
                                                            label="联系人(可选)"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.phone"
                                                            label="联系方式(可选)"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.jurisdiction"
                                                            label="管辖区(可选)"
                                                    ></v-text-field>

                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.street"
                                                            label="街道(可选)"
                                                    ></v-text-field>

                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.bankName"
                                                            label="开户银行(可选)"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.bankAccount"
                                                            label="银行账户"
                                                            required
                                                            onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.taxID"
                                                            label="税号"
                                                            required
                                                            :rules="rules.taxIDRule"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.performanceBond"
                                                            label="履约保证金"
                                                            required
                                                            onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
                                                            @change="performanceBondChanged"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.performanceBondPercent"
                                                            label="履约保证金比例"
                                                            required
                                                            onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
                                                            @change="performanceBondPercentChanged"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.finalAccounts"
                                                            label="决算金额"
                                                            required
                                                            onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-menu
                                                            ref="menu4"
                                                            v-model="menu4"
                                                            :close-on-content-click="false"
                                                            :nudge-right="40"
                                                            transition="scale-transition"
                                                            offset-y
                                                            min-width="auto"
                                                    >
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-text-field
                                                                    v-model="editedItem.actualDate"
                                                                    label="实际完工时间"
                                                                    prepend-icon="mdi-calendar"
                                                                    readonly
                                                                    v-bind="attrs"
                                                                    v-on="on"
                                                            ></v-text-field>
                                                        </template>
                                                        <v-date-picker
                                                                v-model="editedItem.actualDate"
                                                                @change="actualDateChanged"
                                                        ></v-date-picker>
                                                    </v-menu>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="editedItem.remark"
                                                            label="备注(可选)"
                                                    ></v-text-field>
                                                </v-col>


                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <file-upload :clear="clear" @change="fileUpload"
                                                                 style="margin-top: 22px"></file-upload>
                                                </v-col>

                                                <v-col cols="12"
                                                       sm="6"
                                                       md="3">
                                                    <v-switch label="生成项目立项"
                                                              v-model="projectFlag">

                                                    </v-switch>
                                                </v-col>
                                                <v-col cols="12"
                                                       sm="6"
                                                       md="3">
                                                    <easy-flow coding="102012"
                                                               ref="flow"
                                                               defaultFlowName="17.项目立项"
                                                               v-if="projectFlag"></easy-flow>
                                                </v-col>

                                                <v-col cols="12"
                                                       sm="6"
                                                       md="3">
                                                    <easy-flow coding="132027"
                                                               ref="salesFlow"
                                                               defaultFlowName="合同盖章申请表"
                                                    ></easy-flow>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-btn
                                                            color="blue darken-1"
                                                            text
                                                            style="margin-top: 22px;font-size:medium"
                                                            @click="appointManager"
                                                    >经理指定
                                                    </v-btn>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-btn
                                                            color="blue darken-1"
                                                            text
                                                            @click="showFiles"
                                                            v-show="showSales"
                                                            style="margin-top: 22px"
                                                    >
                                                        查看附件
                                                    </v-btn>

                                                    <v-dialog v-model="showSalesFiles" max-width="600px">
                                                        <v-card>
                                                            <v-data-table
                                                                    :headers="salesFilesHeader"
                                                                    :items="salesFilesDesserts"
                                                                    :items-per-page="5"
                                                                    class="elevation-1"
                                                            >
                                                                <template v-slot:item.delete="{ item }">
                                                                    <v-icon
                                                                            small
                                                                            @click="salesFilesDelete(item)"
                                                                    >
                                                                        mdi-delete
                                                                    </v-icon>
                                                                </template>
                                                                <template v-slot:item.download="{ item }">
                                                                    <v-icon
                                                                            small
                                                                            @click="downloadFile(item)"
                                                                    >
                                                                        下载
                                                                    </v-icon>
                                                                </template>
                                                            </v-data-table>
                                                        </v-card>
                                                    </v-dialog>
                                                </v-col>
                                                <v-spacer></v-spacer>
                                                <v-col md="3" sm="6" cols="12">
                                                    <v-select :items="notifyTypes"
                                                              item-text="name"
                                                              item-value="id"
                                                              label="应收款通知周期"
                                                              v-model="editedItem.notifyType"

                                                    ></v-select>
                                                </v-col>
                                            </v-row>
                                        </v-container>

                                    </v-card-text>
                                </v-form>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                            color="blue darken-1"
                                            text
                                            @click="close"

                                    >
                                        取消
                                    </v-btn>
                                    <v-btn
                                            color="blue darken-1"
                                            text
                                            @click="save"
                                    >
                                        保存
                                    </v-btn>
                                    <v-btn
                                            color="blue darken-1"
                                            text
                                            title="仅保存数据，不发起审批流程"
                                            @click="saveData"
                                    >
                                        仅保存数据
                                    </v-btn>
                                </v-card-actions>
                                <v-dialog v-model="dialogAddTax" width="650px">
                                    <v-card>
                                        <v-data-table
                                                :headers="taxHeader"
                                                :items="taxDesserts"
                                                :items-per-page="5"
                                                class="elevation-1"
                                        >
                                            <template v-slot:top>
                                                <v-toolbar
                                                        flat
                                                >
                                                    <v-toolbar-title>税率类型</v-toolbar-title>
                                                    <v-divider
                                                            class="mx-4"
                                                            inset
                                                            vertical
                                                    ></v-divider>
                                                    <v-spacer></v-spacer>
                                                    <v-dialog
                                                            v-model="taxDialog"
                                                            max-width="500px"
                                                    >
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-btn
                                                                    color="primary"
                                                                    dark
                                                                    class="mb-2"
                                                                    v-bind="attrs"
                                                                    v-on="on"
                                                            >
                                                                新增
                                                            </v-btn>
                                                        </template>
                                                        <v-card>
                                                            <v-container>
                                                                <v-card-title>
                                                                    <span class="text-h5">新增税率类型</span>
                                                                </v-card-title>
                                                                <v-form ref="taxForm">
                                                                    <v-row>
                                                                        <v-col
                                                                                cols="12"
                                                                                sm="5"
                                                                                md="5"
                                                                        >
                                                                            <v-text-field
                                                                                    v-model="taxEditedItem.percentForAM"
                                                                                    label="占比(%)"
                                                                                    :rules="rules.percentForAMRules"
                                                                                    type="number"
                                                                                    onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                                            ></v-text-field>
                                                                        </v-col>
                                                                        <v-col
                                                                                cols="12"
                                                                                sm="5"
                                                                                md="5"
                                                                        >
                                                                            <v-text-field
                                                                                    v-model="taxEditedItem.taxExtra"
                                                                                    label="税率(%)"
                                                                                    :rules="rules.taxExtraRules"
                                                                                    type="number"
                                                                                    onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                                            ></v-text-field>
                                                                        </v-col>
                                                                    </v-row>
                                                                </v-form>
                                                                <v-card-actions>
                                                                    <v-spacer></v-spacer>
                                                                    <v-btn
                                                                            color="blue darken-1"
                                                                            text
                                                                            @click="closeTax"
                                                                    >
                                                                        取消
                                                                    </v-btn>
                                                                    <v-btn
                                                                            color="blue darken-1"
                                                                            text
                                                                            @click="saveTax"
                                                                    >
                                                                        确定
                                                                    </v-btn>
                                                                </v-card-actions>
                                                            </v-container>
                                                        </v-card>

                                                    </v-dialog>
                                                    <v-dialog v-model="taxDelete" max-width="500px">
                                                        <v-card>
                                                            <v-card-title class="text-h5">你确定要删除该记录?</v-card-title>
                                                            <v-card-actions>
                                                                <v-spacer></v-spacer>
                                                                <v-btn color="blue darken-1" text
                                                                       @click="taxCloseDelete">取消
                                                                </v-btn>
                                                                <v-btn color="blue darken-1" text
                                                                       @click="taxDeleteItemConfirm">确定
                                                                </v-btn>
                                                                <v-spacer></v-spacer>
                                                            </v-card-actions>
                                                        </v-card>
                                                    </v-dialog>
                                                </v-toolbar>
                                            </template>
                                            <template v-slot:item.taxActions="{ item }">

                                                <v-icon
                                                        small
                                                        @click="taxDeleteItem(item)"
                                                >
                                                    mdi-delete
                                                </v-icon>
                                            </template>
                                        </v-data-table>
                                    </v-card>
                                </v-dialog>
                            </v-card>
                        </v-dialog>
                    </div>

                </div>
            </v-col>
        </v-row>

        <v-spacer></v-spacer>

        <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
                <v-card-title class="text-h5">你确定要删除该记录?</v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDelete">取消</v-btn>
                    <v-btn color="blue darken-1" text @click="deleteItemConfirm">确定</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!--开票-->
        <v-dialog v-model="invoice" max-width="1000px">
            <v-card>
                <v-data-table
                        :headers="invoiceHeaders"
                        :items="invoiceDesserts"
                        :items-per-page="5"
                        class="elevation-1"
                        @dblclick:row="showInvoiceDetail"
                >
                    <template v-slot:item.createTime="{ item }">
                        <!--            <span>{{ new Date(item.signDate).toLocaleDateString() }}</span>-->
                        <span>{{ item.createTime | formatTimer }}</span>
                    </template>
                    <template v-slot:top>
                        <v-toolbar
                                flat
                        >
                            <v-toolbar-title>开票明细</v-toolbar-title>
                            <v-divider
                                    class="mx-4"
                                    inset
                                    vertical
                            ></v-divider>
                            <v-spacer></v-spacer>
                            <v-btn
                                    style="margin-right: 10px"
                                    dark
                                    @click="showInvoiceLogs"
                            >
                                开票日志
                            </v-btn>
                            <v-dialog
                                    v-model="invoiceDialog"
                                    max-width="800px"
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                            color="primary"
                                            dark

                                            v-bind="attrs"
                                            v-on="on"
                                            @click="invoiceDefault"
                                    >
                                        开票登记
                                    </v-btn>
                                </template>
                                <v-card>
                                    <v-card-title>
                                        <span class="text-h5">{{ formInvoiceTitle }}</span>
                                        <v-spacer></v-spacer>
                                        <span class="tip">{{ invoiceTipMSG }}</span>
                                    </v-card-title>

                                    <v-card-text>
                                        <span style="color: red">Tip:准备好身份证复印件、营业执照复印件、合同复印件</span>
                                        <v-container>
                                            <v-form ref="invoiceForm">
                                                <v-row>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="4"

                                                    >
                                                        合同名称：{{ invoiceDefaultItem.agreementName }}
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="4"
                                                    >
                                                        合同金额(￥)：{{ invoiceDefaultItem.agreementMoney }}
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="4"
                                                    >
                                                        已开票金额(￥)：{{ invoiceDefaultItem.invoicedMoney }}
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="4"
                                                    >
                                                        已收款金额(￥)：{{ invoiceDefaultItem.collectedMoney }}
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="4"
                                                    >
                                                        甲方：{{ invoiceDefaultItem.companyName }}
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="4"
                                                    >
                                                        地址：{{ invoiceDefaultItem.companyAddress }}
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="4"
                                                    >
                                                        电话：{{ invoiceDefaultItem.phone }}
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="4"
                                                    >
                                                        税号：{{ invoiceDefaultItem.taxID }}
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="4"
                                                    >
                                                        开户行账号：{{ invoiceDefaultItem.bankAccount }}
                                                    </v-col>
                                                    <v-col cols="12"
                                                           sm="12"
                                                           md="12">
                                                        <v-select label="开票单位"
                                                                  v-model="invoiceEditedItem.invoiceCompany"
                                                                  :items="invoiceCompanyItems"
                                                        ></v-select>
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        <v-text-field
                                                                v-model="invoiceEditedItem.invoiceID"
                                                                label="开票编号"

                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        <v-menu
                                                                ref="menu5"
                                                                v-model="menu5"
                                                                :close-on-content-click="false"
                                                                :nudge-right="40"
                                                                transition="scale-transition"
                                                                offset-y
                                                                min-width="auto"
                                                        >
                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-text-field
                                                                        v-model="invoiceEditedItem.createTime"
                                                                        label="开票日期"
                                                                        required
                                                                        prepend-icon="mdi-calendar"
                                                                        readonly
                                                                        v-bind="attrs"
                                                                        v-on="on"

                                                                ></v-text-field>
                                                            </template>
                                                            <v-date-picker
                                                                    v-model="invoiceEditedItem.createTime"
                                                                    @change="invoiceDateChanged"
                                                            ></v-date-picker>
                                                        </v-menu>
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        <v-menu
                                                                ref="menu7"
                                                                v-model="menu7"
                                                                :close-on-content-click="false"
                                                                :nudge-right="40"
                                                                transition="scale-transition"
                                                                offset-y
                                                                min-width="auto"
                                                        >
                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-text-field
                                                                        v-model="invoiceEditedItem.returnDate"
                                                                        label="预回款日期"
                                                                        required
                                                                        prepend-icon="mdi-calendar"
                                                                        readonly
                                                                        v-bind="attrs"
                                                                        v-on="on"

                                                                ></v-text-field>
                                                            </template>
                                                            <v-date-picker
                                                                    v-model="invoiceEditedItem.returnDate"
                                                                    @change="returnDateChanged"
                                                            ></v-date-picker>
                                                        </v-menu>
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        <v-select
                                                                v-model="invoiceEditedItem.tax"
                                                                label="税率（占比%/税率%）"
                                                                :items="invoiceTaxItems"
                                                        >

                                                        </v-select>
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        <v-text-field
                                                                v-model="invoiceEditedItem.invoiceMoney"
                                                                label="开票金额(￥)(必填)"
                                                                type="number"
                                                                @change="invoiceMoneyOfPercent"
                                                                onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col
                                                            cols="12"
                                                            sm="6"
                                                            md="3"
                                                    >
                                                        <v-text-field
                                                                v-model="invoiceEditedItem.percent"
                                                                label="百分比(%)(必填)"
                                                                type="number"
                                                                onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                                :autofocus="true"
                                                                :rules="rules.invoicePercentRules"
                                                                @change="percentOfInvoiceMoney"
                                                        ></v-text-field>
                                                    </v-col>

                                                    <v-col cols="12"
                                                           sm="6"
                                                           md="3">
                                                        <v-switch label="生成开票申请单"
                                                                  v-model="invoiceFlag">
                                                        </v-switch>
                                                    </v-col>
                                                    <v-col cols="12"
                                                           sm="6"
                                                           md="3">
                                                        <easy-flow coding="1320275"
                                                                   ref="invoiceFlow"
                                                                   defaultFlowName="开票申请单"
                                                                   v-if="invoiceFlag"></easy-flow>
                                                    </v-col>
                                                </v-row>
                                                <v-row v-if="dialogNotNT">
                                                    <v-col cols="12" md="4">
                                                        <v-text-field
                                                                label="经办人姓名"
                                                                :rules="rules.operatorNameRule"
                                                                v-model="invoiceEditedItem.operatorName">

                                                        </v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" md="4">
                                                        <v-text-field
                                                                label="联系方式"
                                                                v-model="invoiceEditedItem.operatorPhone"
                                                                :rules="rules.phoneRules">

                                                        </v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" md="4">
                                                        <v-text-field
                                                                label="身份证"
                                                                onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                                :rules="rules.operatorIDNumber"
                                                                v-model="invoiceEditedItem.operatorIDNumber">

                                                        </v-text-field>
                                                    </v-col>
                                                </v-row>

                                                <v-row v-if="dialogNotNT">
                                                    <v-col>
                                                        <v-distpicker style="margin-top: 10px"
                                                                      :city="cityTemp"
                                                                      :area="districtTemp"
                                                                      :province="provinceTemp"
                                                                      @change="distpickerChanged">
                                                        </v-distpicker>
                                                    </v-col>
                                                    <v-col md="4">
                                                        <v-text-field
                                                                label="街道"
                                                                v-model="invoiceEditedItem.street"
                                                                :rules="rules.streetRule"
                                                        ></v-text-field>
                                                    </v-col>
                                                </v-row>

                                                <v-col v-if="dialogTax6 == true">
                                                    <v-text-field
                                                            v-model="invoiceEditedItem.invoiceContent"
                                                            label="开票内容"
                                                            :rules="rules.invoiceContentRule"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col v-if="dialogTax6 == false">
                                                    <v-text-field
                                                            v-model="invoiceEditedItem.invoiceContent"
                                                            label="开票内容"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col v-if="dialogTax13">
                                                    <file-upload :clear="clearInvoice" @change="fileUploadInvoice"
                                                                 style="margin-top: 22px"></file-upload>
                                                </v-col>
                                                <v-col>
                                                    <v-text-field
                                                            v-model="invoiceEditedItem.remark"
                                                            :label="invoiceLabel"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col>
                                                    <v-text-field
                                                            v-model="invoiceEditedItem.partyANeeds"
                                                            label="甲方需求"
                                                    ></v-text-field>
                                                </v-col>
                                            </v-form>

                                        </v-container>
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="closeInvoice"
                                        >
                                            取消
                                        </v-btn>
                                        <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="saveInvoice"
                                        >
                                            保存
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>

                            </v-dialog>
                            <v-dialog v-model="invoiceDelete" max-width="500px">
                                <v-card>
                                    <v-card-title class="text-h5">你确定要删除该记录?</v-card-title>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="blue darken-1" text @click="invoiceCloseDelete">取消</v-btn>
                                        <v-btn color="blue darken-1" text @click="invoiceDeleteItemConfirm">确定
                                        </v-btn>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                            <v-dialog v-model="dialogInvoiceLogs" width="500px">
                                <v-card>
                                    <v-card-title class="text-h6">开票日志</v-card-title>
                                    <v-container>
                                        <v-list dense>
                                            <v-list-item
                                                    v-for="(item, i) in invoiceLogsItems"
                                                    :key="i"
                                            >
                                                <v-list-item-content v-text="item"></v-list-item-content>
                                            </v-list-item>
                                        </v-list>
                                    </v-container>
                                </v-card>
                            </v-dialog>
                        </v-toolbar>
                    </template>
                    <template v-slot:item.invoiceActions="{ item }">
                        <!--                                <v-icon-->
                        <!--                                        small-->
                        <!--                                        class="mr-2"-->
                        <!--                                        @click="invoiceEditItem(item)"-->
                        <!--                                >-->
                        <!--                                    mdi-pencil-->
                        <!--                                </v-icon>-->
                        <v-icon
                                small
                                @click="invoiceDeleteItem(item)"
                        >
                            mdi-delete
                        </v-icon>
                    </template>
                </v-data-table>
            </v-card>
        </v-dialog>
        <!--开票详情-->
        <v-dialog v-model="dialogInvoiceDetail">
            <v-card>
                <invoice-detail :id-item="invoiceDetailId"></invoice-detail>
            </v-card>
        </v-dialog>
        <!--收款-->
        <v-dialog v-model="collect" max-width="1000px">
            <v-card>
                <v-data-table
                        :headers="collectHeaders"
                        :items="collectDesserts"
                        :items-per-page="5"
                        class="elevation-1"
                >
                    <template v-slot:top>
                        <v-toolbar
                                flat
                        >
                            <v-toolbar-title>收款明细</v-toolbar-title>
                            <v-divider
                                    class="mx-4"
                                    inset
                                    vertical
                            ></v-divider>
                            <v-spacer></v-spacer>
                            <v-btn
                                    class="mb-2 mr-1"
                                    dark
                                    @click="showCollectLogs"
                            >
                                收款日志
                            </v-btn>
                            <v-btn class="mb-2 mr-1" @click="updateNotify">触发通知</v-btn>
                            <v-dialog
                                    v-model="collectDialog"
                                    max-width="800px"
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                            color="primary"
                                            dark
                                            class="mb-2"
                                            v-bind="attrs"
                                            v-on="on"
                                    >
                                        收款登记
                                    </v-btn>
                                </template>
                                <v-card>
                                    <v-card-title>
                                        <span class="text-h5">{{ formCollectTitle }}</span>
                                    </v-card-title>

                                    <v-card-text>
                                        <v-container>
                                            <v-row>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    合同名称：{{ collectDefaultItem.agreementName }}
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    合同金额(￥)：{{ collectDefaultItem.agreementMoney }}
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    已收款金额(￥)：{{ collectDefaultItem.collectedMoney }}
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    已收款百分比(%)：{{ collectDefaultItem.collectedPercent }}
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="collectEditedItem.collectID"
                                                            label="收款编号"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-menu
                                                            ref="menu6"
                                                            v-model="menu6"
                                                            :close-on-content-click="false"
                                                            :nudge-right="40"
                                                            transition="scale-transition"
                                                            offset-y
                                                            min-width="auto"
                                                    >
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-text-field
                                                                    v-model="collectEditedItem.createTime"
                                                                    label="收款日期"
                                                                    required
                                                                    prepend-icon="mdi-calendar"
                                                                    readonly
                                                                    v-bind="attrs"
                                                                    v-on="on"
                                                            ></v-text-field>
                                                        </template>
                                                        <v-date-picker
                                                                v-model="collectEditedItem.createTime"
                                                                @change="collectDateChanged"
                                                        ></v-date-picker>
                                                    </v-menu>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="collectEditedItem.collectMoney"
                                                            label="收款金额(￥)(必填)"
                                                            type="number"
                                                            onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                            @change="collectMoneyOfPercent"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="3"
                                                >
                                                    <v-text-field
                                                            v-model="collectEditedItem.percent"
                                                            label="百分比(%)"
                                                            type="number"
                                                            onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                            @change="percentOfCollectMoney"
                                                            :autofocus="true"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col>
                                                    <v-text-field
                                                            v-model="collectEditedItem.remark"
                                                            label="备注"

                                                    ></v-text-field>
                                                </v-col>
                                            </v-row>
                                        </v-container>
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="closeCollect"
                                        >
                                            取消
                                        </v-btn>
                                        <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="saveCollect"
                                        >
                                            保存
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                            <v-dialog v-model="collectDialogDelete" max-width="500px">
                                <v-card>
                                    <v-card-title class="text-h5">你确定要删除该记录?</v-card-title>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="blue darken-1" text @click="collectCloseDelete">取消</v-btn>
                                        <v-btn color="blue darken-1" text @click="collectDeleteItemConfirm">确定
                                        </v-btn>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                            <!--收款日志-->
                            <v-dialog v-model="dialogCollectLogs" width="500px">
                                <v-card>
                                    <v-card-title class="text-h6">收款日志</v-card-title>
                                    <v-container>
                                        <v-list dense>
                                            <v-list-item
                                                    v-for="(item, i) in collectLogsItems"
                                                    :key="i"
                                            >
                                                <v-list-item-content v-text="item"></v-list-item-content>
                                            </v-list-item>
                                        </v-list>
                                    </v-container>
                                </v-card>
                            </v-dialog>
                            <!--收款类型-->
                            <v-dialog v-model="dialogCollectType" width="500px">
                                <v-card>
                                    <v-card-title class="text-h6">收款方式</v-card-title>
                                    <v-container>
                                        <v-radio-group
                                                v-model="collectType"
                                                mandatory
                                        >
                                            <v-radio
                                                    label="现金"
                                                    value="0"
                                            ></v-radio>
                                            <div v-if="collectType == 0">
                                                <v-form ref="collectTypeForm"></v-form>
                                            </div>
                                            <v-radio
                                                    label="商业承兑"
                                                    value="1"
                                            ></v-radio>
                                            <div v-if="collectType == 1">
                                                <v-form ref="collectTypeForm">
                                                    <v-row>
                                                        <v-col
                                                                sm="6"
                                                                md="4"
                                                        >
                                                            <v-menu
                                                                    ref="menu8"
                                                                    v-model="menu8"
                                                                    :close-on-content-click="false"
                                                                    :nudge-right="40"
                                                                    transition="scale-transition"
                                                                    offset-y
                                                                    min-width="auto"
                                                            >
                                                                <template v-slot:activator="{ on, attrs }">
                                                                    <v-text-field
                                                                            v-model="tradeAcceptanceDate"
                                                                            label="到期时间(必填)"
                                                                            :rules="rules.tradeAcceptanceDateRule"
                                                                            required
                                                                            prepend-icon="mdi-calendar"
                                                                            readonly
                                                                            v-bind="attrs"
                                                                            v-on="on"
                                                                    ></v-text-field>
                                                                </template>
                                                                <v-date-picker
                                                                        v-model="tradeAcceptanceDate"
                                                                        @input="menu8 = false"
                                                                ></v-date-picker>
                                                            </v-menu>
                                                        </v-col>
                                                        <v-col
                                                                sm="6"
                                                                md="4"

                                                        >
                                                            <v-text-field
                                                                    v-model="tradeAcceptanceInterest"
                                                                    label="贴息(￥)(可选)"
                                                                    :rules="rules.tradeAcceptanceInterestRule"
                                                                    onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                            >
                                                            </v-text-field>
                                                        </v-col>
                                                    </v-row>
                                                </v-form>
                                            </div>
                                            <v-radio
                                                    label="保理"
                                                    value="2"
                                            ></v-radio>
                                            <div v-if="collectType ==2">
                                                <v-form ref="collectTypeForm">
                                                    <v-col
                                                            sm="6"
                                                            md="4"
                                                    >
                                                        <v-menu
                                                                ref="menu9"
                                                                v-model="menu9"
                                                                :close-on-content-click="false"
                                                                :nudge-right="40"
                                                                transition="scale-transition"
                                                                offset-y
                                                                min-width="auto"
                                                        >
                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-text-field
                                                                        v-model="factoringDate"
                                                                        label="保理时间(必填)"
                                                                        :rules="rules.factoringDateRule"
                                                                        required
                                                                        prepend-icon="mdi-calendar"
                                                                        readonly
                                                                        v-bind="attrs"
                                                                        v-on="on"
                                                                ></v-text-field>
                                                            </template>
                                                            <v-date-picker
                                                                    v-model="factoringDate"
                                                                    @input="menu9 = false"
                                                            ></v-date-picker>
                                                        </v-menu>
                                                    </v-col>
                                                </v-form>
                                            </div>
                                            <v-radio
                                                    label="固定资产"
                                                    value="3"
                                            ></v-radio>
                                            <div v-if="collectType == 3">
                                                <v-form ref="collectTypeForm">
                                                    <v-col
                                                    >
                                                        <v-text-field
                                                                v-model="fixedAssets"
                                                                :rules="rules.fixedAssetsRule"
                                                                label="固定资产(必填)"
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-radio-group v-model="fixedAssetsStatus" row mandatory dense
                                                                   label="固定资产处理状况">
                                                        <v-radio label="未处理" value="0"></v-radio>
                                                        <v-radio label="已处理" value="1"></v-radio>
                                                    </v-radio-group>
                                                </v-form>
                                            </div>
                                        </v-radio-group>
                                    </v-container>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="closeCollectType"
                                        >
                                            取消
                                        </v-btn>
                                        <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="saveCollectType"
                                        >
                                            保存
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                            <!--查看收款类型-->
                            <v-dialog v-model="dialogShowCollectType" width="500px">
                                <v-card>
                                    <v-card-title class="text-h6">收款类型</v-card-title>
                                    <v-container>
                                        <div v-if="dialogShowCollectTypeItem.collectType == 0">
                                            <strong style="color: blue">现金</strong>
                                        </div>
                                        <div v-if="dialogShowCollectTypeItem.collectType == null">
                                            <strong style="color: blue">默认现金</strong>
                                        </div>
                                        <div v-if="dialogShowCollectTypeItem.collectType == 1">
                                            <strong style="color: blue">商业承兑</strong>
                                            <v-col
                                                    cols="12"
                                                    md="6"
                                            >
                                                <v-text-field
                                                        v-model="dialogShowCollectTypeItem.temptradeDate"
                                                        label="到期时间"
                                                        prepend-icon="mdi-calendar"
                                                        readonly
                                                >
                                                    <template
                                                            v-slot:dialogShowCollectTypeItem.tradeAcceptanceDate="{ dialogShowCollectTypeItem }">
                                                        <span>{{ dialogShowCollectTypeItem.tradeAcceptanceDate | formatTimer }}</span>
                                                    </template>
                                                </v-text-field>
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    md="6"
                                            >
                                                <v-text-field
                                                        v-model="dialogShowCollectTypeItem.tradeAcceptanceInterest"
                                                        label="贴息"
                                                        readonly
                                                ></v-text-field>
                                            </v-col>
                                        </div>
                                        <div v-if="dialogShowCollectTypeItem.collectType == 2">
                                            <strong style="color: blue">保理</strong>
                                            <v-col
                                                    cols="12"
                                                    md="6"
                                            >
                                                <v-text-field
                                                        v-model="dialogShowCollectTypeItem.tempFactoringDate"
                                                        label="到期时间"
                                                        prepend-icon="mdi-calendar"
                                                        readonly
                                                >
                                                </v-text-field>

                                            </v-col>
                                        </div>
                                        <div v-if="dialogShowCollectTypeItem.collectType == 3">
                                            <strong style="color: blue">固定资产</strong>
                                            <v-textarea
                                                    v-model="dialogShowCollectTypeItem.fixedAssets"
                                                    readonly
                                                    filled
                                                    auto-grow
                                                    name="input-7-1"
                                                    label="资产情况"
                                            >
                                            </v-textarea>
                                            <v-radio-group v-model="dialogShowCollectTypeItem.fixedAssetsStatus" row
                                                           dense
                                                           label="固定资产处理状况"
                                                           @change="fixedAssetsStatusChanged"
                                            >
                                                <v-radio label="未处理" :value=0></v-radio>
                                                <v-radio label="已处理" :value=1></v-radio>
                                            </v-radio-group>
                                        </div>
                                    </v-container>
                                </v-card>
                            </v-dialog>
                        </v-toolbar>
                    </template>
                    <template v-slot:item.status="{ item }">
                        <v-container
                                class="px-0"
                                fluid
                        >
                            <v-switch
                                    :disabled="collectSwitch"
                                    v-model="item.statusCheck"
                                    :label="item.status"
                                    @change="Check(item)"
                            ></v-switch>
                        </v-container>
                    </template>
                    <template v-slot:item.collectActions="{ item }">
                        <v-icon
                                small
                                @click="collectDeleteItem(item)"
                        >
                            mdi-delete
                        </v-icon>
                        <v-icon
                                small
                                @click="showCollectType(item)"
                        >
                            收款类型
                        </v-icon>
                    </template>
                    <template v-slot:item.pDate="{item}">
                        <v-chip link @click="showMenu($event,item)">{{ item.pDate }}</v-chip>
                    </template>
                    <template v-slot:item.collectMoney="{item}">
                        <v-chip link @click="showChangeCollect(item)">{{ item.collectMoney }}</v-chip>
                    </template>
                    <template v-slot:item.percent="{item}">
                        <v-chip link @click="showChangeCollect(item)">{{ item.percent }}</v-chip>
                    </template>
                </v-data-table>
                <!--                        更新预收款日期-->
                <v-menu ref="dateMenu"
                        v-model="dateMenu"
                        :close-on-content-click="false"
                        offset-y
                        absolute
                        :position-y="y"
                        :position-x="x"
                >
                    <v-date-picker
                            @change="updateDate"
                            v-model="pDate"
                            no-title
                            @input="dateMenu = false"
                    ></v-date-picker>

                </v-menu>

                <v-snackbar v-model="msgFlag">{{ msg }}</v-snackbar>
            </v-card>
        </v-dialog>
        <!--修改收款金额-->
        <v-dialog v-model="dialogChangeCollect" width="300px">
            <v-card>
                <v-card-title class="text-h6">收款金额修改</v-card-title>
                <v-container>
                    <v-form>
                        <v-row>
                            <v-col
                                    cols="12"
                                    md="5"
                                    sm="3"
                            >
                                <v-text-field
                                        v-model="changeCollectMoney"
                                        label="收款金额"
                                        onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                        type="number"
                                        @change="showChangeCollectPercent"
                                ></v-text-field>
                            </v-col>
                            <v-col
                                    cols="12"
                                    md="5"
                                    sm="3"
                            >
                                <v-text-field
                                        v-model="changeCollectPercent"
                                        label="百分比(%)"
                                        :rules="rules.percentForAMRules"
                                        onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                        type="number"
                                        @change="showChangeCollectMoney"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-container>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                            color="blue darken-1"
                            text
                            @click="closeCollectMoneyChange"
                    >
                        取消
                    </v-btn>
                    <v-btn
                            color="blue darken-1"
                            text
                            @click="saveCollectMoneyChange"
                    >
                        保存
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-data-table
                :headers="headers"
                :items="desserts"
                :options.sync="options"
                :server-items-length="totalDesserts"
                class="elevation-1"
        >
            <template v-slot:item.projectBase="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.projectBase}}
                        </div>
                    </template>
                    <span>{{item.projectBase}}</span>
                </v-tooltip>
            </template>

            <template v-slot:item.agreementID="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.agreementID}}
                        </div>
                    </template>
                    <span>{{item.agreementID}}</span>
                </v-tooltip>
            </template>

            <template v-slot:item.agreementName="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.agreementName}}
                        </div>
                    </template>
                    <span>{{item.agreementName}}</span>
                </v-tooltip>
            </template>

            <template v-slot:item.agreementMoney="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.agreementMoney}}
                        </div>
                    </template>
                    <span>{{item.agreementMoney}}</span>
                </v-tooltip>
            </template>

            <template v-slot:item.invoicedMoney="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.invoicedMoney}}
                        </div>
                    </template>
                    <span>{{item.invoicedMoney}}</span>
                </v-tooltip>
            </template>

            <template v-slot:item.collectedMoney="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.collectedMoney}}
                        </div>
                    </template>
                    <span>{{item.collectedMoney}}</span>
                </v-tooltip>
            </template>

            <template v-slot:item.companyName="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.companyName}}
                        </div>
                    </template>
                    <span>{{item.companyName}}</span>
                </v-tooltip>
            </template>

            <template v-slot:item.registrant="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 50px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.registrant}}
                        </div>
                    </template>
                    <span>{{item.registrant}}</span>
                </v-tooltip>
            </template>

            <template v-slot:item.remark="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{item.remark}}
                        </div>
                    </template>
                    <span>{{item.remark}}</span>
                </v-tooltip>
            </template>

            <template v-slot:item.signDate="{ item }">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 80px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{ item.signDate | formatTimer }}
                        </div>
                    </template>
                    <span>{{ item.signDate | formatTimer }}</span>
                </v-tooltip>
            </template>

            <template v-slot:item.pDate="{ item }">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 80px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{ item.pDate}}
                        </div>
                    </template>
                    <span>{{ item.pDate }}</span>
                </v-tooltip>
            </template>

            <template v-slot:item.actualDate="{ item }">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div style="max-width: 80px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                            {{ item.actualDate }}
                        </div>
                    </template>
                    <span>{{ item.actualDate}}</span>
                </v-tooltip>
            </template>

            <template v-slot:item.invoicePercent="{ item }">
                <v-progress-linear

                        height="15"
                        :color="item.percentColorI"
                        :value="item.contractInvoiceP"
                >
                    <strong style="font-size: 10px">{{ item.contractInvoiceP }}%</strong>
                </v-progress-linear>
            </template>

            <template v-slot:item.collectPercent="{ item }">
                <div style="max-width: 80px" class="text-no-wrap">
                    <v-progress-linear

                            height="15"
                            :color="item.percentColorC"
                            :value="item.contractCollectP"
                    >
                        <strong style="font-size: 10px">{{ item.contractCollectP }}%</strong>
                    </v-progress-linear>
                </div>
            </template>

            <template v-slot:item.actions="{ item }">
                <v-icon
                        small
                        class="mr-2"
                        @click="editItem(item)"
                >
                    mdi-pencil
                </v-icon>
                <v-icon
                        small
                        @click="deleteItem(item)"
                >
                    mdi-delete
                </v-icon>
                <v-icon
                        small
                        class="mr-2"
                        @click="invoiceAction(item)"
                >
                    开票明细
                </v-icon>
                <v-icon
                        small
                        class="mr-2"
                        @click="collectAction(item)"
                >
                    收款明细
                </v-icon>
                <!--                <v-icon-->
                <!--                        small-->
                <!--                        @click="appointManager(item)"-->
                <!--                >-->
                <!--                    经理指定-->
                <!--                </v-icon>-->
            </template>

        </v-data-table>
        <!--指定项目经理-->
        <v-dialog v-model="dialogManager" max-width="600px">
            <v-card>
                <v-data-table
                        :headers="managerHeaders"
                        :items="managerDesserts"
                        :items-per-page="5"
                        class="elevation-1"
                >
                    <template v-slot:top>
                        <v-toolbar
                                flat
                        >
                            <v-toolbar-title>指定项目经理</v-toolbar-title>
                            <v-divider
                                    class="mx-4"
                                    inset
                                    vertical
                            ></v-divider>
                            <v-spacer></v-spacer>
                            <v-dialog
                                    v-model="managerAddDialog"
                                    max-width="800px"
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                            color="primary"
                                            dark
                                            class="mb-2"
                                            v-bind="attrs"
                                            v-on="on"
                                    >
                                        新增项目经理
                                    </v-btn>
                                </template>
                                <v-card>
                                    <v-card-title>
                                        <span class="text-h5">新增项目经理</span>
                                        <v-spacer></v-spacer>
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

                                    </v-card-title>

                                    <v-card-text>
                                        <v-container>
                                            <v-row align="center">
                                                <v-col
                                                        class="d-flex"
                                                        cols="12"
                                                        sm="6"
                                                        md="5"
                                                >
                                                    <v-select
                                                            v-model="sectionItem"
                                                            :items="sectionItems"
                                                            label="部门"
                                                            outlined
                                                            dense
                                                            return-object
                                                            item-text="name"
                                                    >

                                                    </v-select>
                                                </v-col>

                                                <v-col
                                                        class="d-flex"
                                                        cols="12"
                                                        sm="6"
                                                        md="5"
                                                >
                                                    <v-select
                                                            v-model="staffItem"
                                                            :items="staffItems"
                                                            label="人员"
                                                            outlined
                                                            dense
                                                            return-object
                                                            item-text="name"
                                                    ></v-select>
                                                </v-col>
                                            </v-row>

                                        </v-container>
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="closeManagerAppoint"
                                        >
                                            取消
                                        </v-btn>
                                        <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="saveManagerAppoint"
                                        >
                                            保存
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>

                            </v-dialog>
                        </v-toolbar>
                    </template>
                    <template v-slot:item.managerActions="{ item }">
                        <v-icon
                                small
                                @click="managerDeleteItem(item)"
                        >
                            mdi-delete
                        </v-icon>
                    </template>

                </v-data-table>
                <v-dialog v-model="managerDialogDelete" max-width="300px">
                    <v-card>
                        <v-card-title class="text-h5">你确定要删除该记录?</v-card-title>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" text @click="managerCloseDelete">取消</v-btn>
                            <v-btn color="blue darken-1" text @click="managerDeleteItemConfirm">确定
                            </v-btn>
                            <v-spacer></v-spacer>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-card>
        </v-dialog>
        <!--加载框-->
        <v-dialog v-model="loadDialog"
                  hide-overlay
                  persistent
                  width="300">
            <v-card
                    color="primary"
                    dark>
                <v-card-text>
                    正在处理。。。
                    <v-progress-linear
                            indeterminate
                            color="white"
                            class="mb-0"
                    ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
        <!--消息框-->
        <v-snackbar v-model="showSnackbarDialog"
                    :timeout="timeout"
                    :centered="true"
        >
            {{ msgStr }}
        </v-snackbar>
        <!--百度地图-->
        <v-dialog v-model="mapDialog" width="80%">
            <template class="baiduMap">
                <div class="searchBox">
                        <v-text-field
                                class="d-inline-block"
                                v-model="placeStr"
                                label="关键词"
                                solo
                                dense
                                style="width: 300px;"
                                @keydown.enter="searchAddress"
                        ></v-text-field>
                    <v-btn @click="searchAddress" style="margin-left: 10px">搜索</v-btn>
                    <v-btn @click="saveAddress" :loading="searchLoading" style="margin-left: 10px">保存地址</v-btn>
                </div>

                <baidu-map class="bm-view" :ak="ak" :zoom="zoom" :center="center" :scroll-wheel-zoom="true"
                           @ready="mapReady">
                    <bm-local-search :keyword="keyword" :auto-viewport="true" :select-first-result="true" class="search" @infohtmlset="getInfohtmlset"></bm-local-search>
                </baidu-map>

            </template>
        </v-dialog>
    </v-card>
</template>

<script>
    import salesContractApi from '@/api/salesContract';
    import companyApi from '@/api/company';
    import fileUpload from "../../../components/fileUpload";
    import easyFlow from '@/components/easyflow/easyFlow'
    import {insertProject} from '@/api/project'
    import {list, getStaffBySectionId} from "../../../api/section";
    import {getStaff} from "../../../api/staff";
    import salesContractLogsApi from "../../../api/salesContractLogs";
    import {loadRegion} from "../../../api/region";
    import VDistpicker from "v-distpicker";
    import invoiceDetail from "../../../components/invoiceDetail";
    import {getConfig} from '@/api/systemConfig';
    import BaiduMap from 'vue-baidu-map/components/map/Map.vue'
    import BmLocalSearch from 'vue-baidu-map/components/search/LocalSearch.vue'

    export default {
        name: "sales-contract",
        components: {fileUpload, easyFlow, VDistpicker, invoiceDetail, BaiduMap, BmLocalSearch},
        data: () => ({
            dialogInvoiceDetail: false,
            invoiceDetailId: null,

            clearInvoice: false,

            dialogNotNT: false,
            invoiceLabel: '备注',
            dialogTax3: false,
            dialogTax6: false,
            dialogTax9: false,
            dialogTax13: false,

            searchPlace: null,//地区
            placeItems: [],

            invoiceCompanyItems: ['卓茂', '开丽', '安防'],//开票单位

            collectSwitch: false,
            dateMenu: false,
            x: 0,
            y: 0,
            pDate: null,
            thanClickItem: null,
            msg: null,
            msgFlag: false,

            invoiceFlag: true,

            mine: false,
            btnColor: '#546E7A',

            showSales: false,
            clear: false,
            search: '',
            totalDesserts: 0,
            options: {},

            dialog: false,
            dialogDelete: false,
            headers: [
                {text: '项目地址', value: 'projectBase', sortable: false, width: "110px"},
                {
                    text: '合同编号',
                    width: '100px',
                    align: 'start',
                    sortable: false,
                    value: 'agreementID',
                },
                {text: '合同名称', value: 'agreementName', sortable: false, width: '100px'},
                {text: '合同金额(￥)', value: 'agreementMoney', sortable: false},
                {text: '签订日期', value: 'signDate', dateType: 'Date', sortable: false},
                {text: '单位名称', value: 'companyName', sortable: false, width: '100px'},
                {text: '质保到期', value: 'pDate', sortable: false},
                {text: '实际完工', value: 'actualDate', sortable: false},
                {text: '备注', value: 'remark', sortable: false},
                {text: '开票进度', value: 'invoicePercent', sortable: false, width: '80px'},
                {text: '收款进度', value: 'collectPercent', sortable: false, width: '80px'},
                {text: '登记人', value: 'registrant', sortable: false},
                {text: '已开票金额(￥)', value: 'invoicedMoney', sortable: false},
                {text: '已收款金额(￥)', value: 'collectedMoney', sortable: false},
                {text: '操作', value: 'actions', sortable: false, width: '150px'},
            ],
            desserts: [],
            editedIndex: -1,
            editedItem: {
                city: {
                    name: null,
                    coding: null,
                    id: null,
                    remark: null
                },
                // invoiceCompany:'卓茂',
                contractId: null,
                id: null,
                agreementID: '',
                agreementName: '',
                agreementMoney: '',
                signDate: '',
                companyName: '',
                bankName: '',
                bankAccount: '',
                companyAddress: '',
                contactMan: '',
                phone: '',
                jurisdiction: '',
                street: '',
                remark: '',
                invoicePercent: '',
                collectPercent: '',
                registrant: '',
                invoicedMoney: '',
                collectedMoney: '',
                paymentDays: '',
                projectBase: '',
                pDate: '',
                actualDate: '',
                retentionMoney: null,
                retentionPercent: null,
                tax: null,
                taxID: null,
                performanceBond: null,
                performanceBondPercent: null,
                finalAccounts: null,
                files: [],
                notifyType: 1,
                lng:0,
                lat:0
            },
            defaultItem: {
                city: {
                    name: null,
                    coding: null,
                    id: null,
                    remark: null
                },
                // invoiceCompany:'卓茂',
                contractId: null,
                id: null,
                agreementID: '',
                agreementName: '',
                agreementMoney: '',
                signDate: '',
                companyName: '',
                bankName: '',
                bankAccount: '',
                companyAddress: '',
                contactMan: '',
                phone: '',
                jurisdiction: '',
                street: '',
                remark: '',
                invoicePercent: '',
                collectPercent: '',
                registrant: '',
                invoicedMoney: '',
                collectedMoney: '',
                paymentDays: '',
                projectBase: '',
                pDate: '',
                actualDate: '',
                retentionMoney: null,
                retentionPercent: null,
                tax: null,
                taxID: null,
                performanceBond: null,
                performanceBondPercent: null,
                finalAccounts: null,
                files: [],
                notifyType: 1,
                lng:0,
                lat:0
            },

            SalesFiles: {
                fileName: null,
                fileUrl: null,
                mark: null,
            },

            rules: {
                agreementIDRules: [
                    v => !!v || '必填字段！', v => (!!v && v.length < 40) || "合同编号过长，不能超过40个字符"
                ],
                agreementNameRules: [
                    v => !!v || '必填字段！', v => (!!v && v.length < 100) || "合同名称过长，不能超过100个字符"
                ],
                agreementMoneyRules: [
                    v => !!v || '必填字段！'
                ],
                signDateRules: [
                    v => !!v || '必填字段！'
                ],
                companyNameRules: [
                    v => !!v || '必填字段！', v => (!!v && v.length < 50) || "名称过长，不能超过50个字符"
                ],
                phoneRules: [
                    v => {
                        // const pattern = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
                        return !!v || '请输入正确的手机号'
                    }

                ],
                paymentDaysRules: [
                    v => !!v || '必填字段！'
                ],
                projectBaseRules: [
                    v => !!v || '必填字段！', v => (!!v && v.length < 50) || "字段过长，不能超过50个字符"
                ],
                taxIDRule: [
                    v => !!v || '必填字段！', v => (!!v && v.length) < 21 || "不超过20个字符"
                ],
                contactManRule: [
                    v => (v == '' || (!!v && v.length) < 21) || "不超过20个字符"
                ],

                percentForAMRules: [
                    v => v > 0 || '请输入正确的数值', v => v <= 100 || '请输入正确的数值'
                ],

                taxExtraRules: [
                    v => v > 0 || '请输入正确的数值', v => v <= 100 || '请输入正确的数值'
                ],
                invoicePercentRules: [
                    v => v > 0 || '请输入正确的数值', v => v <= 100 || '请输入正确的数值'
                ],
                tradeAcceptanceDateRule: [
                    v => !!v || '必填字段！'
                ],
                tradeAcceptanceInterestRule: [
                    v => (v >= 0 || v == '' || v == null) || '请输入正确的数值'
                ],
                factoringDateRule: [
                    v => !!v || '必填字段！'
                ],
                fixedAssetsRule: [
                    v => !!v || '必填字段！', v => (!!v && v.length < 200) || "字段过长，不能超过200个字符"
                ],

                operatorNameRule: [
                    v => !!v || '必填字段！', v => (!!v && v.length < 11) || "不超过10个字符"
                ],
                operatorIDNumber: [
                    v => {
                        const pattern = /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
                        return (pattern.test(v) || !!v) || '请输入正确的身份证号'
                    }
                ],
                streetRule: [
                    v => !!v || '必填字段！', v => (!!v && v.length < 21) || "不超过20个字符"
                ],
                invoiceContentRule: [
                    v => !!v || '必填字段！', v => (!!v && v.length < 201) || "不超过200个字符"
                ]
            },

            showSalesFiles: false,
            salesFilesDesserts: [],
            salesFilesHeader: [
                {text: '文件名', align: 'start', sortable: false, value: 'fileName'},
                {text: '下载', value: 'download', sortable: false},
                {text: '删除', value: 'delete', sortable: false}

            ],

            invoice: false,
            invoiceDialog: false,
            invoiceDelete: false,
            invoiceHeaders: [
                {
                    text: '开票编号',
                    align: 'start',
                    sortable: false,
                    value: 'invoiceID',
                },
                // {text: '合同编号', value: 'agreementID'},
                {text: '开票金额(￥)', value: 'invoiceMoney'},
                {text: '百分比(%)', value: 'percent'},
                {text: '备注', value: 'remark'},
                {text: '开票日期', value: 'createTime'},
                {text: '登记人', value: 'registrant'},
                {text: '操作', value: 'invoiceActions', sortable: false},
            ],
            invoiceDesserts: [],
            invoiceEditedIndex: -1,
            provinceTemp: '',
            cityTemp: '',
            districtTemp: '',
            invoiceEditedItem: {
                companyName: '',//甲方
                bankAccount: '',
                companyAddress: '',
                taxID: '',
                phone: '',
                invoiceCompany: '卓茂',
                collectedMoney: '',
                province: '',//省
                city: '',//市
                district: '',//区
                street: '',//街道
                operatorName: '',//跨区涉税经办人
                operatorPhone: '',
                operatorIDNumber: '',
                invoiceContent: '',//开票内容
                partyANeeds: '',//甲方需求
                ID: '',
                invoiceID: '',
                agreementName: '',
                agreementID: '',
                agreementMoney: '',
                invoiceMoney: '',
                percent: '',
                remark: '',
                createTime: '',
                registrant: '',
                invoicedMoney: '',
                paymentDays: '',
                pMark: '',
                returnDate: '',
                status: '',
                tax: '',
                invoiceFiles: [],
            },
            invoiceDefaultItem: {
                companyName: '',//甲方
                bankAccount: '',
                companyAddress: '',
                taxID: '',
                phone: '',
                invoiceCompany: '卓茂',
                collectedMoney: '',
                province: '',//省
                city: '',//市
                district: '',//区
                street: '',//街道
                operatorName: '',//跨区涉税经办人
                operatorPhone: '',
                operatorIDNumber: '',
                invoiceContent: '',//开票内容
                partyANeeds: '',//甲方需求
                ID: '',
                invoiceID: '',
                agreementName: '',
                agreementID: '',
                agreementMoney: '',
                invoiceMoney: '',
                percent: '',
                remark: '',
                createTime: '',
                registrant: '',
                invoicedMoney: '',
                paymentDays: '',
                pMark: '',
                returnDate: '',
                status: '',
                tax: '',
                invoiceFiles: [],
            },
            invoiceEditedItemTemp: null,
            invoiceFileItem: {
                name: null,
                url: null,
                mark: null,
            },
            invoiceTaxItems: ['默认'],
            dialogInvoiceLogs: false,
            invoiceLogsItems: [],
            invoiceTipMSG: null,
            totalInvoicePercentForTax: null,
            invoiceMaxPercent: null,
            InvoiceDefaultTaxTotalPercent: null,

            collect: false,
            collectDialog: false,
            collectDialogDelete: false,
            collectHeaders: [
                {
                    text: '收款编号',
                    align: 'start',
                    sortable: false,
                    value: 'collectID',
                },
                // {text: '合同编号', value: 'agreementID'},
                {text: '收款金额(￥)', value: 'collectMoney'},
                {text: '百分比(%)', value: 'percent'},
                {text: '备注', value: 'remark'},
                {text: '预收款日期', value: 'pDate'},
                // {text: '收款日期', value: 'createTime'},
                {text: '登记人', value: 'registrant'},
                {text: '收款状态', value: 'status', sortable: false},
                {text: '操作', value: 'collectActions', sortable: false, width: '13%'},
            ],
            collectDesserts: [],
            collectEditedIndex: -1,
            collectEditedItem: {
                ID: '',
                collectID: '',
                agreementName: '',
                agreementID: '',
                agreementMoney: '',
                collectMoney: '',
                percent: '',
                remark: '',
                createTime: '',
                registrant: '',
                collectedMoney: '',
                pDate: '',
                status: '',
                collectType: null,
                tradeAcceptanceDate: null,
                tradeAcceptanceInterest: null,
                factoringDate: null,
                fixedAssets: null,
                fixedAssetsStatus: null,
            },
            collectDefaultItem: {
                ID: '',
                collectID: '',
                agreementName: '',
                agreementID: '',
                agreementMoney: '',
                collectMoney: '',
                percent: '',
                remark: '',
                createTime: '',
                registrant: '',
                collectedMoney: '',
                pDate: '',
                status: '',
                collectType: null,
                tradeAcceptanceDate: null,
                tradeAcceptanceInterest: null,
                factoringDate: null,
                fixedAssets: null,
                fixedAssetsStatus: null,
            },

            //收款日志
            dialogCollectLogs: false,
            collectLogsItems: [],

            //编辑收款类型
            dialogCollectType: false,
            dialogCollectTypeItem: null,
            collectType: null,
            tradeAcceptanceDate: null,
            tradeAcceptanceInterest: null,
            factoringDate: null,
            fixedAssets: null,
            fixedAssetsStatus: null,

            //查看收款类型
            loadDialog: false,
            fixedAssetsStatusTemp: null,
            dialogShowCollectType: false,
            dialogShowCollectTypeItem: {
                ID: null,
                collectID: null,
                agreementName: null,
                agreementID: null,
                agreementMoney: null,
                collectMoney: null,
                percent: null,
                remark: null,
                createTime: null,
                registrant: null,
                collectedMoney: null,
                pDate: null,
                status: null,
                collectType: null,
                tradeAcceptanceDate: null,
                tradeAcceptanceInterest: null,
                factoringDate: null,
                fixedAssets: null,
                fixedAssetsStatus: null,
                temptradeDate: null,
                tempFactoringDate: null,
            },

            monthData: {
                dateSearch: '',
                monthTotalMoney: '',
                monthTotalInvoiced: '',
                monthTotalCollected: '',
            },

            menu: false,
            menu2: false,
            menu3: false,
            menu4: false,
            menu5: false,
            menu6: false,
            menu7: false,
            menu8: false,
            menu9: false,
            paymentItems: [30, 60, '其他'],
            searchCompany: null,
            companyNameItems: [],
            companyItems: [],
            companyMSG: {
                companyName: null,
                companyAddress: null,
                bankName: null,
                bankAccount: null,
                phone: null,
                jurisdiction: null,
                street: null,
            },

            labelMonthTotalCollected: null,
            labelMonthTotalInvoiced: null,
            labelMonthTotalMoney: null,

            projectFlag: true,
            notifyTypes: [
                {name: '每天推送', id: 1},
                {name: '每周推送', id: 2},
                {name: '每月推送', id: 3},
                {name: '季度推送', id: 4},
                {name: '半年推送一次', id: 5},
                {name: '一年推送一次', id: 6},
            ],

            //税率类型
            dialogAddTax: false,
            taxHeader: [
                {text: '占比', value: 'percentForAM'},
                {text: '税率', value: 'taxExtra'},
                {text: '操作', value: 'taxActions'},
            ],
            taxDesserts: [],
            taxEditedItem: {
                percentForAM: '',
                taxExtra: '',
            },
            taxDefaultItem: {
                percentForAM: '',
                taxExtra: '',
            },
            taxEditedIndex: -1,
            taxDialog: false,
            taxDelete: false,
            taxExtraItems: [],

            //指定项目经理
            dialogManager: false,
            managerAddDialog: false,
            managerHeaders: [
                {text: '姓名', value: 'managerName'},
                {text: '部门', value: 'sectionName'},
                {text: '操作', value: 'managerActions'},
            ],
            managerDesserts: [],
            managerItems: [],
            sectionItem: null,
            staffItems: [],
            staffItem: null,
            sectionItems: [],
            staffSearchItems: [],
            staffSearchItem: null,
            searchName: null,
            SalesContractManager: null,
            managerDialogDelete: false,
            managerEditedIndex: -1,

            //修改收款
            dialogChangeCollect: false,
            changeCollectPercent: null,
            changeCollectMoney: null,
            collectMoneyChangeItem: null,
            changeCollectPercentOld: null,
            changeCollectMoneyOld: null,

            //消息框
            showSnackbarDialog: false,
            msgStr: null,
            timeout: 2000,
            startFlow: true,

            //百度地图
            mapDialog: false,
            ak: 'KjCrqv3vWmMi8jYnPDELjg6cVGmsqTzb',
            zoom: 0,
            center: {
                lng: 120,
                lat: 32
            },
            map: null,
            BMap: null,
            BlocalSearch: null,
            placeStr: '',
            keyword: '',
            searchLoading:false
        }),

        computed: {
            formTitle() {
                return this.editedIndex === -1 ? '新增工程合同登记' : '编辑'
            },
            isEdited() {
                return this.editedIndex === -1 ? false : true
            },

            formInvoiceTitle() {
                return this.invoiceEditedIndex === -1 ? '新增开票登记' : '编辑'
            },

            formCollectTitle() {
                return this.collectEditedIndex === -1 ? '新增收款登记' : '编辑'
            },
            retentionPercent() {
                return this.editedItem.retentionPercent;
            },

            paymentDays() {
                return this.editedItem.paymentDays;
            },
        },

        watch: {
            dialog(val) {
                val || this.close()
            },
            dialogDelete(val) {
                val || this.closeDelete()
            },
            invoiceDialog(val) {
                val || this.closeInvoice()
            },
            invoiceDialogDelete(val) {
                val || this.invoiceCloseDelete()
            },
            collectDialog(val) {
                val || this.closeCollect()
            },
            collectDialogDelete(val) {
                val || this.collectCloseDelete()
            },
            dialogCollectType(val) {
                val || this.closeCollectType()
            },
            dialogShowCollectType(val) {
                val || this.closeDialogShowCollectType()
            },
            searchCompany() {
                this.companySearch()
            },
            options: {
                handler() {
                    if (this.btnColor === '#546E7A' && this.monthData.dateSearch == '' && this.search == '') {
                        this.loadSalesContract()
                    } else if (this.monthData.dateSearch != '' && this.search == '') {
                        this.loadMonthSalesContract()
                    } else if (this.btnColor === '#43A047' && this.monthData.dateSearch == '' && this.search == '') {
                        this.getMySalesContracts()
                    } else if (this.search != '') {
                        this.searchContract()
                    }

                },
                deep: true,
            },
            retentionPercent: {
                handler() {
                    if (this.editedItem.retentionPercent == null || this.editedItem.retentionPercent == '') {
                        this.editedItem.retentionPercent = 0;
                    }
                    this.editedItem.retentionMoney = this.formatNum(this.editedItem.retentionPercent / 100 * this.editedItem.agreementMoney);
                },
                immediate: true,
            },

            paymentDays: {
                handler() {
                    if (this.editedItem.paymentDays == '其他') {
                        this.editedItem.paymentDays = null;
                        this.paymentItems = [30, 60]
                    }
                },
                deep: true,
            },

            sectionItem: {
                handler() {
                    this.staffItems = []
                    this.getStaffListBySection()
                },
                deep: true,
            },

            searchName: {
                handler() {
                    this.staffSearchItems = []
                    this.searchManager()
                },
                deep: true,
            },

            'invoiceEditedItem.tax': {
                handler() {
                    if (this.invoiceEditedItem.tax != null && this.invoiceEditedItem.tax != '' && this.invoiceEditedItem.tax != '默认') {
                        let percent = this.invoiceEditedItem.tax.split('/')[0]
                        let taxCompare = this.invoiceEditedItem.tax.split('/')[1]
                        this.getInvoicedTotalPercentByTax(this.invoiceEditedItem.tax, this.invoiceEditedItem.agreementID, percent, taxCompare)
                    } else if (this.invoiceEditedItem.tax == "默认") {
                        this.getInvoicedTotalPercentByTax(null, this.invoiceEditedItem.agreementID, this.InvoiceDefaultTaxTotalPercent, null)
                    }
                },
                deep: true,
            },

            'invoiceEditedItem.percent': {
                handler() {
                    if (this.invoiceEditedItem.percent != null && this.invoiceEditedItem.percent != '') {
                        if (this.invoiceEditedItem.percent > this.invoiceMaxPercent) {
                            this.invoiceEditedItem.percent = this.invoiceMaxPercent
                        }
                    }
                },
                deep: true,
            },
            searchPlace: {
                handler() {
                    if (this.searchPlace != null) {
                        this.searchCity(this.searchPlace)
                    }
                },
                deep: true,
            },

        },

        created() {
            getConfig("BAIDU_WEB_AK").then(result => {
                if (result && result.value) {
                    this.ak = result.value
                } else {
                    this.message("请配置百度地图BAIDU_AK参数")
                }
            })
            getConfig("INVOICE").then(result => {
                if (result) {
                    this.invoiceCompanyItems = result.value.split(";")
                }
            })

            this.searchCityInit("南通")
            this.$watch(
                () => this.$route.params,
                () => {
                    if (this.$route.query != null && this.$route.query.projectBase != null) {
                        this.editedItem.projectBase = this.$route.query.projectBase
                        this.editedItem.agreementName = this.$route.query.agreementName
                        this.editedItem.agreementMoney = this.$route.query.agreementMoney
                        this.editedItem.companyName = this.$route.query.companyName
                        this.editedItem.companyAddress = this.$route.query.companyAddress
                        this.editedItem.bankName = this.$route.query.bankName
                        this.editedItem.bankAccount = this.$route.query.bankAccount
                        this.editedItem.remark = this.$route.query.remark
                        this.dialog = true
                    }
                },
                // 组件创建完后获取数据，
                // 此时 data 已经被 observed 了
                {immediate: true}
            )
        },

        filters: {
            formatTimer: function (value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                // let h = date.getHours();
                // h = h < 10 ? "0" + h : h;
                // let m = date.getMinutes();
                // m = m < 10 ? "0" + m : m;
                // let s = date.getSeconds();
                // s = s < 10 ? "0" + s : s;
                return y + "-" + MM + "-" + d;
            },
            formatNum: function (value) {
                if (value == null) {
                    return null;
                }
                let tempVal = parseFloat(value).toFixed(3)
                let realVal = tempVal.substring(0, tempVal.length - 1)
                return realVal
            }
        },

        methods: {
            //开票附件
            fileUploadInvoice(res) {
                for (let x = 0; x < res.files.length; x++) {
                    this.invoiceFileItem.url = res.files[x].ftpPath;
                    this.invoiceFileItem.name = res.files[x].fileName;
                    this.invoiceFileItem.mark = this.editedItem.contractId;
                    this.invoiceEditedItem.invoiceFiles.push(this.invoiceFileItem);
                    this.invoiceFileItem = {name: null, url: null, mark: null}
                }
            },
            //地区
            searchCity(str) {
                loadRegion(str).then(res => {
                    console.log('region', res)
                    if (res.length == 0) {
                        this.editedItem.city.name = this.searchPlace
                        this.editedItem.city.id = null
                    }
                    this.placeItems = res
                })
            },
            searchCityInit(str) {
                loadRegion(str).then(res => {
                    if (res.length > 0) {
                        this.editedItem.city = res[0]
                        this.placeItems = res
                    }
                })
            },
            updateNotify() {
                salesContractApi.updateNotify()
            },
            updateDate() {
                if (this.thanClickItem) {
                    this.thanClickItem.pDate = this.pDate
                    salesContractApi.updateDate(this.thanClickItem).catch(e => {
                        this.msg = e
                        this.msgFlag = true
                    })
                }
            },
            showMenu(e, item) {
                this.thanClickItem = item
                e.preventDefault()
                this.dateMenu = false
                this.x = e.clientX
                this.y = e.clientY
                this.$nextTick(() => {
                    this.pDate = item.pDate
                    this.dateMenu = true
                })
            },

            formatTimer(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                // let h = date.getHours();
                // h = h < 10 ? "0" + h : h;
                // let m = date.getMinutes();
                // m = m < 10 ? "0" + m : m;
                // let s = date.getSeconds();
                // s = s < 10 ? "0" + s : s;
                return y + "-" + MM + "-" + d;
            },

            formatTimer2(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                let h = date.getHours();
                h = h < 10 ? "0" + h : h;
                let m = date.getMinutes();
                m = m < 10 ? "0" + m : m;
                let s = date.getSeconds();
                s = s < 10 ? "0" + s : s;
                return y + "-" + MM + "-" + d + " " + h + ":" + m + ":" + s;
            },

            formatYearMonth(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                return y + "-" + MM;
            },

            formatNowTime(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                // let h = date.getHours();
                // h = h < 10 ? "0" + h : h;
                // let m = date.getMinutes();
                // m = m < 10 ? "0" + m : m;
                // let s = date.getSeconds();
                // s = s < 10 ? "0" + s : s;
                return y + "." + MM + "." + d + "#";
            },

            formatNum(value) {
                if (value == null) {
                    return 0.00;
                }
                let tempVal = parseFloat(value).toFixed(3)
                let realVal = tempVal.substring(0, tempVal.length - 1)
                return realVal
            },

            searchContract() {
                salesContractApi.getSearchContract({search: this.search}).then(result => {
                    for (let x = 0; x < result.rows.length; x++) {
                        try {
                            var item = result.rows[x]

                            if (item.pDate != null) {
                                result.rows[x].pDate = this.formatTimer(item.pDate);
                            }
                            if (item.actualDate != null) {
                                result.rows[x].actualDate = this.formatTimer(item.actualDate);
                            }

                            result.rows[x].contractInvoiceP = this.formatNum(item.invoicedMoney * 100 / item.agreementMoney);
                            var tempI = result.rows[x].contractInvoiceP;
                            if (tempI == 0 || (tempI > 0 && tempI < 25)) {
                                result.rows[x].percentColorI = 'red';
                            } else if (tempI == 25 || (tempI > 25 && tempI < 50)) {
                                result.rows[x].percentColorI = 'yellow';
                            } else if (tempI == 50 || (tempI > 50 && tempI < 75)) {
                                result.rows[x].percentColorI = 'blue';
                            } else {
                                result.rows[x].percentColorI = 'green';
                            }

                            result.rows[x].contractCollectP = this.formatNum(item.collectedMoney * 100 / item.agreementMoney);
                            var tempC = result.rows[x].contractCollectP;
                            if (tempC == 0 || (tempC > 0 && tempC < 25)) {
                                result.rows[x].percentColorC = 'red';
                            } else if (tempC == 25 || (tempC > 25 && tempC < 50)) {
                                result.rows[x].percentColorC = 'yellow';
                            } else if (tempC == 50 || (tempC > 50 && tempC < 75)) {
                                result.rows[x].percentColorC = 'blue';
                            } else {
                                result.rows[x].percentColorC = 'green';
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }

                    this.defaultItem.signDate = this.formatTimer(new Date());
                    this.desserts = result.rows;
                    this.totalDesserts = result.totalDesserts;
                }).catch(e => {
                    console.log("异常信息", e);
                });
            },
            //工程合同登记
            loadSalesContract() {

                salesContractApi.getSalesContract(this.options).then(result => {
                    for (let x = 0; x < result.rows.length; x++) {
                        try {
                            var item = result.rows[x]

                            if (item.retentionPercent == null || item.retentionPercent == '') {
                                result.rows[x].retentionPercent = 0;
                            }
                            if (item.retentionMoney == null || item.retentionMoney == '') {
                                result.rows[x].retentionMoney = 0;
                            }

                            if (item.pDate != null) {
                                result.rows[x].pDate = this.formatTimer(item.pDate);
                            }
                            if (item.actualDate != null) {
                                result.rows[x].actualDate = this.formatTimer(item.actualDate);
                            }

                            result.rows[x].contractInvoiceP = Math.floor(item.invoicedMoney * 100 / item.agreementMoney);
                            var tempI = result.rows[x].contractInvoiceP;
                            if (tempI == 0 || (tempI > 0 && tempI < 25)) {
                                result.rows[x].percentColorI = 'red';
                            } else if (tempI == 25 || (tempI > 25 && tempI < 50)) {
                                result.rows[x].percentColorI = 'yellow';
                            } else if (tempI == 50 || (tempI > 50 && tempI < 75)) {
                                result.rows[x].percentColorI = 'blue';
                            } else {
                                result.rows[x].percentColorI = 'green';
                            }

                            result.rows[x].contractCollectP = Math.floor(item.collectedMoney * 100 / item.agreementMoney);
                            var tempC = result.rows[x].contractCollectP;
                            if (tempC == 0 || (tempC > 0 && tempC < 25)) {
                                result.rows[x].percentColorC = 'red';
                            } else if (tempC == 25 || (tempC > 25 && tempC < 50)) {
                                result.rows[x].percentColorC = 'yellow';
                            } else if (tempC == 50 || (tempC > 50 && tempC < 75)) {
                                result.rows[x].percentColorC = 'blue';
                            } else {
                                result.rows[x].percentColorC = 'green';
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }

                    this.defaultItem.signDate = this.formatTimer(new Date());
                    this.desserts = result.rows;
                    this.totalDesserts = result.totalDesserts;

                }).catch(e => {
                    console.log("异常信息", e);
                });
                var dateYM = this.formatYearMonth(new Date())
                var MM = dateYM.substr(5, 2)
                this.labelMonthTotalCollected = MM + '月已收款总金额'
                this.labelMonthTotalInvoiced = MM + '月已开票总金额'
                this.labelMonthTotalMoney = MM + '月合同总金额'
                salesContractApi.getMonthSalesContractMSG({dateSearch: dateYM}).then(result => {
                    this.monthData.monthTotalMoney = this.formatNum(result.monthTotalMoney);
                    this.monthData.monthTotalInvoiced = this.formatNum(result.monthTotalInvoiced);
                    this.monthData.monthTotalCollected = this.formatNum(result.monthTotalCollected);
                })
            },

            editItem(item) {
                this.clear = true
                this.showSales = true
                this.editedIndex = this.desserts.indexOf(item)
                item.files = []
                this.editedItem = Object.assign({}, item)
                this.editedItem.signDate = this.formatTimer(item.signDate)
                this.dialog = true
                this.paymentItems = [30, 60, "其他"]
                this.showTax(item)
                this.showManager(item)

            },

            deleteItem(item) {
                this.editedIndex = this.desserts.indexOf(item)
                this.editedItem = Object.assign({}, item)
                this.dialogDelete = true
            },

            deleteItemConfirm() {
                // this.desserts.splice(this.editedIndex, 1)
                salesContractApi.deleteSalesContract(this.editedItem).then(result => {
                    if (result != null) {
                        this.msgStr = '删除成功'
                        this.showSnackbarDialog = true
                        this.loadSalesContract()
                    }
                }).catch(e => {
                    this.msgStr = e
                    this.showSnackbarDialog = true
                });
                this.closeDelete()
            },

            close() {
                this.dialog = false
                this.$nextTick(() => {
                    this.editedItem = Object.assign({}, this.defaultItem)
                    this.editedIndex = -1
                    this.clear = false
                    this.showSales = false
                    this.reset()
                })
            },

            closeDelete() {
                this.dialogDelete = false
                this.$nextTick(() => {
                    this.editedItem = Object.assign({}, this.defaultItem)
                    this.editedIndex = -1
                })
            },
            saveProject(saleContract) {
                let project = {
                    name: saleContract.agreementName,
                    money: saleContract.agreementMoney,
                    city: saleContract.city,
                    oConstruction: {name: saleContract.companyName, id: -1},
                    staff: this.$store.state.user,
                    oOwner: {name: saleContract.companyName, id: -1},
                    folder: {name: '智能化', id: '10$KFVJG'},
                    paDate: this.dateFormat(new Date(), 'YYYY-mm-dd'),
                    managerName: this.$store.state.user.name,
                    explain: '',
                    remark: saleContract.remark || '',
                    add: saleContract.projectBase || ''
                }
                insertProject(project).then(result2 => {
                    if (result2.id != null) {
                        //保存成功，发起流程
                        this.$refs['flow'].startFlow({
                            title: result2.name + "项目立项",
                            content: '',
                            frameId: result2.id,
                            frameCoding: 102012,
                            frameColumn: 'pa00101'
                        }).then()
                    }
                })
            },
            saveData() {
                this.startFlow = false
                this.save()
            },
            save() {
                if (this.$refs['editedItem'].validate()) {
                    if (this.editedIndex > -1) {
                        this.loadDialog = true
                        salesContractApi.updateSalesContract(this.editedItem).then(result => {
                            if (result != null) {
                                if (this.taxExtraItems.length > 0) {
                                    for (let a = 0; a < this.taxExtraItems.length; a++) {
                                        if (this.taxDesserts.indexOf(this.taxExtraItems[a]) == -1) {
                                            salesContractApi.deleteTax(this.taxExtraItems[a])
                                            this.taxExtraItems.splice(a, 1)
                                            a = a - 1
                                        }
                                    }
                                }

                                for (let b = 0; b < this.taxDesserts.length; b++) {
                                    if (this.taxExtraItems.indexOf(this.taxDesserts[b]) == -1) {
                                        this.taxDesserts[b].agreementID = this.editedItem.contractId
                                        salesContractApi.insertTax(this.taxDesserts[b])
                                    }
                                }

                                if (this.managerItems.length > 0) {
                                    for (let c = 0; c < this.managerItems.length; c++) {
                                        if (this.managerDesserts.indexOf(this.managerItems[c]) == -1) {
                                            salesContractApi.deleteManager(this.managerItems[c])
                                            this.managerItems.splice(c, 1)
                                            c = c - 1
                                        }
                                    }
                                }

                                for (let d = 0; d < this.managerDesserts.length; d++) {
                                    if (this.managerItems.indexOf(this.managerDesserts[d]) == -1) {
                                        this.managerDesserts[d].agreementID = this.editedItem.contractId
                                        salesContractApi.insertManager(this.managerDesserts[d])
                                    }
                                }
                                if (this.startFlow) {
                                    this.$refs['salesFlow'].startFlow({
                                        title: this.editedItem.agreementName + "工程合同",
                                        content: '',
                                        frameId: this.editedItem.contractId,
                                        frameCoding: 132027,
                                        frameColumn: 'contract_id'
                                    }).then(() => {
                                        this.loadSalesContract()
                                        this.close()
                                        this.reset()
                                    })
                                } else {
                                    this.loadSalesContract()
                                    this.close()
                                    this.reset()
                                }


                            }
                            this.loadDialog = false
                        });
                    } else {
                        if (this.editedItem.agreementID == null || this.editedItem.agreementID == '' || this.editedItem.agreementName == '' || this.editedItem.signDate == '' || this.editedItem.companyName == '' || this.editedItem.agreementMoney == '' || this.editedItem.paymentDays == '' || this.editedItem.projectBase == '') {
                            alert("请完成必填项！！")
                            return false;
                        } else {
                            // salesContractApi.getSalesContractIsExist({agreementID: this.editedItem.agreementID}).then(result => {
                            //
                            //     if (result.result == "已存在") {
                            //         alert("合同编号已存在！")
                            //         return false;
                            //     } else {
                            this.loadDialog = true
                            salesContractApi.insertSalesContract(this.editedItem).then(result => {
                                if (result != null) {

                                    if (this.taxDesserts != null) {
                                        for (let c = 0; c < this.taxDesserts.length; c++) {
                                            this.taxDesserts[c].agreementID = result.contractId
                                            salesContractApi.insertTax(this.taxDesserts[c])
                                        }
                                    }

                                    if (this.managerDesserts != null) {
                                        for (let d = 0; d < this.managerDesserts.length; d++) {
                                            this.managerDesserts[d].agreementID = result.contractId
                                            salesContractApi.insertManager(this.managerDesserts[d])
                                        }
                                    }
                                    this.loadSalesContract()
                                    this.close()
                                    this.reset()
                                    if (this.projectFlag) {
                                        this.saveProject(result)
                                    }
                                    this.$refs['salesFlow'].startFlow({
                                        title: result.agreementName + "工程合同",
                                        content: '',
                                        frameId: result.contractId,
                                        frameCoding: 132027,
                                        frameColumn: 'contract_id'
                                    }).then()
                                }
                                this.loadDialog = false
                            });
                            // }
                            // })
                        }
                    }
                }
            },
            performanceBondChanged() {
                this.editedItem.performanceBondPercent = this.formatNum(this.editedItem.performanceBond / this.editedItem.agreementMoney * 100);
                this.$forceUpdate()
            },
            performanceBondPercentChanged() {
                this.editedItem.performanceBond = this.formatNum(this.editedItem.performanceBondPercent / 100 * this.editedItem.agreementMoney);
                this.$forceUpdate()
            },

            //开票
            loadInvoiceMSG(item) {
                //agreementID => contractId
                salesContractApi.getInvoice({agreementID: item.agreementID}).then(result => {
                    for (let x = 0; x < result.rows.length; x++) {
                        try {
                            result.rows[x].isShow = false;
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    this.invoiceDesserts = result.rows;
                    console.log(this.invoiceDesserts)

                }).catch(e => {
                    console.log("异常信息", e);
                });
            },

            invoiceAction(item) {
                if (item.city != null && item.city.name != '南通') {
                    this.dialogNotNT = true
                } else {
                    this.dialogNotNT = false
                }

                this.dialogTax3 = false
                this.dialogTax6 = false
                this.dialogTax9 = false
                this.dialogTax13 = false
                this.invoiceLabel = '备注'

                this.invoiceTaxItems = ['默认']
                this.invoiceLogsItems = []
                this.InvoiceDefaultTaxTotalPercent = null
                this.invoiceEditedItem.collectedMoney = item.collectedMoney;
                this.invoiceEditedItem.agreementName = item.agreementName;
                //agreementID => contractId
                this.invoiceEditedItem.agreementID = item.contractId;
                this.invoiceEditedItem.agreementMoney = item.agreementMoney;
                this.invoiceEditedItem.invoicedMoney = item.invoicedMoney;
                this.invoiceEditedItem.paymentDays = item.paymentDays;
                var date = new Date();
                this.invoiceEditedItem.invoiceID = this.formatNowTime(date);
                this.invoiceEditedItem.createTime = this.formatTimer(date);
                this.invoiceEditedItem.phone = item.phone
                this.invoiceEditedItem.companyName = item.companyName
                this.invoiceEditedItem.companyAddress = item.companyName
                this.invoiceEditedItem.taxID = item.taxID
                this.invoiceEditedItem.bankAccount = item.bankAccount


                this.invoiceDefaultItem.collectedMoney = item.collectedMoney;
                this.invoiceDefaultItem.agreementName = item.agreementName;
                //agreementID => contractId
                this.invoiceDefaultItem.agreementID = item.contractId;
                this.invoiceDefaultItem.agreementMoney = item.agreementMoney;
                this.invoiceDefaultItem.invoicedMoney = item.invoicedMoney;
                this.invoiceDefaultItem.paymentDays = item.paymentDays;
                this.invoiceDefaultItem.invoicedPercent = item.contractInvoiceP;
                var date1 = new Date();
                this.invoiceDefaultItem.invoiceID = this.formatNowTime(date1)
                this.invoiceDefaultItem.createTime = this.formatTimer(date1);
                this.invoiceDefaultItem.phone = item.phone
                this.invoiceDefaultItem.companyName = item.companyName
                this.invoiceDefaultItem.companyAddress = item.companyName
                this.invoiceDefaultItem.taxID = item.taxID
                this.invoiceDefaultItem.bankAccount = item.bankAccount
                this.invoice = true;

                if (item.taxList != null) {
                    let tempP = 0
                    for (let a = 0; a < item.taxList.length; a++) {
                        this.invoiceTaxItems.push(item.taxList[a].percentForAM + '/' + item.taxList[a].taxExtra)
                        tempP += (item.taxList[a].percentForAM - 0)
                    }
                    this.InvoiceDefaultTaxTotalPercent = 100 - tempP
                }

                this.loadInvoiceLogs(this.invoiceEditedItem)
                this.loadInvoiceMSG(this.invoiceEditedItem);

            },

            invoiceDeleteItem(item) {
                this.invoiceEditedIndex = this.invoiceDesserts.indexOf(item)
                this.invoiceEditedItemTemp = Object.assign({}, item)
                this.invoiceDelete = true
            },

            invoiceDeleteItemConfirm() {
                this.invoiceLogsItems = []
                console.log(this.invoiceEditedItem)
                salesContractApi.deleteInvoice(this.invoiceEditedItemTemp).then(result => {
                    if (result != null) {
                        this.loadInvoiceMSG(this.invoiceEditedItem);
                        this.loadSalesContract();
                        this.invoiceCloseDelete();
                        this.loadInvoiceLogs(this.invoiceEditedItem)
                    }
                }).catch(e => {
                    console.log(e)
                    this.loadInvoiceMSG(this.invoiceEditedItem);
                    this.loadSalesContract();
                    this.invoiceCloseDelete();
                    this.loadInvoiceLogs(this.invoiceEditedItem)
                });
            },

            closeInvoice() {
                this.invoiceDialog = false;
                this.$nextTick(() => {
                    this.invoiceEditedItem = Object.assign({}, this.invoiceDefaultItem)
                    this.invoiceEditedIndex = -1
                })
            },

            invoiceCloseDelete() {
                this.invoiceDelete = false
                this.$nextTick(() => {
                    this.invoiceEditedItem = Object.assign({}, this.invoiceDefaultItem)
                    this.invoiceEditedIndex = -1
                })
            },

            distpickerChanged(data) {
                console.log('distpickerData', data.province.value + data.city.value + data.area.value)
                console.log('distpicker:' + this.provinceTemp + this.cityTemp)
                this.invoiceEditedItem.province = data.province.value
                this.invoiceEditedItem.city = data.city.value
                this.invoiceEditedItem.district = data.area.value
            },

            saveInvoice() {
                let valid = this.$refs["invoiceForm"].validate()
                if (valid) {
                    this.invoiceLogsItems = []
                    if (this.invoiceEditedIndex > -1) {
                        if (this.invoiceEditedItem.invoiceMoney == '' || this.invoiceEditedItem.percent == '') {
                            alert("请完成必填项！！")
                            return false;
                        }
                        Object.assign(this.invoiceDesserts[this.invoiceEditedItem], this.invoiceEditedItem)
                    } else {
                        if (this.invoiceEditedItem.invoiceMoney == '' || this.invoiceEditedItem.percent == '') {
                            alert("请完成必填项！！")
                            return false;
                        }
                        if (this.invoiceFlag == true) {
                            this.invoiceEditedItem.status = '未审核'
                        } else if (this.invoiceFlag == false) {
                            this.invoiceEditedItem.status = '已审核'
                        }
                        this.invoiceDesserts.push(this.invoiceEditedItem);
                        this.loadDialog = true
                        salesContractApi.insertInvoice(this.invoiceEditedItem).then(result => {
                            if (result != null) {
                                if (this.monthData.dateSearch != '') {
                                    this.closeInvoice();
                                    this.loadInvoiceMSG(this.invoiceEditedItem);
                                    this.loadMonthSalesContract()
                                    this.loadInvoiceLogs(this.invoiceEditedItem)
                                } else if (this.monthData.dateSearch == '') {
                                    this.closeInvoice();
                                    this.loadInvoiceMSG(this.invoiceEditedItem);
                                    this.loadSalesContract();
                                    this.loadInvoiceLogs(this.invoiceEditedItem)
                                }
                                this.loadDialog = false
                                this.$refs['invoiceFlow'].startFlow({
                                    title: result.agreementName + "开票申请单",
                                    content: '',
                                    frameId: result.id,
                                    frameCoding: 1320275,
                                    frameColumn: 'id'
                                }).then()
                            }
                        });
                    }
                }

            },

            invoiceDefault() {
                this.invoiceTipMSG = null
                this.invoiceMaxPercent = 100
                this.invoiceEditedItem.tax = '默认'
                this.$refs['invoiceForm'].resetValidation()
            },

            percentOfInvoiceMoney() {
                this.invoiceEditedItem.invoiceMoney = this.formatNum(this.invoiceEditedItem.percent / 100 * this.invoiceEditedItem.agreementMoney);
            },

            invoiceMoneyOfPercent() {
                this.invoiceEditedItem.percent = this.formatNum(this.invoiceEditedItem.invoiceMoney / this.invoiceEditedItem.agreementMoney * 100);
            },

            showInvoiceLogs() {
                this.dialogInvoiceLogs = true
            },
            loadInvoiceLogs(item) {
                salesContractLogsApi.getLogs({agreementID: item.agreementID, type: 0}).then(res => {
                    if (res.length > 0) {
                        for (let a = 0; a < res.length; a++) {
                            this.invoiceLogsItems.push(this.formatTimer2(res[a].createTime) + "  " + res[a].modifyMSG)
                        }
                    }
                })
            },
            getInvoicedTotalPercentByTax(tax, agreementID, percent, taxCompare) {
                this.totalInvoicePercentForTax = null
                if (tax == null) {
                    salesContractApi.getAgreementMSG({agreementID: agreementID}).then(res => {
                        if (res.salesContract.tax == 6) {
                            this.dialogTax6 = true
                            this.dialogTax3 = false
                            this.dialogTax9 = false
                            this.dialogTax13 = false
                            this.invoiceLabel = '备注'
                        } else if (res.salesContract.tax == 13) {
                            this.dialogTax13 = true
                            this.dialogTax6 = false
                            this.dialogTax3 = false
                            this.dialogTax9 = false
                            this.invoiceLabel = '备注'
                        } else if (res.salesContract.tax == 3 || res.salesContract.tax == 9) {
                            this.invoiceLabel = '备注(请填写工程名称、工程地点)'
                            this.dialogTax6 = false
                            this.dialogTax3 = false
                            this.dialogTax9 = false
                            this.dialogTax13 = false
                        }
                    })
                } else {
                    if (taxCompare == 6) {
                        this.dialogTax6 = true
                        this.dialogTax3 = false
                        this.dialogTax9 = false
                        this.dialogTax13 = false
                        this.invoiceLabel = '备注'
                    } else if (taxCompare == 13) {
                        this.dialogTax13 = true
                        this.dialogTax6 = false
                        this.dialogTax3 = false
                        this.dialogTax9 = false
                        this.invoiceLabel = '备注'
                    } else if (taxCompare == 3 || taxCompare == 9) {
                        this.invoiceLabel = '备注(请填写工程名称、工程地点)'
                        this.dialogTax6 = false
                        this.dialogTax3 = false
                        this.dialogTax9 = false
                        this.dialogTax13 = false
                    }
                }

                salesContractApi.getTotalPercentByTax({tax: tax, agreementID: agreementID}).then(res => {
                    this.totalInvoicePercentForTax = res
                    if (percent >= this.totalInvoicePercentForTax) {
                        this.invoiceTipMSG = '该税率类型剩余可开票占比为' + (percent - this.totalInvoicePercentForTax)
                        this.invoiceEditedItem.percent = (percent - this.totalInvoicePercentForTax)
                        this.invoiceMaxPercent = (percent - this.totalInvoicePercentForTax)
                        this.invoiceEditedItem.invoiceMoney = this.formatNum(this.invoiceEditedItem.percent / 100 * this.invoiceEditedItem.agreementMoney);
                        this.rules.invoicePercentRules = [
                            v => v > 0 || '请输入正确的数值', v => v <= this.invoiceMaxPercent || '请输入正确的数值'
                        ]
                    }
                }).catch(e => {
                    console.log('异常信息', e)
                })
            },
            showInvoiceDetail(e, data) {
                this.invoiceDetailId = data.item.id
                this.dialogInvoiceDetail = true
            },

            //收款
            loadCollectMSG(item) {
                //agreementID => contractId
                salesContractApi.getCollect({agreementID: item.agreementID}).then(result => {
                    for (let x = 0; x < result.rows.length; x++) {
                        if (result.rows[x].pDate != "" && result.rows[x].pDate != null) {
                            result.rows[x].pDate = this.formatTimer(result.rows[x].pDate)
                        } else if (result.rows[x].pDate == '' || result.rows[x].pDate == null) {
                            result.rows[x].pDate = '';
                        }
                        if (result.rows[x].createTime != "" && result.rows[x].createTime != null) {
                            result.rows[x].createTime = this.formatTimer(result.rows[x].createTime)
                        } else {
                            result.rows[x].createTime = '';
                        }
                        if (result.rows[x].status == '未审核') {
                            result.rows[x].statusCheck = false;
                            result.rows[x].status = '未回款'
                        } else if (result.rows[x].status == '已审核') {
                            result.rows[x].statusCheck = true;
                            result.rows[x].status = '已回款'
                        }
                    }
                    this.collectDesserts = result.rows;
                }).catch(e => {
                    console.log("异常信息", e);
                });
            },

            collectAction(item) {
                this.collectLogsItems = []
                this.collectEditedItem.agreementName = item.agreementName;
                this.collectEditedItem.agreementID = item.contractId;
                this.collectEditedItem.agreementMoney = item.agreementMoney;
                this.collectEditedItem.collectedMoney = item.collectedMoney;
                var date = new Date();
                this.collectEditedItem.collectID = this.formatNowTime(date);
                this.collectEditedItem.pDate = this.formatTimer(date);

                this.collectDefaultItem.agreementName = item.agreementName;
                this.collectDefaultItem.agreementID = item.contractId;
                this.collectDefaultItem.agreementMoney = item.agreementMoney;
                this.collectDefaultItem.collectedMoney = item.collectedMoney;
                this.collectDefaultItem.collectedPercent = item.contractCollectP;
                var date1 = new Date();
                this.collectDefaultItem.collectID = this.formatNowTime(date1);
                this.collectDefaultItem.pDate = this.formatTimer(date1);
                this.collect = true;

                this.loadCollectLogs(this.collectEditedItem)
                this.loadCollectMSG(this.collectEditedItem);

            },

            collectDeleteItem(item) {
                this.collectEditedIndex = this.collectDesserts.indexOf(item)
                this.collectEditedItem = Object.assign({}, item)
                this.collectDialogDelete = true
            },

            collectDeleteItemConfirm() {
                this.collectLogsItems = []
                salesContractApi.deleteCollect(this.collectEditedItem).then(result => {
                    if (result != null) {
                        this.loadCollectMSG(this.collectEditedItem);
                        this.loadSalesContract();
                        this.collectCloseDelete();
                        this.loadCollectLogs(this.collectEditedItem)
                    }
                });
            },

            closeCollect() {
                this.collectDialog = false;
                this.$nextTick(() => {
                    this.collectEditedItem = Object.assign({}, this.collectDefaultItem)
                    this.collectEditedIndex = -1
                })
            },

            collectCloseDelete() {
                this.collectDialogDelete = false
                this.$nextTick(() => {
                    this.collectEditedItem = Object.assign({}, this.collectDefaultItem)
                    this.collectEditedIndex = -1
                })
            },

            saveCollect() {
                this.collectLogsItems = []
                if (this.collectEditedIndex > -1) {
                    if (this.collectEditedItem.collectMoney == '' || this.collectEditedItem.percent == '') {
                        alert("请完成必填项！")
                        return false;
                    }
                    Object.assign(this.collectDesserts[this.collectEditedItem], this.collectEditedItem)
                    // salesContractApi.updateCollect(this.collectEditedItem);
                } else {
                    if (this.collectEditedItem.collectMoney == '' || this.collectEditedItem.percent == '') {
                        alert("请完成必填项！")
                        return false;
                    }
                    this.collectDesserts.push(this.collectEditedItem);
                    this.loadDialog = true
                    salesContractApi.insertCollect(this.collectEditedItem).then(result => {
                        if (result != null) {
                            if (this.monthData.dateSearch != '') {
                                this.closeCollect();
                                this.loadCollectMSG(this.collectEditedItem);
                                this.loadMonthSalesContract();
                                this.loadCollectLogs(this.collectEditedItem)
                            } else if (this.monthData.dateSearch == '') {
                                this.closeCollect();
                                this.loadCollectMSG(this.collectEditedItem);
                                this.loadSalesContract();
                                this.loadCollectLogs(this.collectEditedItem)
                            }
                        }
                        this.loadDialog = false
                    });
                }
            },

            percentOfCollectMoney() {
                this.collectEditedItem.collectMoney = this.formatNum(this.collectEditedItem.percent / 100 * this.collectEditedItem.agreementMoney);
            },

            collectMoneyOfPercent() {
                this.collectEditedItem.percent = this.formatNum(this.collectEditedItem.collectMoney / this.collectEditedItem.agreementMoney * 100);
            },

            Check(item) {
                this.collectLogsItems = []
                if (item.status == '未回款') {
                    this.dialogCollectTypeItem = item
                    this.dialogCollectType = true

                } else if (item.status == '已回款') {
                    this.collectSwitch = true;
                    item.status = '未回款';
                    salesContractApi.checkStatus(item).then(result => {
                        if (result != null) {
                            this.collectSwitch = false;
                            if (this.monthData.dateSearch != '') {
                                this.loadCollectMSG(item);
                                this.loadMonthSalesContract();
                                this.loadCollectLogs(item)
                            } else if (this.monthData.dateSearch == '') {
                                this.loadCollectMSG(item);
                                this.loadSalesContract();
                                this.loadCollectLogs(item)
                            }
                        }
                    })
                }
            },

            //收款日志
            showCollectLogs() {
                this.dialogCollectLogs = true
            },
            loadCollectLogs(item) {
                this.collectLogsItems = []
                salesContractLogsApi.getLogs({agreementID: item.agreementID, type: 1}).then(res => {
                    if (res.length > 0) {
                        for (let a = 0; a < res.length; a++) {
                            this.collectLogsItems.push(this.formatTimer2(res[a].createTime) + "  " + res[a].modifyMSG)
                        }
                    }
                })
            },

            //收款类型
            closeCollectType() {
                this.dialogCollectType = false
                this.dialogCollectTypeItem.statusCheck = false
                this.$nextTick(() => {
                    this.collectType = null
                    this.tradeAcceptanceDate = null
                    this.tradeAcceptanceInterest = null
                    this.factoringDate = null
                    this.fixedAssets = null
                    this.fixedAssetsStatus = null
                })
            },
            saveCollectType() {
                if (this.$refs['collectTypeForm'].validate()) {
                    this.collectSwitch = true;
                    this.dialogCollectTypeItem.status = '已回款'
                    this.dialogCollectTypeItem.collectType = this.collectType
                    this.dialogCollectTypeItem.tradeAcceptanceDate = this.tradeAcceptanceDate
                    this.dialogCollectTypeItem.tradeAcceptanceInterest = this.tradeAcceptanceInterest
                    this.dialogCollectTypeItem.factoringDate = this.factoringDate
                    this.dialogCollectTypeItem.fixedAssets = this.fixedAssets
                    this.dialogCollectTypeItem.fixedAssetsStatus = this.fixedAssetsStatus
                    salesContractApi.checkStatus(this.dialogCollectTypeItem).then(result => {
                        if (result != null) {
                            this.collectSwitch = false;
                            if (this.monthData.dateSearch != '') {
                                this.closeCollectType()
                                this.loadCollectMSG(this.dialogCollectTypeItem);
                                this.loadMonthSalesContract();
                                this.loadCollectLogs(this.dialogCollectTypeItem)
                            } else if (this.monthData.dateSearch == '') {
                                this.closeCollectType()
                                this.loadCollectMSG(this.dialogCollectTypeItem);
                                this.loadSalesContract();
                                this.loadCollectLogs(this.dialogCollectTypeItem)
                            }
                        }
                    })
                }
            },
            showCollectType(item) {
                this.dialogShowCollectTypeItemRest()
                this.dialogShowCollectTypeItem = item
                this.dialogShowCollectTypeItem.temptradeDate = this.formatTimer(this.dialogShowCollectTypeItem.tradeAcceptanceDate)
                this.dialogShowCollectTypeItem.tempFactoringDate = this.formatTimer(this.dialogShowCollectTypeItem.factoringDate)
                this.fixedAssetsStatusTemp = item.fixedAssetsStatus
                this.dialogShowCollectType = true
            },
            closeDialogShowCollectType() {
                this.dialogShowCollectTypeItemRest()
                this.dialogShowCollectType = false
                this.$nextTick(() => {
                    this.dialogShowCollectTypeItemRest()
                    this.fixedAssetsStatusTemp = null
                })
            },
            fixedAssetsStatusChanged() {
                if (this.fixedAssetsStatusTemp != this.dialogShowCollectTypeItem.fixedAssetsStatus) {
                    this.loadDialog = true
                    salesContractApi.fixedAssetsStatusChange(this.dialogShowCollectTypeItem).then(res => {
                        if (res != null) {
                            this.loadDialog = false
                            this.loadCollectLogs(this.dialogShowCollectTypeItem)
                            this.loadCollectMSG(this.dialogShowCollectTypeItem)
                            this.fixedAssetsStatusTemp = this.dialogShowCollectTypeItem.fixedAssetsStatus
                        }
                    })
                }
            },
            dialogShowCollectTypeItemRest() {
                this.dialogShowCollectTypeItem = {
                    ID: null,
                    collectID: null,
                    agreementName: null,
                    agreementID: null,
                    agreementMoney: null,
                    collectMoney: null,
                    percent: null,
                    remark: null,
                    createTime: null,
                    registrant: null,
                    collectedMoney: null,
                    pDate: null,
                    status: null,
                    collectType: null,
                    tradeAcceptanceDate: null,
                    tradeAcceptanceInterest: null,
                    factoringDate: null,
                    fixedAssets: null,
                    fixedAssetsStatus: null,
                    temptradeDate: null,
                    tempFactoringDate: null,
                }
            },
            //修改收款金额
            showChangeCollect(item) {
                this.collectMoneyChangeItem = item
                this.dialogChangeCollect = true
                this.$nextTick(() => {
                    this.changeCollectPercent = item.percent
                    this.changeCollectMoney = item.collectMoney
                    this.changeCollectMoneyOld = item.collectMoney
                    this.changeCollectPercentOld = item.percent
                })
            },
            closeCollectMoneyChange() {
                this.dialogChangeCollect = false
                this.$nextTick(() => {
                    this.collectMoneyChangeItem = null
                    this.changeCollectPercent = null
                    this.changeCollectMoney = null
                    this.changeCollectMoneyOld = null
                    this.changeCollectPercentOld = null
                })
            },
            saveCollectMoneyChange() {
                this.collectMoneyChangeItem.collectMoney = this.changeCollectMoney
                this.collectMoneyChangeItem.percent = this.changeCollectPercent
                this.collectMoneyChangeItem.collectMoneyPast = this.changeCollectMoneyOld
                salesContractApi.updateCollectMoney(this.collectMoneyChangeItem).then(res => {
                    if (res != null) {
                        this.loadCollectLogs(this.collectMoneyChangeItem)
                        this.closeCollectMoneyChange()
                    }
                }).catch(e => {
                    this.dialogChangeCollect = false
                    this.msg = e
                    this.msgFlag = true
                    this.collectMoneyChangeItem.collectMoney = this.changeCollectMoneyOld
                    this.collectMoneyChangeItem.percent = this.changeCollectPercentOld
                })
            },
            showChangeCollectPercent() {
                this.changeCollectPercent = this.formatNum(this.changeCollectMoney / this.collectEditedItem.agreementMoney * 100);
            },
            showChangeCollectMoney() {
                this.changeCollectMoney = this.formatNum(this.changeCollectPercent / 100 * this.collectEditedItem.agreementMoney)
            },
            //收款末尾

            loadMonthSalesContract() {
                salesContractApi.getMonthSalesContract({
                    itemsPerPage: this.options.itemsPerPage,
                    page: this.options.page,
                    dateSearch: this.monthData.dateSearch,
                    btnColor: this.btnColor
                }).then(result => {
                    for (let x = 0; x < result.rows.length; x++) {
                        try {
                            var item = result.rows[x]

                            if (item.retentionPercent == null || item.retentionPercent == '') {
                                result.rows[x].retentionPercent = 0;
                            }
                            if (item.retentionMoney == null || item.retentionMoney == '') {
                                result.rows[x].retentionMoney = 0;
                            }

                            if (result.rows[x].pDate != null) {
                                result.rows[x].pDate = this.formatTimer(item.pDate)
                            }
                            if (result.rows[x].actualDate != null) {
                                result.rows[x].actualDate = this.formatTimer(item.actualDate)
                            }
                            result.rows[x].contractInvoiceP = Math.floor(item.invoicedMoney * 100 / item.agreementMoney);
                            var tempI = result.rows[x].contractInvoiceP;
                            if (tempI == 0 || (tempI > 0 && tempI < 25)) {
                                result.rows[x].percentColorI = 'red';
                            } else if (tempI == 25 || (tempI > 25 && tempI < 50)) {
                                result.rows[x].percentColorI = 'yellow';
                            } else if (tempI == 50 || (tempI > 50 && tempI < 75)) {
                                result.rows[x].percentColorI = 'blue';
                            } else {
                                result.rows[x].percentColorI = 'green';
                            }

                            result.rows[x].contractCollectP = Math.floor(item.collectedMoney * 100 / item.agreementMoney);
                            var tempC = result.rows[x].contractCollectP;
                            if (tempC == 0 || (tempC > 0 && tempC < 25)) {
                                result.rows[x].percentColorC = 'red';
                            } else if (tempC == 25 || (tempC > 25 && tempC < 50)) {
                                result.rows[x].percentColorC = 'yellow';
                            } else if (tempC == 50 || (tempC > 50 && tempC < 75)) {
                                result.rows[x].percentColorC = 'blue';
                            } else {
                                result.rows[x].percentColorC = 'green';
                            }

                        } catch (e) {
                            console.log(e);
                        }
                    }
                    this.monthData.monthTotalMoney = this.formatNum(result.monthTotalMoney);
                    this.monthData.monthTotalInvoiced = this.formatNum(result.monthTotalInvoiced);
                    this.monthData.monthTotalCollected = this.formatNum(result.monthTotalCollected);
                    this.defaultItem.signDate = this.formatTimer(new Date());
                    this.desserts = result.rows;
                    this.totalDesserts = result.totalDesserts;
                })
            },

            monthChanged() {
                this.$refs.menu.save(this.monthData.dateSearch)
                this.search = ''
                this.loadMonthSalesContract();
                var MM = this.monthData.dateSearch.substr(5, 2)
                this.labelMonthTotalCollected = MM + '月已收款总金额'
                this.labelMonthTotalInvoiced = MM + '月已开票总金额'
                this.labelMonthTotalMoney = MM + '月合同总金额'
            },
            signDateChanged() {
                this.$refs.menu2.save(this.editedItem.signDate)
            },
            pDateChanged() {
                this.$refs.menu3.save(this.editedItem.pDate)
            },
            actualDateChanged() {
                return this.$refs.menu4.save(this.editedItem.actualDate);
            },
            invoiceDateChanged() {
                return this.$refs.menu5.save(this.invoiceEditedItem.createTime);
            },
            collectDateChanged() {
                return this.$refs.menu6.save(this.collectEditedItem.createTime);
            },
            returnDateChanged() {
                return this.$refs.menu7.save(this.invoiceEditedItem.returnDate);
            },

            companySearch() {

                if (this.searchCompany != '') {
                    companyApi.getCompany({companyName: this.searchCompany}).then(result => {
                        this.companyNameItems = [];
                        this.companyItems = [];
                        if (result.rows != null) {
                            for (let x = 0; x < result.rows.length; x++) {
                                this.companyNameItems.push(result.rows[x].name);
                                this.companyMSG.companyName = result.rows[x].name;
                                this.companyMSG.companyAddress = result.rows[x].address;
                                this.companyMSG.bankName = result.rows[x].openAccount;
                                this.companyMSG.bankAccount = result.rows[x].bankNumber;
                                this.companyMSG.phone = result.rows[x].phone;
                                this.companyMSG.jurisdiction = result.rows[x].jurisdiction;
                                this.companyMSG.street = result.rows[x].street;
                                this.companyItems.push(this.companyMSG);
                                this.companyMSG = {
                                    companyName: null,
                                    companyAddress: null,
                                    bankName: null,
                                    bankAccount: null,
                                    phone: null,
                                    jurisdiction: null,
                                    street: null,
                                }
                            }
                        }
                    })
                }
            },
            updateMSG() {
                for (let x = 0; x < this.companyItems.length; x++) {
                    if (this.companyItems[x].companyName == this.editedItem.companyName) {
                        this.editedItem.companyAddress = this.companyItems[x].companyAddress;
                        this.editedItem.bankName = this.companyItems[x].bankName;
                        this.editedItem.bankAccount = this.companyItems[x].bankAccount;
                        this.editedItem.phone = this.companyItems[x].phone;
                        this.editedItem.jurisdiction = this.companyItems[x].jurisdiction;
                        this.editedItem.street = this.companyItems[x].street;
                    }
                }
            },

            //附件
            fileUpload(res) {
                this.editedItem.files = []
                for (let x = 0; x < res.files.length; x++) {
                    this.SalesFiles.fileUrl = res.files[x].ftpPath;
                    this.SalesFiles.fileName = res.files[x].fileName;
                    this.SalesFiles.mark = this.editedItem.contractId;
                    this.editedItem.files.push(this.SalesFiles);
                    this.SalesFiles = {fileName: null, fileUrl: null, mark: null}
                }
            },

            showFiles() {
                this.showSalesFiles = true;
                this.loadSalesFiles();
            },

            loadSalesFiles() {
                salesContractApi.showSalesFiles({id: this.editedItem.contractId}).then(result => {
                    this.salesFilesDesserts = result;
                })
            },

            salesFilesDelete(item) {
                salesContractApi.deleteSalesFile(item).then(result => {
                    if (result != null) {
                        this.loadSalesFiles()
                    }
                })
            },

            downloadFile(item) {
                let a = document.createElement('a');
                a.href = `/api/files/downloadFile?filePath=` + item.fileUrl + `&downloadFile=` + item.fileName;
                a.target = "_blank";
                a.click();
            },
            resetClear() {
                this.searchCityInit("南通")
                this.clear = true
                this.$refs['editedItem'].resetValidation()
                this.paymentItems = [30, 60, "其他"]
            },
            reset() {
                this.clear = false;
                this.SalesFiles = {
                    fileName: null,
                    fileUrl: null,
                    mark: null,
                }
                this.editedItem.files = [];
                this.taxDesserts = [];
                this.taxExtraItems = [];
                this.managerDesserts = [];
                this.managerItems = [];
                this.startFlow = true
            },

            //层级查看
            colorChange() {
                if (this.btnColor === '#546E7A') {
                    this.search = ''
                    this.btnColor = '#43A047'
                    if (this.monthData.dateSearch == '') {
                        this.getMySalesContracts()
                    } else {
                        this.loadMonthSalesContract()
                    }
                } else if (this.btnColor === '#43A047') {
                    this.search = ''
                    this.btnColor = '#546E7A'
                    if (this.monthData.dateSearch == '') {
                        this.loadSalesContract()
                    } else {
                        this.loadMonthSalesContract()
                    }
                }

            },
            getMySalesContracts() {
                salesContractApi.getMySalesContract({
                    itemsPerPage: this.options.itemsPerPage,
                    page: this.options.page,
                    dateSearch: this.monthData.dateSearch,
                    btnColor: this.btnColor
                }).then(result => {
                    for (let x = 0; x < result.rows.length; x++) {
                        try {
                            var item = result.rows[x]

                            if (item.retentionPercent == null || item.retentionPercent == '') {
                                result.rows[x].retentionPercent = 0;
                            }
                            if (item.retentionMoney == null || item.retentionMoney == '') {
                                result.rows[x].retentionMoney = 0;
                            }

                            if (result.rows[x].pDate != null) {
                                result.rows[x].pDate = this.formatTimer(item.pDate)
                            }
                            if (result.rows[x].actualDate != null) {
                                result.rows[x].actualDate = this.formatTimer(item.actualDate)
                            }
                            result.rows[x].contractInvoiceP = Math.floor(item.invoicedMoney * 100 / item.agreementMoney);
                            var tempI = result.rows[x].contractInvoiceP;
                            if (tempI == 0 || (tempI > 0 && tempI < 25)) {
                                result.rows[x].percentColorI = 'red';
                            } else if (tempI == 25 || (tempI > 25 && tempI < 50)) {
                                result.rows[x].percentColorI = 'yellow';
                            } else if (tempI == 50 || (tempI > 50 && tempI < 75)) {
                                result.rows[x].percentColorI = 'blue';
                            } else {
                                result.rows[x].percentColorI = 'green';
                            }

                            result.rows[x].contractCollectP = Math.floor(item.collectedMoney * 100 / item.agreementMoney);
                            var tempC = result.rows[x].contractCollectP;
                            if (tempC == 0 || (tempC > 0 && tempC < 25)) {
                                result.rows[x].percentColorC = 'red';
                            } else if (tempC == 25 || (tempC > 25 && tempC < 50)) {
                                result.rows[x].percentColorC = 'yellow';
                            } else if (tempC == 50 || (tempC > 50 && tempC < 75)) {
                                result.rows[x].percentColorC = 'blue';
                            } else {
                                result.rows[x].percentColorC = 'green';
                            }

                        } catch (e) {
                            console.log(e);
                        }
                    }
                    this.defaultItem.signDate = this.formatTimer(new Date());
                    this.desserts = result.rows;
                    this.totalDesserts = result.totalDesserts;
                })
            },

            //税率
            addTax() {
                this.dialogAddTax = true
            },
            closeTax() {
                this.taxDialog = false
                this.$nextTick(() => {
                    this.taxEditedItem = Object.assign({}, this.taxDefaultItem)
                })
            },
            saveTax() {
                let valid = this.$refs['taxForm'].validate();
                if (valid) {
                    this.taxDesserts.push(this.taxEditedItem);
                    this.closeTax()
                }

            },
            taxDeleteItem(item) {
                this.taxEditedIndex = this.taxDesserts.indexOf(item)
                this.taxEditedItem = Object.assign({}, item)
                this.taxDelete = true
            },
            taxCloseDelete() {
                this.taxDelete = false
                this.$nextTick(() => {
                    this.taxEditedItem = Object.assign({}, this.taxDefaultItem)
                    this.taxEditedIndex = -1
                })
            },
            taxDeleteItemConfirm() {
                this.taxDesserts.splice(this.taxEditedIndex, 1)
                this.taxCloseDelete()
            },
            showTax(item) {
                salesContractApi.getTax({agreementID: item.contractId}).then(res => {
                    if (res != null) {
                        this.taxDesserts = res.rows
                        for (let a = 0; a < res.rows.length; a++) {
                            this.taxExtraItems.push(res.rows[a])
                        }
                    }
                })
            },

            //指定项目经理
            appointManager() {
                this.sectionItems = []
                list().then(res => {
                    for (let a = 0; a < res.length; a++) {
                        this.sectionItems.push(res[a])
                    }
                })
                this.dialogManager = true
            },
            getStaffListBySection() {
                if (this.sectionItem != null) {
                    getStaffBySectionId(this.sectionItem.id).then(res => {
                        for (let a = 0; a < res.length; a++) {
                            if (res[a] == null) {
                                this.staffItems.push({name: ''})
                            }
                            this.staffItems.push(res[a])
                        }
                    })
                }
            },
            searchManager() {
                getStaff(this.searchName).then(res => {
                    for (let a = 0; a < res.length; a++) {
                        this.staffSearchItems.push(res[a])
                    }
                })
            },
            updateManager() {
                this.sectionItem = this.staffSearchItem.section
                this.staffItem = this.staffSearchItem
            },
            closeManagerAppoint() {
                this.managerAddDialog = false
                this.staffItem = null
                this.sectionItem = null
                this.staffSearchItem = null
            },
            saveManagerAppoint() {
                this.SalesContractManagerReset()
                console.log(this.editedIndex)
                this.SalesContractManager.managerName = this.staffItem.name
                this.SalesContractManager.managerID = this.staffItem.id
                this.SalesContractManager.sectionName = this.sectionItem.name
                this.managerDesserts.push(this.SalesContractManager)
                this.closeManagerAppoint()
            },
            showManager(item) {
                salesContractApi.getManagers({agreementID: item.contractId}).then(res => {
                    this.managerDesserts = res.rows
                    for (let a = 0; a < res.rows.length; a++) {
                        this.managerItems.push(res.rows[a])
                    }
                })
            },
            SalesContractManagerReset() {
                this.SalesContractManager = {
                    agreementID: null,
                    managerName: null,
                    managerID: null,
                    sectionName: null,
                }
            },
            managerDeleteItem(item) {
                this.managerEditedIndex = this.managerDesserts.indexOf(item)
                this.SalesContractManager = Object.assign({}, item)
                this.managerDialogDelete = true
            },
            managerCloseDelete() {
                this.managerDialogDelete = false
                this.$nextTick(() => {
                    this.managerEditedIndex = -1
                    this.SalesContractManagerReset()
                })
            },
            managerDeleteItemConfirm() {
                this.managerDesserts.splice(this.managerEditedIndex, 1)
                this.managerCloseDelete()
                // salesContractApi.deleteManager(this.SalesContractManager).then(res => {
                //     if (res == 1) {
                //         this.showManager({contractId:this.SalesContractManager.agreementID})
                //         this.SalesContractManagerReset()
                //         this.managerDialogDelete = false
                //     }
                // })
            },

            //百度地图
            showMap() {
                this.mapDialog = true
            },
            mapReady({BMap, map}) {

                this.center.lat = 31.947129
                this.center.lng = 120.921896
                this.zoom = 15
                this.map = map
                this.BMap = BMap
                map.addEventListener('click', function (e) {
                    console.log('mapClick', e)
                })

            },
            searchAddress() {
                this.searchLoading = true
                this.keyword = this.placeStr
            },
            getInfohtmlset(data){
                console.log('getInfohtmlset',data)
                this.editedItem.lng = data.point.lng
                this.editedItem.lat = data.point.lat
                this.placeStr = data.title
                this.editedItem.projectBase = this.placeStr
                this.searchLoading = false
            },
            saveAddress(){
                console.log('this.mapDialog',this.mapDialog)
                this.mapDialog = false
            }

        }
    }
</script>
<style>
    .tip {
        color: red;
    }

    .bm-view {
        width: 100%;
        height: 700px;
    }

    .searchBox{
        position: absolute;
        left: 200px;
        top: 140px;
        overflow: hidden;
        z-index: 99999;
    }

    .search {
        position: absolute;
        left: 200px;
        top: 180px;
        overflow: hidden;
        /*pointer-events: none;*/
    }

</style>
