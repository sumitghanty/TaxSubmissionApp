sap.ui.define([
	"com/infocus/app/fi/zTaxApprove/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter"
], function(BaseController, Fragment, MessageBox, MessageToast, Filter) {
	"use strict";

	return BaseController.extend("com.infocus.app.fi.zTaxApprove.controller.tax.Tax80", {

		onInit: function() {
			//var oRouter = this.getRouter();

			//	oRouter.getRoute("employee").attachMatched(this._onRouteMatched, this);
			this.getOwnerComponent().getEventBus().subscribe("Default", "get80Data", () => {
				this._onRead80DataSet();
			});
			this._initialDisplay();
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
		_onRead80DataSet: function() {
			var that = this;

			var oModel = this.getOwnerComponent().getModel();
			var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			//var oPernerFilter = new Filter("Pernr", sap.ui.model.FilterOperator.EQ, oJsonGlobalData.userId);
			//var oPernerFilter = new Filter("Pernr", sap.ui.model.FilterOperator.EQ, "1000");
			var oFiscalYearFilter = new Filter("Fiscal", sap.ui.model.FilterOperator.EQ, oJsonGlobalData.selectedYear);
			//var oFiscalYearFilter = new Filter("Fiscal", sap.ui.model.FilterOperator.EQ, "2022-2023");
			var oUrl = "/Tax80";

			oModel.read(oUrl, {
				filters: [oFiscalYearFilter],
				success: function(response) {
					var data = response.results;
					var oJsonSec80cModel = that.getOwnerComponent().getModel('sec80');
					oJsonSec80cModel.setData(data);

					var oJsonGlobalData = that.getOwnerComponent().getModel("globalData").getData();

					oJsonGlobalData.oTotal80DeclaredAmount = 0;

					for (var i = 0; i < data.length; i++) {
						/*oJsonGlobalData.oTotal80DeclaredAmount += Number(oData[i].Amount);*/
						var newData = data[i];
						var strj;
						for (var j = 1; j <= 40; j++) {
							strj = '';
							if (j < 10) {
								strj = '0' + j.toString();
							} else {
								strj = j.toString();
							}
							var str = "Pcn" + strj;
							oJsonGlobalData.oTotal80DeclaredAmount += Number(newData[str]);
						}

					}
					
					that.getOwnerComponent().getModel("globalData").setData(oJsonGlobalData);

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
			/*			if (dataValid < 0) {
							MessageToast.show("input field can't hold negative value: " + dataValid);
							return oEvent.getSource().setValue("");
						}*/

			var oData = this.getOwnerComponent().getModel('sec80').getData();
			var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();

			oJsonGlobalData.oTotal80DeclaredAmount = 0;

			for (var i = 0; i < oData.length; i++) {
				/*oJsonGlobalData.oTotal80DeclaredAmount += Number(oData[i].Amount);*/
				var newData = oData[i];
				var strj;
				for (var j = 1; j <= 40; j++) {
					strj = '';
					if (j < 10) {
						strj = '0' + j.toString();
					} else {
						strj = j.toString();
					}
					var str = "Pcn" + strj;
					oJsonGlobalData.oTotal80DeclaredAmount += Number(newData[str]);
				}

			}

			// dataValidInt variable
			oJsonGlobalData.dataValidInt = dataValid;
			this.getOwnerComponent().getModel("globalData").setData(oJsonGlobalData);
		},

		onSave: function() {

			var dataArray = this.getOwnerComponent().getModel('sec80').getData();
			for (var i = 0; i < dataArray.length; i++) {
				delete dataArray[i].__metadata;
			}

			var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();

			if (oJsonGlobalData.dataValidInt < 0) {
				MessageBox.information("Input Amount can't be negative");
			} else if (oJsonGlobalData.dataValidInt === 0) {
				MessageBox.information("Input Amount can't be zero");
			} else {
				this._onSave80DataSet(dataArray);
			}
		},
		_onSave80DataSet: function(oData) {
			var oModel = this.getOwnerComponent().getModel();
			var oUrl = "/Tax80";
			oModel.create(oUrl, oData[0], {
					success: function(response) {
						MessageBox.information("The 80 data is saved");
					},
					error: function(error) {
						MessageBox.information("The 80 data is not saved");
					}
				}

			);
		}

	});

});