/*global location */
sap.ui.define([
	"com/infocus/app/fi/zTaxApprove/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/infocus/app/fi/zTaxApprove/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/ui/core/Core",
	"sap/m/MessageToast",
], function(BaseController, JSONModel, formatter, Filter, FilterOperator, MessageBox, Dialog, Button, mobileLibrary, Label, Text,
	TextArea, Core, MessageToast) {
	"use strict";
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	return BaseController.extend("com.infocus.app.fi.zTaxApprove.controller.Detail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0
			});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = this.getModel("detailView");

			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("detailView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("TaxHeaderSet", {
					personnelNo: sObjectId
				});
				var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
				oJsonGlobalData.selectedPernr = sObjectId;
				this.getOwnerComponent().getModel("globalData").setData(oJsonGlobalData);
				this._bindView("/" + sObjectPath);
				this._getTaxSection80CData(sObjectId);
				this._getTaxSection80Data(sObjectId);
				this._getTaxHousePropertyData(sObjectId);
				this._getTaxHouseRentAllowanceData(sObjectId);
				this._getTaxOtherSourcesData(sObjectId);
				this._getTaxPreviousEmploymentData(sObjectId);
			}.bind(this));
		},

		_getTaxHousePropertyData: function(perId) {
			this.getModel().metadataLoaded().then(function() {
				var that = this;
				var oUrl = "/TaxHousePropertySet";
				var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
				var oPernerFilter = new Filter("personnelNo", sap.ui.model.FilterOperator.EQ, perId);
				var oFiscalYearFilter = new Filter("fiscalYear", sap.ui.model.FilterOperator.EQ, oJsonGlobalData.selectedYear);
				this.getModel().read(oUrl, {
					filters: [oPernerFilter, oFiscalYearFilter],
					success: function(response) {
						var data = response.results;
						var oTaxHousePropertyModel = that.getOwnerComponent().getModel("HouseProperty");
						oTaxHousePropertyModel.setData(data);
					},
					error: function(error) {}
				});

			}.bind(this));
		},
		_getTaxHouseRentAllowanceData: function(perId) {
			this.getModel().metadataLoaded().then(function() {
				var that = this;
				var oUrl = "/TaxHouseRentAllowanceSet";
				var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
				var oPernerFilter = new Filter("personnelNo", sap.ui.model.FilterOperator.EQ, perId);
				var oFiscalYearFilter = new Filter("fiscalYear", sap.ui.model.FilterOperator.EQ, oJsonGlobalData.selectedYear);
				this.getModel().read(oUrl, {
					filters: [oPernerFilter, oFiscalYearFilter],
					success: function(response) {
						var data = response.results;
						var oTaxHouseRentAllowanceModel = that.getOwnerComponent().getModel("HRA");
						oTaxHouseRentAllowanceModel.setData(data);
					},
					error: function(error) {}
				});

			}.bind(this));
		},
		_getTaxOtherSourcesData: function(perId) {
			this.getModel().metadataLoaded().then(function() {
				var that = this;
				var oUrl = "/TaxOtherSourcesSet";
				var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
				var oPernerFilter = new Filter("personnelNo", sap.ui.model.FilterOperator.EQ, perId);
				var oFiscalYearFilter = new Filter("fiscalYear", sap.ui.model.FilterOperator.EQ, oJsonGlobalData.selectedYear);
				this.getModel().read(oUrl, {
					filters: [oPernerFilter, oFiscalYearFilter],
					success: function(response) {
						var data = response.results;
						var oTaxOtherSourcesModel = that.getOwnerComponent().getModel("OtherSources");
						oTaxOtherSourcesModel.setData(data);
					},
					error: function(error) {}
				});

			}.bind(this));
		},
		_getTaxPreviousEmploymentData: function(perId) {
			this.getModel().metadataLoaded().then(function() {
				var that = this;
				var oUrl = "/TaxPreviousEmploymentSet";
				var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
				var oPernerFilter = new Filter("personnelNo", sap.ui.model.FilterOperator.EQ, perId);
				var oFiscalYearFilter = new Filter("fiscalYear", sap.ui.model.FilterOperator.EQ, oJsonGlobalData.selectedYear);
				this.getModel().read(oUrl, {
					filters: [oPernerFilter, oFiscalYearFilter],
					success: function(response) {
						var data = response.results;
						var oTaxPreviousEmploymentModel = that.getOwnerComponent().getModel("PreviousEmployement");
						oTaxPreviousEmploymentModel.setData(data);
					},
					error: function(error) {}
				});

			}.bind(this));
		},
		_getTaxSection80Data: function(perId) {
			this.getModel().metadataLoaded().then(function() {
				var that = this;
				var oUrl = "/Tax80Set";
				var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
				var oPernerFilter = new Filter("Pernr", sap.ui.model.FilterOperator.EQ, perId);
				var oFiscalYearFilter = new Filter("Fiscal", sap.ui.model.FilterOperator.EQ, oJsonGlobalData.selectedYear);
				this.getModel().read(oUrl, {
					filters: [oPernerFilter, oFiscalYearFilter],
					success: function(response) {
						var data = response.results;
						var oSection80Model = that.getOwnerComponent().getModel("sec80");
						oSection80Model.setData(data);
					},
					error: function(error) {}
				});

			}.bind(this));
		},
		_getTaxSection80CData: function(perId) {
			this.getModel().metadataLoaded().then(function() {
				var that = this;
				var oUrl = "/TAX_80CSet";
				var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
				var oPernerFilter = new Filter("EmpNo", sap.ui.model.FilterOperator.EQ, perId);
				var oFiscalYearFilter = new Filter("Fiscal", sap.ui.model.FilterOperator.EQ, oJsonGlobalData.selectedYear);
				this.getModel().read(oUrl, {
					filters: [oPernerFilter, oFiscalYearFilter],
					success: function(response) {
						var data = response.results;
						var oSection80CModel = that.getOwnerComponent().getModel("sec80c");
						oSection80CModel.setData(data);
					},
					error: function(error) {}
				});

			}.bind(this));
		},
		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function(sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.personnelNo,
				sObjectName = oObject.name,
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		_onMetadataLoaded: function() {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},
		onApprove: function(oEvent) {
			var that = this;
			if (!this.oApproveDialog) {
				this.oApproveDialog = new Dialog({
					type: DialogType.Message,
					title: "Confirm",
					content: new Text({
						text: "Do you want to submit this order?"
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Submit",
						press: function() {
							that.onSubmitApproveReject(oEvent, "", "X");
							this.oApproveDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function() {
							this.oApproveDialog.close();
						}.bind(this)
					})
				});
			}

			this.oApproveDialog.open();

		},

		onReject: function(oldEvent) {
			var that = this;
			if (!this.oSubmitDialog) {
				this.oSubmitDialog = new Dialog({
					type: DialogType.Message,
					title: "Confirm",
					content: [
						new Label({
							text: "Do you want to submit this order?",
							labelFor: "submissionNote"
						}),
						new TextArea("submissionNote", {
							width: "100%",
							placeholder: "Add note (required)",
							liveChange: function(oEvent) {
								var sText = oEvent.getParameter("value");
								this.oSubmitDialog.getBeginButton().setEnabled(sText.length > 0);
							}.bind(this)
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Submit",
						enabled: false,
						press: function() {
							var sText = Core.byId("submissionNote").getValue();
							that.onSubmitApproveReject(oldEvent, sText, "");
							this.oSubmitDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function() {
							this.oSubmitDialog.close();
						}.bind(this)
					})
				});
			}

			this.oSubmitDialog.open();
		},
		onRejectWithoutCompulsoryMessage: function(oEvent) {
			var that = this;

			if (!this.oRejectDialog) {
				this.oRejectDialog = new Dialog({
					title: "Reject",
					type: DialogType.Message,
					content: [
						new Label({
							text: "Do you want to reject this order?",
							labelFor: "rejectionNote"
						}),
						new TextArea("rejectionNote", {
							width: "100%",
							placeholder: "Add note (optional)"
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Reject",
						press: function() {
							var sText = Core.byId("rejectionNote").getValue();
							//MessageToast.show("Note is: " + sText);
							that.onSubmitApproveReject(oEvent, sText);
							this.oRejectDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function() {
							this.oRejectDialog.close();
						}.bind(this)
					})
				});
			}

			this.oRejectDialog.open();
		},

		onSubmitApproveReject: function(oEvent, sText, flagX) {
			var that = this;
			this.getModel().metadataLoaded().then(function() {
				var that = this;
				var oUrl = "/TaxHeaderSet";
				var oJsonGlobalData = this.getOwnerComponent().getModel("globalData").getData();
				var postData = {
					"personnelNo": oJsonGlobalData.selectedPernr,
					"fiscalYear": oJsonGlobalData.selectedYear,
					"app_ind": flagX,
					"remarks": sText
				};

				this.getModel().create(oUrl, postData, {
					success: function(response) {
						//MessageBox.information("The response is saved");
						that.getOwnerComponent().oListSelector;
						MessageToast.show("The response is saved");
					},
					error: function(error) {
						//MessageBox.information("The response connot be saved");
						MessageToast.show("The response connot be saved");
					}
				});

			}.bind(this));
		}

	});

});