//>>built
define("dojo dijit dijit/_editor/_Plugin jimu/dijit/ImageChooser dojo/_base/html dojo/_base/connect dojo/_base/declare dojox/form/FileUploader dijit/_editor/_Plugin".split(" "),function(d,h,g,c,b){d.experimental("dojox.editor.plugins.ChooseImage");var f=d.declare("dojox.editor.plugins.ChooseImage",g,{tempImageUrl:"",iconClassPrefix:"editorIcon",useDefaultCommand:!1,uploadUrl:"",button:null,label:"Upload",setToolbar:function(a){this.button.destroy();this.createFileInput();a.addChild(this.button)},
_initButton:function(){this.command="chooseImage";this.editor.commands[this.command]="Upload Image";this.inherited("_initButton",arguments);delete this.command},updateState:function(){for(var a,e=0,d=this.editor._plugins.length;e<d;e++){var c=this.editor._plugins[e];if("dojoxEditorUploadNorm"===c.button.baseClass){a=c;break}}!0===this.get("disabled")?(b.addClass(this.button.domNode,"dijitButtonDisabled"),b.setStyle(this.button.mask,"cursor","inherit"),a&&b.addClass(a.button.domNode,"dijitButtonDisabled"),
this.button.disableChooseImage()):(b.removeClass(this.button.domNode,"dijitButtonDisabled"),b.setStyle(this.button.mask,"cursor","pointer"),a&&b.removeClass(a.button.domNode,"dijitButtonDisabled"),this.button.enableChooseImage())},createFileInput:function(){var a=d.create("span",{innerHTML:"."},document.body);d.style(a,{width:"40px",height:"20px",paddingLeft:"8px",paddingRight:"8px"});this.button=new c({showSelfImg:!1,cropImage:!1,format:[c.GIF,c.JPEG,c.PNG]},a);b.setStyle(this.button.domNode,{width:"29px",
height:"24px",top:0,position:"absolute"});window.isRTL?b.setStyle(this.button.domNode,"left","391px"):b.setStyle(this.button.domNode,"right","387px");this.connect(this.button,"onImageChange","insertTempImage")},onComplete:function(a){a=a[0];var b=d.byId(this.currentImageId,this.editor.document),c;c=this.downloadPath?this.downloadPath+a.name:a.file;b.src=c;d.attr(b,"_djrealurl",c);a.width&&(b.width=a.width,b.height=a.height)},insertTempImage:function(a){this.currentImageId="img_"+(new Date).getTime();
this.editor.execCommand("inserthtml",'\x3cimg id\x3d"'+this.currentImageId+'" src\x3d"'+a+'" /\x3e')}});d.subscribe(h._scopeName+".Editor.getPlugin",null,function(a){if(!a.plugin)switch(a.args.name){case "chooseImage":a.plugin=new f({url:a.args.url})}});g.registry.chooseImage=function(a){return new f(a)};return f});