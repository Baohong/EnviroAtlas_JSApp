//>>built
define("dojo/_base/declare dijit/_WidgetBase dojo/_base/lang dojo/_base/array dojo/_base/html dojo/on dojo/Evented jimu/utils".split(" "),function(f,g,b,h,a,e,k,l){return f([g,k],{"class":"esearch-add-field-button",initialized:!1,constructor:function(){this.state="closed"},postCreate:function(){this.btnNode=a.create("div",{"class":"esearch-add-field-icon-btn"},this.domNode);this.btnNode2=a.create("div",{"class":"plus-sign",style:"margin-top:8px;"},this.btnNode);this.own(e(this.btnNode,"click",b.hitch(this,
this._onBtnClick)));this.box||(this.box=this.domNode.parentNode);this.own(e(this.domNode.parentNode.parentNode,"click",b.hitch(this,function(){this.dropMenuNode&&this.closeDropMenu()})))},_onBtnClick:function(a){a.stopPropagation();this.dropMenuNode||this._createDropMenuNode();"closed"===this.state?this.openDropMenu():this.closeDropMenu()},_createDropMenuNode:function(){this.dropMenuNode=a.create("div",{"class":"drop-menu",style:{display:"none"}},this.domNode);this.items||(this.items=[]);h.forEach(this.items,
function(c){var d;c.key?(d=a.create("div",{"class":"menu-item",itemId:c.key,innerHTML:c.label},this.dropMenuNode),this.own(e(d,"click",b.hitch(this,function(){this.selectItem(c)})))):a.create("hr",{"class":"menu-item-line"},this.dropMenuNode)},this)},_getDropMenuPosition:function(){a.getContentBox(this.box);var c=a.getMarginBox(this.btnNode),d=a.getMarginBox(this.dropMenuNode),b={};b.top=d.t-(this.initialized?0:c.h);b.right=75;this.initialized=!0;return b},selectItem:function(a){this.closeDropMenu();
this.emit("onMenuClick",a)},openDropMenu:function(){this.state="opened";a.setStyle(this.dropMenuNode,"display","");a.setStyle(this.dropMenuNode,l.getPositionStyle(this._getDropMenuPosition()));this.emit("onOpenMenu")},closeDropMenu:function(){this.state="closed";a.setStyle(this.dropMenuNode,"display","none");this.emit("onCloseMenu")}})});