// ==UserScript==
// @name         YT LinkGrabber
// @namespace    YT
// @version      1.1.2
// @description  easy copy links in yt
// @author       BogLev
// @require      http://code.jquery.com/jquery-3.5.1.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @downloadURL  https://github.com/syllent/YT-Tweaks/raw/master/YT-LinkGrabber.js
// @updateURL	 https://github.com/syllent/YT-Tweaks/raw/master/YT-LinkGrabber.js
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
    UI.style.width = '160px';
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
    copyButton.id = 'copyButton';
    copyButton.type = 'submit';
    copyButton.value = 'Скопировать';
    copyButton.style.margin = '3px';
    copyButton.style.width = '9em';
    copyButton.style.fontSize = '15px';
    copyButton.onclick = function(){
        copyToClipBoard();
    };

    var clearButton = document.createElement('INPUT');
    clearButton.id = 'clearButton';
    clearButton.type = 'submit';
    clearButton.value = 'Очистить';
    clearButton.style.margin = '3px';
    clearButton.style.width = '9em';
    clearButton.style.fontSize = '15px';
    clearButton.onclick = function(){
        clear();
    };

    var linkCounter = 0;
    var linkCountLabel = document.createElement('LABEL');
    linkCountLabel.style.fontSize = '15px';
    linkCountLabel.innerHTML = linkCounter;

    $(document).on('keydown', function(e) {
        if (e.keyCode == 90 && e.ctrlKey) {
            var undo = list.pop().replace('https://www.youtube.com', "");
            var element = document.querySelectorAll('a[class="yt-simple-endpoint style-scope ytd-video-renderer"][href="'+undo+'"]')[0];
            element.removeAttribute('style');
            msgShow('Отмена', 'pink');
        }
    });

    $(document).on('keydown', function(e) {
        if (e.keyCode == 67 && e.ctrlKey) {
            copyToClipBoard();
        }
    });

    $(document).on('keydown', function(e) {
        if (e.altKey && e.ctrlKey && e.shiftKey) {
            saveTextAsFile();
        }
    });

    $('#tumbler').bind('input', function() {
        if(tumbler.checked){
            UI.appendChild(copyButton);
            UI.appendChild(clearButton);
            UI.appendChild(linkCountLabel);
            //yt-simple-endpoint style-scope ytd-video-renderer
            $(document).on('scroll', function() {
                $('.ytd-video-renderer a').on('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    extractURL(this);
                    var element = this;
                    element.style.backgroundColor = 'red';
                });
            });
            $('.ytd-video-renderer a').on('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                extractURL(this);
                var element = this;
                element.style.backgroundColor = 'red';
            });
            tumblerLabel.innerHTML = 'Включено';
        }else{
            tumblerLabel.innerHTML = 'Выключено';
            UI.removeChild(copyButton);
            UI.removeChild(clearButton);
            UI.removeChild(linkCountLabel);
            $(document).off();
            $('.ytd-video-renderer a').off();
            clear();
            msgShow('Выключено', 'red');
        }
    });

    function extractURL(element) {
        if(element.getAttribute('href')!= null){
            var href = 'https://www.youtube.com' + element.getAttribute('href');
            if (!list.includes(href)){
                list.push(href);
                msgShow('Ссылка скопирована', 'green');
                linkCounter += 1;
                linkCountLabel.innerHTML = linkCounter;
            } else{
                msgShow('Ссылка УЖЕ скопирована', 'red');
            }
        }else{
            msgShow('Ссылка НЕ скопирована', 'red');
        }
    };
    function msgShow(msg, color) {
        var element = document.createElement('P');
        element.class = 'msgGrabber';
        element.innerHTML = msg;
        element.style.fontSize = '15px';
        element.style.margin = '3px';
        element.style.zIndex = 99999;
        element.style.color = 'white';
        element.style.backgroundColor = color;
        UI.appendChild(element);
	setTimeout(function(){
        	UI.removeChild(element);
        }, 500);
    };

    function clear(){
        list.forEach(function(entry) {
            var undo = entry.replace('https://www.youtube.com', "");
            var element = document.querySelectorAll('a[class="yt-simple-endpoint style-scope ytd-video-renderer"][href="'+undo+'"]')[0];
            element.removeAttribute('style');
        });
        list = [];
        linkCounter = 0;
        linkCountLabel.innerHTML = linkCounter;
        msgShow('Очищено', 'pink');
    }

    function copyToClipBoard() {
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
    }

    function saveTextAsFile() {
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
