//>>built
require({cache:{"url:widgets/HucNavigation/setting/LayerSearchSymEdit.html":'\x3cdiv style\x3d"width:100%;"\x3e\r\n  \x3ctable class\x3d"input-table" style\x3d"width:100%;" cellspacing\x3d"0"\x3e\r\n    \x3ctbody\x3e\r\n      \x3ctr\x3e\r\n        \x3ctd style\x3d"width:155px;text-align:left;"\x3e\r\n          \x3cdiv class\x3d"help-icon" style\x3d"width:20px;height:20px;padding-left:5px; margin-left:8px;" title\x3d"${nls.symbologyTooltip}"\x3e\x3cspan\x3e?\x3c/span\x3e\r\n          \x3c/div\x3e\r\n        \x3c/td\x3e\r\n      \x3c/tr\x3e\r\n      \x3ctr data-dojo-attach-point\x3d"PointSymbolRow"\x3e\r\n        \x3ctd style\x3d"width:115px;text-align:left;vertical-align:top;"\x3e${nls.pointSymbol}\x3c/td\x3e\r\n        \x3ctd style\x3d"width:auto;"\x3e\r\n          \x3cdiv data-dojo-attach-point\x3d"defaultPointSymbolPicker" data-dojo-type\x3d"jimu/dijit/SymbolPicker"\x3e\x3c/div\x3e\r\n        \x3c/td\x3e\r\n      \x3c/tr\x3e\r\n      \x3ctr data-dojo-attach-point\x3d"LineSymbolRow"\x3e\r\n        \x3ctd style\x3d"width:115px;text-align:left;vertical-align:top;"\x3e${nls.lineSymbol}\x3c/td\x3e\r\n        \x3ctd colspan\x3d"2" style\x3d"width:auto;"\x3e\r\n          \x3cdiv data-dojo-attach-point\x3d"defaultLineSymbolPicker" data-dojo-type\x3d"jimu/dijit/SymbolPicker"\x3e\x3c/div\x3e\r\n        \x3c/td\x3e\r\n      \x3c/tr\x3e\r\n      \x3ctr data-dojo-attach-point\x3d"PolySymbolRow"\x3e\r\n        \x3ctd style\x3d"width:115px;text-align:left;vertical-align:top;"\x3e${nls.polySymbol}\x3c/td\x3e\r\n        \x3ctd colspan\x3d"2" style\x3d"width:auto;"\x3e\r\n          \x3cdiv data-dojo-attach-point\x3d"defaultPolySymbolPicker" data-dojo-type\x3d"jimu/dijit/SymbolPicker"\x3e\x3c/div\x3e\r\n        \x3c/td\x3e\r\n      \x3c/tr\x3e\r\n    \x3c/tbody\x3e\r\n  \x3c/table\x3e\r\n\x3c/div\x3e\r\n'}});
define("dojo/_base/declare dojo/_base/lang dojo/_base/html dojo/on dojo/json jimu/dijit/SymbolPicker jimu/dijit/TabContainer esri/symbols/jsonUtils esri/symbols/SimpleMarkerSymbol esri/symbols/PictureMarkerSymbol esri/symbols/SimpleLineSymbol esri/symbols/CartographicLineSymbol esri/symbols/SimpleFillSymbol dijit/_WidgetBase dijit/_TemplatedMixin dijit/_WidgetsInTemplateMixin dojo/text!./LayerSearchSymEdit.html dojo/dom-style".split(" "),function(f,d,m,e,n,p,q,c,r,t,u,v,w,g,h,k,l,b){return f([g,h,
k],{baseClass:"eSearch-layer-symbol-setting",templateString:l,nls:null,config:null,searchSetting:null,_sym:null,widget:null,geomType:null,postCreate:function(){this.inherited(arguments);this.own(e(this.defaultPointSymbolPicker,"change",d.hitch(this,this._onPointSymbolChange)));this.own(e(this.defaultLineSymbolPicker,"change",d.hitch(this,this._onLineSymbolChange)));this.own(e(this.defaultPolySymbolPicker,"change",d.hitch(this,this._onPolySymbolChange)));this.setConfig(this.config)},startup:function(){this.inherited(arguments)},
setConfig:function(a){if(this.config=a)this._sym=this.config.symbology,"esriGeometryPoint"===this.geomType&&(b.set(this.PointSymbolRow,"display","table-row"),b.set(this.PolySymbolRow,"display","none"),b.set(this.LineSymbolRow,"display","none"),this._sym&&"esriPMS"===this._sym.type&&(a=d.clone(this._sym),a.url=this.widget.folderUrl+a.url,this.defaultPointSymbolPicker.showBySymbol(c.fromJson(a))),this._sym&&"esriSMS"===this._sym.type&&this.defaultPointSymbolPicker.showBySymbol(c.fromJson(this._sym)),
this._sym||this.defaultPointSymbolPicker.showByType("marker")),"esriGeometryPolyline"===this.geomType&&(b.set(this.PointSymbolRow,"display","none"),b.set(this.PolySymbolRow,"display","none"),b.set(this.LineSymbolRow,"display","table-row"),this._sym?this.defaultLineSymbolPicker.showBySymbol(c.fromJson(this._sym)):this.defaultLineSymbolPicker.showByType("line")),"esriGeometryPolygon"===this.geomType&&(b.set(this.PointSymbolRow,"display","none"),b.set(this.PolySymbolRow,"display","table-row"),b.set(this.LineSymbolRow,
"display","none"),this._sym?this.defaultPolySymbolPicker.showBySymbol(c.fromJson(this._sym)):this.defaultPolySymbolPicker.showByType("fill"))},_cloneSymbol:function(a){if(!a)return null;a=a.toJson();return c.fromJson(a)},getConfig:function(){return this.config=this._sym},_onPointSymbolChange:function(a){this._sym=a.toJson()},_onLineSymbolChange:function(a){"simplelinesymbol"==a.type&&(this._sym=a.toJson())},_onPolySymbolChange:function(a){"simplefillsymbol"==a.type&&(this._sym=a.toJson())}})});