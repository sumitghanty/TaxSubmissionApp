/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"com/infocus/app/fi/zTaxApprove/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/infocus/app/fi/zTaxApprove/test/integration/pages/App",
	"com/infocus/app/fi/zTaxApprove/test/integration/pages/Browser",
	"com/infocus/app/fi/zTaxApprove/test/integration/pages/Master",
	"com/infocus/app/fi/zTaxApprove/test/integration/pages/Detail",
	"com/infocus/app/fi/zTaxApprove/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.infocus.app.fi.zTaxApprove.view."
	});

	sap.ui.require([
		"com/infocus/app/fi/zTaxApprove/test/integration/NavigationJourneyPhone",
		"com/infocus/app/fi/zTaxApprove/test/integration/NotFoundJourneyPhone",
		"com/infocus/app/fi/zTaxApprove/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});