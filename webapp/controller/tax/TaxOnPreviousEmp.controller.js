sap.ui.define([
	"com/infocus/app/fi/zTaxApprove/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter"
], function(BaseController, Fragment, MessageBox, MessageToast, Filter) {
	"use strict";

	return BaseController.extend("com.infocus.app.fi.zTaxApprove.controller.tax.TaxOnPreviousEmp", {

		onInit: function() {
			//var oRouter = this.getRouter();

			//	oRouter.getRoute("employee").attachMatched(this._onRouteMatched, this);
			//this._onReadPreviousEmployementDataSet();
			this._initialDisplay();
			this.getOwnerComponent().getEventBus().subscribe("Default", "getPreviousEmployeeData", () => {
				this._onReadPreviousEmployementDataSet();
			});
		},
		_onRouteMatched: function(oEvent) {
			var oArgs, oView;
			oArgs = oEvent.getParameter("arguments");
			oView = this.getView();

			oView.bindElement({
				path: "/Employees(" + oArgs.employeeId + ")",
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function(oEvent) {
						oView.setBusy(true);
					},
					dataReceived: function(oEvent) {
						oView.setBusy(false);
					}
				}
			});
		},
		_initialDisplay: function() {
			this.byId("editItemId").setVisible(false);
			this.byId("displayItemId").setVisible(true);
		},
		handleEditPress: function() {
			this._toggleButtonsAndView(true);
		},
		handleCancelPress: function() {
			this._toggleButtonsAndView(false);
		},
		handleSavePress: function() {
			this.onSave();
			this._toggleButtonsAndView(false);
		},
		_toggleButtonsAndView: function(bEdit) {
			var oView = this.getView();
			oView.byId("edit").setVisible(!bEdit);
			oView.byId("save").setVisible(bEdit);
			oView.byId("cancel").setVisible(bEdit);
			this.byId("editItemId").setVisible(bEdit);
			this.byId("displayItemId").setVisible(!bEdit);
		},
		_onReadPreviousEmployementDataSet: function() {
			var that = this;
			var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			var oModel = this.getOwnerComponent().getModel();
			//var oPernerFilter = new Filter("personnelNo", sap.ui.model.FilterOperator.EQ, oJsonGlobalData.userId);
			//var oPernerFilter = new sap.ui.model.Filter("personnelNo", sap.ui.model.FilterOperator.EQ, "1000");
			var oFiscalYearFilter = new sap.ui.model.Filter("fiscalYear", sap.ui.model.FilterOperator.EQ, oJsonGlobalData.selectedYear);
			//var oFiscalYearFilter = new Filter("fiscalYear", sap.ui.model.FilterOperator.EQ, "2022-2023");
			var oUrl = "/TaxPreviousEmployment";

			oModel.read(oUrl, {
				filters: [oFiscalYearFilter],
				success: function(response) {
					oJsonGlobalData.oTotal80CDeclaredAmount = 0;
					var data = response.results;
					var oJsonSec80cModel = that.getOwnerComponent().getModel('PreviousEmployement');
					oJsonSec80cModel.setData(data);
				},
				error: function(error) {
					//console.log(error);
					MessageToast.show("Error in loading the Financial Years" + error);
				}
			});
			oModel.attachRequestCompleted(function() {
				var headerModel = this.getOwnerComponent().getModel('employeeData').getData();
				if (headerModel[0] !== undefined && headerModel[0].projection === 'X') {
					this.byId('edit').setEnabled(true);
					this.byId('edit').setVisible(true);
				} else {
					this.byId('edit').setEnabled(false);
					this.byId('edit').setVisible(false);
					this.byId('save').setVisible(false);
					this.byId('cancel').setVisible(false);
				}
				
				this.byId("editItemId").setVisible(false);
				this.byId("displayItemId").setVisible(true);
			}.bind(this));
		},
		onChange: function(oEvent) {

			// input field validation
			var dataValid = parseInt(oEvent.getSource().getValue());

			if (dataValid < 0) {
				MessageToast.show("input field can't hold negative value: " + dataValid);
				return oEvent.getSource().setValue("");
			}

			var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();

			// dataValidInt variable
			oJsonGlobalData.dataValidInt = dataValid;
			this.getOwnerComponent().getModel("globalData").setData(oJsonGlobalData);
		},

		onSave: function() {
			var dataArray = this.getOwnerComponent().getModel("PreviousEmployement").getData();
			for (var i = 0; i < dataArray.length; i++) {
				delete dataArray[i].__metadata;
			}

			var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			if (oJsonGlobalData.dataValidInt < 0) {
				MessageBox.information("Input Amount can't be negative");
			} else if (oJsonGlobalData.dataValidInt === 0) {
				MessageBox.information("Input Amount can't be zero");
			} else {
				this._onSavePreviousEmployementDataSet(dataArray);
			}

		},

		_onSavePreviousEmployementDataSet: function(oData) {
			var oModel = this.getOwnerComponent().getModel();
			var oUrl = "/TaxPreviousEmployment";
			//var oPernerFilter = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, '1000');
			//var oFiscalYearFilter = new sap.ui.model.Filter("Fiscal", sap.ui.model.FilterOperator.EQ, '2022-2023');
			oModel.create(oUrl, oData[0], {
					success: function(response) {
						MessageBox.information("Income from Previous Employement data is saved");
					},
					error: function(error) {
						MessageBox.information("Income from Previous Employement data is not saved");
					}
				}

			);
		}

	});

});