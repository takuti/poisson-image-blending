// http://jsdo.it/Yukisuke/p311

/*
Base64toBlob
return:blob blobオブジェクト
param0:string base64エンコーディングされた文字列

support(たぶん)
    Chrome 7+
    Firefox(Gecko)4(2)+
    Internet Explorer 10+
    Opera 11.6+
    Safari 5.1+
*/
function Base64toBlob(_base64)
{
    var i;
    var tmp = _base64.split(',');
    var data = atob(tmp[1]);
	var mime = tmp[0].split(':')[1].split(';')[0];

    //var buff = new ArrayBuffer(data.length);
    //var arr = new Uint8Array(buff);
	var arr = new Uint8Array(data.length);
	for (i = 0; i < data.length; i++) {arr[i] = data.charCodeAt(i);}
	var blob = new Blob([arr], { type: mime });
    return blob;
}

/**
saveBlob
param0:blob blobオブジェクト
param1:string デフォルトのダウンロードファイル名

@support (たぶん)
    Chrome 8+
    Firefox(Gecko) 4+
    Internet Explorer 10+
    Opera 12+
    Safari(WebKit) Nightly build
**/
function saveBlob(_blob,_file)
{
    if( /*@cc_on ! @*/ false )
    {   // IEの場合
        window.navigator.msSaveBlob(_blob, _file);
    }
    else
    {
        var url = (window.URL || window.webkitURL);
        var data = url.createObjectURL(_blob);
        var e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        var a = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
        a.href = data;
        a.download = _file;
        a.dispatchEvent(e);
    }
}

/*
ArraytoBlob
return:blob blobオブジェクト
param0:string mime
param1:array byte配列データ

support(たぶん)
    Chrome 7+
    Firefox(Gecko)4(2)+
    Internet Explorer 10+
    Opera 11.6+
    Safari 5.1+
*/
function ArraytoBlob(_mime,_array)
{
    // ArrayBufferやUint8Arrayなら入れなおす工数がなくなります
    var arr = new Uint8Array(_array.length);
    for (var i = 0; i < _array.length; i++) {arr[i] = _array[i];}

    var blob = new Blob([arr], { type: _mime });
    return blob;
}
