sap.ui.define([
	"com/infocus/app/fi/zTaxApprove/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter"
], function(BaseController, Fragment, MessageBox, MessageToast, Filter) {
	"use strict";

	return BaseController.extend("com.infocus.app.fi.zTaxApprove.controller.tax.Tax80C", {

		onInit: function() {
			//	var oRouter = this.getRouter();

			//	oRouter.getRoute("appHome").attachMatched(this._onRouteMatched, this);

			//this._formFragments = {};
			//this._showFormFragment("ChangeTax80C");
			this._initialDisplay();
			this.getOwnerComponent().getEventBus().subscribe("Default", "get80CData", () => {
				this._onRead80CDataSet();
			});
			//this._onRead80CDataSet();

		},
		onAfterRenderer: function() {

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

			//Clone the data
			//this._oSupplier = Object.assign({}, this.getView().getModel().getData().SupplierCollection[0]);
			this._toggleButtonsAndView(true);

		},
		handleCancelPress: function() {

			//Restore the data
			/*var oModel = this.getView().getModel();
			var oData = oModel.getData();

			oData.SupplierCollection[0] = this._oSupplier;

			oModel.setData(oData);*/
			this._toggleButtonsAndView(false);

		},
		handleSavePress: function() {
			this.onSave();
			this._toggleButtonsAndView(false);

		},
		_toggleButtonsAndView: function(bEdit) {
			var oView = this.getView();

			// Show the appropriate action buttons
			oView.byId("edit").setVisible(!bEdit);
			oView.byId("save").setVisible(bEdit);
			oView.byId("cancel").setVisible(bEdit);
			// Set the right form type
			//this._showFormFragment(bEdit ? "ChangeTax80C" : "DisplayTax80C");
			this.byId("editItemId").setVisible(bEdit);
			this.byId("displayItemId").setVisible(!bEdit);
		},

		_showFormFragment: function(sFragmentName) {
			var oPage = this.byId("Page80C");
			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},

		_getFormFragment: function(sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];
			if (oFormFragment) {
				return oFormFragment;
			}
			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.demo.nav.view.employee.tax.tax80c." + sFragmentName);
			this._formFragments[sFragmentName] = oFormFragment;
			return this._formFragments[sFragmentName];
		},
		_onRead80CDataSet: function() {
			var that = this;
			var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();

			var oModel = this.getOwnerComponent().getModel();
			//var oPernerFilter = new Filter("EmpNo", sap.ui.model.FilterOperator.EQ, oJsonGlobalData.userId);
			//var oPernerFilter = new sap.ui.model.Filter("EmpNo", sap.ui.model.FilterOperator.EQ, "1000");
			var oFiscalYearFilter = new sap.ui.model.Filter("Fiscal", sap.ui.model.FilterOperator.EQ, oJsonGlobalData.selectedYear);
			//var oFiscalYearFilter = new Filter("Fiscal", sap.ui.model.FilterOperator.EQ, "2022-2023");
			var oUrl = "/TAX_80CSet";

			oModel.read(oUrl, {
				filters: [oFiscalYearFilter],
				success: function(response) {
					var data = response.results;
					var oTotal80CAmout = 0;
					var oJsonSec80cModel = that.getOwnerComponent().getModel('sec80c');
					oJsonSec80cModel.setData(data);

					for (var i = 0; i < data.length; i++) {
						oTotal80CAmout += Number(data[i].PcnAmount);
					}
					oJsonGlobalData.oTotal80CAmountDeclared = oTotal80CAmout;
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

			var oData = this.getOwnerComponent().getModel('sec80c').getData();
			var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			oJsonGlobalData.oTotal80CAmountDeclared = 0;
			for (var i = 0; i < oData.length; i++) {
				oJsonGlobalData.oTotal80CAmountDeclared += Number(oData[i].PcnAmount);
			}

			// dataValidInt variable
			oJsonGlobalData.dataValidInt = dataValid;
			this.getOwnerComponent().getModel("globalData").setData(oJsonGlobalData);
			//this.totalDeclaredAmount += Number(oEvent.getSource().getValue());
		},

		onSave: function() {
			var dataArray = this.getOwnerComponent().getModel('sec80c').getData();
			for (var i = 0; i < dataArray.length; i++) {
				delete dataArray[i].__metadata;
			}

			var odata = {
				"EmpNo": dataArray[0].EmpNo,
				"ToEmp": dataArray
			};
			

			// validation logic
			var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			if (oJsonGlobalData.dataValidInt < 0) {
				MessageBox.information("Input Amount can't be negative");
			} else if(oJsonGlobalData.dataValidInt === 0){
			    MessageBox.information("Input Amount can't be zero");
			}else if( oJsonGlobalData.oTotal80CAmountDeclared < 0){
			   MessageBox.information("Total Amount can't be negative"); 
			}else if( oJsonGlobalData.oTotal80CAmountDeclared === 0){
			   MessageBox.information("Total Amount can't be Zero"); 
			}else{
			    this._onSave80CDataSet(odata);
			}

		},

		_onSave80CDataSet: function(oData) {
			var oModel = this.getOwnerComponent().getModel();
			var oUrl = "/EmpDummySet";
			//var oPernerFilter = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, '1000');
			//var oFiscalYearFilter = new sap.ui.model.Filter("Fiscal", sap.ui.model.FilterOperator.EQ, '2022-2023');
			oModel.create(oUrl, oData, {
					success: function(response) {
						MessageBox.information("The 80c data is saved");
					},
					error: function(error) {
						MessageBox.information("The 80c data is not saved");
					}
				}

			);
		}

	});

});