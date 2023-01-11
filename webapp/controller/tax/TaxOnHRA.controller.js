sap.ui.define([
	"com/infocus/app/fi/zTaxApprove/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter"
], function(BaseController, Fragment, MessageBox, MessageToast, Filter) {
	"use strict";

	return BaseController.extend("com.infocus.app.fi.zTaxApprove.controller.tax.TaxOnHRA", {
		_oValueHelpCityDialog: null,
		_oValueHelpAccDialog: null,
		onInit: function() {
			//var oRouter = this.getRouter();

			//	oRouter.getRoute("employee").attachMatched(this._onRouteMatched, this);
			//this._onReadHRADataSet();
			this._initialDisplay();
			//this._getAccomodationType();
			this.getOwnerComponent().getEventBus().subscribe("Default", "getHRAData", () => {
				this._onReadHRADataSet();
			});
		},
		handleAccValueHelp: function() {
			var that = this;
			if (!this._oValueHelpAccDialog) {
				this._oValueHelpAccDialog = sap.ui.xmlfragment("com.infocus.app.fi.zTaxApprove.view.fragment.AccomodationDialog", this);
				this._oValueHelpAccDialog.setModel(that.getOwnerComponent().getModel("AccType"));
				this.getView().addDependent(this._oValueHelpAccDialog);
			}
			this._oValueHelpAccDialog.open();
		},

		handleAccValueHelpClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				oInput = this.byId("accInput");

			if (oSelectedItem) {
				var oValue = oSelectedItem.getTitle() + " " + oSelectedItem.getDescription();
				//this.byId("accInput").setValue(oValue);
				var oHouseTypeData = this.getOwnerComponent().getModel('HRA').getData();
				oHouseTypeData[0].housingType = oValue;
				this.getOwnerComponent().getModel('HRA').setData(oHouseTypeData);
			}

			if (!oSelectedItem) {
				oInput.resetProperty("");
			}
		},
		onDialogAccClose: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				var year = aContexts.map(function(oContext) {
					return oContext.getObject().Title;
				}).join(", ");
				MessageToast.show("You have chosen " + year);

			} else {
				MessageToast.show("No new item was selected.");
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		handleCityValueHelp: function() {
			if (!this._oValueHelpCityDialog) {
				this._oValueHelpCityDialog = sap.ui.xmlfragment("com.infocus.app.fi.zTaxApprove.view.fragment.CityType", this);
				this.getView().addDependent(this._oValueHelpCityDialog);
			}
			this._oValueHelpCityDialog.open();
		},

		handleCityValueHelpClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				oInput = this.byId("cityInput");

			if (oSelectedItem) {
				var oValue = oSelectedItem.getTitle() + " " + oSelectedItem.getDescription();
				//this.byId("cityInput").setValue(oSelectedItem.getDescription());
				var oCityTypeData = this.getOwnerComponent().getModel('HRA').getData();
				oCityTypeData[0].cityCategory = oValue;
				this.getOwnerComponent().getModel('HRA').setData(oCityTypeData);
			}

			if (!oSelectedItem) {
				oInput.resetProperty("");
			}
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
		_getAccomodationType: function() {
			var that = this;
			//var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			var oModel = this.getOwnerComponent().getModel();
			//var oPernerFilter = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, "1000");

			var oUrl = "/F4_housing_typeSet";

			oModel.read(oUrl, {
				//filters: [oPernerFilter],
				success: function(response) {
					var data = response.results;
					var oJsonSec80cModel = that.getOwnerComponent().getModel('AccType');
					oJsonSec80cModel.setData(data);
				},
				error: function(error) {
					//console.log(error);
					MessageToast.show("Error in loading the Accomodation Type" + error);
				}
			});
		},
		_onReadHRADataSet: function() {
			var that = this;
			var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			var oModel = this.getOwnerComponent().getModel();
			//var oPernerFilter = new Filter("personnelNo", sap.ui.model.FilterOperator.EQ, oJsonGlobalData.userId);
			//var oPernerFilter = new sap.ui.model.Filter("personnelNo", sap.ui.model.FilterOperator.EQ, "1000");
			var oFiscalYearFilter = new sap.ui.model.Filter("fiscalYear", sap.ui.model.FilterOperator.EQ, oJsonGlobalData.selectedYear);
			//var oFiscalYearFilter = new Filter("fiscalYear", sap.ui.model.FilterOperator.EQ, "2022-2023");
			var oUrl = "/TaxHouseRentAllowance";

			oModel.read(oUrl, {
				filters: [oFiscalYearFilter],
				success: function(response) {
					var data = response.results;
					var oJsonSec80cModel = that.getOwnerComponent().getModel('HRA');
					
					/*if(data[0].HRATaxExempt === "1"){
					    var oView = that.getView();
					    oView.byId("HRAExempt").setEnabled(false);
					}
					else{
					    var oView = that.getView();
					    oView.byId("HRAExempt").setEnabled(false);
					}*/
					
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

			var dataValid = parseInt(oEvent.getSource().getValue());
			// negative value not accepted
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
			var dataArray = this.getOwnerComponent().getModel("HRA").getData();

			if (dataArray[0].HRATaxExempt === true) {
				dataArray[0].HRATaxExempt = "1";
			}else{
			    dataArray[0].HRATaxExempt = " ";
			}

			for (var i = 0; i < dataArray.length; i++) {
				delete dataArray[i].__metadata;
			}
			this._onSaveHRADataSet(dataArray);
		},

		_onSaveHRADataSet: function(oData) {
			var oModel = this.getOwnerComponent().getModel();
			var oUrl = "/TaxHouseRentAllowance";
			//var oPernerFilter = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, '1000');
			//var oFiscalYearFilter = new sap.ui.model.Filter("Fiscal", sap.ui.model.FilterOperator.EQ, '2022-2023');
			oModel.create(oUrl, oData[0], {
					success: function(response) {
						MessageBox.information("House Rent Allowance data is saved");
					},
					error: function(error) {
						MessageBox.information("House Rent Allowance data is not saved");
					}
				}

			);
		}

	});

});