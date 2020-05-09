// ==UserScript==
// @name         YT LinkGrabber
// @namespace    YT
// @version      1.0.2
// @description  fk u
// @author       BogLev
// @require      http://code.jquery.com/jquery-3.5.1.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @downloadURL  https://github.com/syllent/YTLinkGrabber/raw/master/YT_LinkGrabber.js
// @updateURL	 https://github.com/syllent/YTLinkGrabber/raw/master/YT_LinkGrabber.js
// @match        https://*.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var $ = window.jQuery;
    var list = new Array();

    var fixedUI = document.createElement('DIV');
    fixedUI.class = 'LinkGrabberUI';
    fixedUI.style.position = 'fixed';
    fixedUI.style.right = '0';
    fixedUI.style.top = '70px';
    fixedUI.style.zIndex = 99999;
    document.body.appendChild(fixedUI);

    var UI = document.createElement('DIV');
    UI.class = 'LinkGrabberUI';
    UI.style.position = 'relative';
    UI.style.display = 'flex';
    UI.style.flexDirection = 'column';
    UI.style.alignItems = 'baseline';
    UI.style.justifyContent = 'flex-start';
    UI.style.width = '150px';
    UI.style.height = '100px';
    fixedUI.appendChild(UI);

    var tumblerContainer = document.createElement('DIV');
    tumblerContainer.class = 'LinkGrabberUI';
    tumblerContainer.style.position = 'relative';
    tumblerContainer.style.display = 'flex';
    tumblerContainer.style.flexDirection = 'row';
    tumblerContainer.style.alignItems = 'baseline';
    tumblerContainer.style.margin = '3px';
    UI.appendChild(tumblerContainer);

    var tumbler = document.createElement('INPUT');
    tumbler.type = 'checkbox';
    tumbler.id = 'tumbler';
    tumblerContainer.appendChild(tumbler);

    var tumblerLabel = document.createElement('LABEL');
    tumblerLabel.for = 'tumbler';
    tumblerLabel.style.fontSize = '15px';
    tumblerLabel.innerHTML = 'Выключено';
    tumblerContainer.appendChild(tumblerLabel);

    var copyButton = document.createElement('INPUT');
    copyButton.type = 'submit';
    copyButton.value = 'Скопировать';
    copyButton.style.margin = '3px';
    copyButton.style.width = '9em';
    copyButton.style.fontSize = '15px';
    copyButton.onclick = function(){
        var result = '';
        list.forEach(function(str) {
            result += str +'\n';
        });
        var tempResult = document.createElement('textarea');
        tempResult.value = result;
        tempResult.setAttribute('readonly', '');
        tempResult.show = false;
        UI.appendChild(tempResult);
        tempResult.select();
        document.execCommand('copy');
        UI.removeChild(tempResult);
        alert('Ссылки скопированы в буфер обмена:\n'+result);
    };
    copyButton.id = 'tumbler';

    $(document).on('keydown', function(e) {
        if (e.keyCode == 90 && e.ctrlKey) {
            var undo = list.pop();
            undo = undo.replace('https://www.youtube.com', "");
            var element = document.querySelectorAll('a[class="yt-simple-endpoint style-scope ytd-video-renderer"][href="'+undo+'"]')[0];
            element.removeAttribute('style');
        }
    });

    var control = false;
    $(document).on('keydown', function(e) {
        control = e.altKey;
        if (e.altKey && e.ctrlKey && e.shiftKey) {
            saveTextAsFile();
        }
    });

    $('#tumbler').bind('input', function() {
        if(tumbler.checked){
            tumblerLabel.innerHTML = 'Включено';
            UI.appendChild(copyButton);
            //yt-simple-endpoint style-scope ytd-video-renderer
            $('.ytd-video-renderer a').on('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                extractURL(this);
                var element = this;
                element.style.backgroundColor = 'red';
            });
        }else{
            tumblerLabel.innerHTML = 'Выключено';
            UI.removeChild(copyButton);
            $('.ytd-video-renderer a').off();
            list = [];
        }
    });

    function extractURL(element) {
        if(element.getAttribute('href')!= null){
            var href = 'https://www.youtube.com' + element.getAttribute('href');
            list.push(href);
            msgShow('Ссылка скопирована', true);
        }else{
            msgShow('Ссылка НЕ скопирована', false);
        }
    };
    function msgShow(msg, bool) {
        var element = document.createElement('P');
        element.class = 'msgGrabber';
        element.innerHTML = msg;
        element.style.fontSize = '14px';
        element.style.margin = '3px';
        element.style.zIndex = 99999;
        element.style.color = 'white';
        if(bool){
            element.style.backgroundColor = 'green';
        }else{
            element.style.backgroundColor = 'red';
        }
        UI.appendChild(element);
	    setTimeout(function(){
        	UI.removeChild(element);
        }, 500);
    };

    function saveTextAsFile()
    {
        var result = '';
        list.forEach(function(str) {
            result += str +'\n';
        });
        var textFileAsBlob = new Blob([result], {type:'text/plain'});
        var downloadLink = document.createElement("a");
        downloadLink.id = 'grabberLink';
        downloadLink.download = 'test';
        downloadLink.innerHTML = "Download File";
        downloadLink.style.fontSize = '20px';
        downloadLink.style.zIndex = 99999;
        if(window.webkitURL != null) {
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);// Chrome
        } else {
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);// Firefox
            downloadLink.onclick = document.body.removeChild(this);
        }
        downloadLink.click();
    }
})();
