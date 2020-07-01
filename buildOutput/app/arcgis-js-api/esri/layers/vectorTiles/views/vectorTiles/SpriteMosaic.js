//>>built
define("require exports ./GeometryUtils ./Rect ./RectangleBinPack ../webgl/Texture".split(" "),function(u,v,q,r,m,t){return function(){function e(a,b,c){void 0===c&&(c=0);this._size=[];this._mosaicsData=[];this._textures=[];this._dirties=[];this._pageHeight=this._pageWidth=this._currentPage=this._maxItemSize=0;this._mosaicRects={};this.pixelRatio=1;(0>=a||0>=b)&&console.error("Sprites mosaic defaultWidth and defaultHeight must be greater than zero!");this._pageWidth=a;this._pageHeight=b;0<c&&(this._maxItemSize=
c);this._binPack=new m(a-4,b-4)}return e.prototype.getWidth=function(a){return a>=this._size.length?-1:this._size[a][0]},e.prototype.getHeight=function(a){return a>=this._size.length?-1:this._size[a][1]},e.prototype.setSpriteSource=function(a){if(this.dispose(),this.pixelRatio=a.devicePixelRatio,0===this._mosaicsData.length){this._binPack=new m(this._pageWidth-4,this._pageHeight-4);var b=new Uint32Array(Math.floor(this._pageWidth)*Math.floor(this._pageHeight));this._mosaicsData[0]=b;this._dirties.push(!0);
this._size.push([this._pageWidth,this._pageHeight]);this._textures.push(void 0)}this._sprites=a},e.prototype.getSpriteItem=function(a,b){void 0===b&&(b=!1);var c=this._mosaicRects[a];if(c)return c;if(!this._sprites||"loaded"!==this._sprites.loadStatus)return null;var d=this._sprites.getSpriteInfo(a);if(!d||!d.width||!d.height||0>d.width||0>d.height)return null;var e=d.width,h=d.height,g=this._allocateImage(e,h),f=g[0],l=g[1],g=g[2];return 0>=f.width?null:(this._copy(f,d,l,g,b),c={rect:f,width:e,height:h,
anchorX:0,anchorY:0,sdf:d.sdf,pixelRatio:d.pixelRatio,page:l},this._mosaicRects[a]=c,c)},e.prototype.preloadSpriteItems=function(){for(var a=0,b=this._sprites.spriteNames;a<b.length;a++)this.getSpriteItem(b[a],!0)},e.prototype.getSpriteItems=function(a){for(var b={},c=0;c<a.length;c++){var d=a[c];b[d]=this.getSpriteItem(d)}return b},e.prototype.getMosaicItemPosition=function(a,b){b=(a=this.getSpriteItem(a,b))&&a.rect;if(!b)return null;b.width=a.width;b.height=a.height;return{size:[a.width,a.height],
tl:[(b.x+2)/this._size[a.page][0],(b.y+2)/this._size[a.page][1]],br:[(b.x+2+a.width)/this._size[a.page][0],(b.y+2+a.height)/this._size[a.page][1]],page:a.page}},e.prototype.bind=function(a,b,c,d){void 0===c&&(c=0);void 0===d&&(d=0);this._textures[c]||(this._textures[c]=new t(a,{pixelFormat:6408,dataType:5121,width:this._size[c][0],height:this._size[c][1]},new Uint8Array(this._mosaicsData[c].buffer)));var e=this._textures[c];e.setSamplingMode(b);this._dirties[c]&&e.setData(new Uint8Array(this._mosaicsData[c].buffer));
a.bindTexture(e,d);this._dirties[c]=!1},e._copyBits=function(a,b,c,d,e,h,g,f,l,n,k){var p=d*b+c;g=f*h+g;if(k)for(g-=h,k=-1;k<=n;k++,p=((k+n)%n+d)*b+c,g+=h)for(f=-1;f<=l;f++)e[g+f]=a[p+(f+l)%l];else for(k=0;k<n;k++){for(f=0;f<l;f++)e[g+f]=a[p+f];p+=b;g+=h}},e.prototype._copy=function(a,b,c,d,m,h){if(this._sprites&&"loaded"===this._sprites.loadStatus&&!(c>=this._mosaicsData.length)){var g=new Uint32Array(h?h.buffer:this._sprites.image.buffer),f=this._mosaicsData[c];f&&g||console.error("Source or target images are uninitialized!");
e._copyBits(g,h?b.width:this._sprites.width,b.x,b.y,f,d[0],a.x+2,a.y+2,b.width,b.height,m);this._dirties[c]=!0}},e.prototype._allocateImage=function(a,b){a+=2;b+=2;var c=Math.max(a,b);if(this._maxItemSize&&this._maxItemSize<c){var c=Math.pow(2,Math.ceil(q.log2(a))),d=Math.pow(2,Math.ceil(q.log2(b)));a=new r(0,0,a,b);return this._mosaicsData.push(new Uint32Array(c*d)),this._dirties.push(!0),this._size.push([c,d]),this._textures.push(void 0),[a,this._mosaicsData.length-1,[c,d]]}c=a%4?4-a%4:4;d=b%4?
4-b%4:4;1===c&&(c=5);1===d&&(d=5);c=this._binPack.allocate(a+c,b+d);return 0>=c.width?(this._dirties[this._currentPage]||(this._mosaicsData[this._currentPage]=null),this._currentPage=this._mosaicsData.length,this._mosaicsData.push(new Uint32Array(this._pageWidth*this._pageHeight)),this._dirties.push(!0),this._size.push([this._pageWidth,this._pageHeight]),this._textures.push(void 0),this._binPack=new m(this._pageWidth-4,this._pageHeight-4),this._allocateImage(a,b)):[c,this._currentPage,[this._pageWidth,
this._pageHeight]]},e.prototype.dispose=function(){this._binPack=null;this._mosaicRects={};for(var a=0,b=this._textures;a<b.length;a++){var c=b[a];c&&c.dispose()}this._textures.length=0},e}()});