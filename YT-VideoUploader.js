// ==UserScript==
// @name         YT VideoUploader
// @namespace    YT
// @version      1.0.1
// @description  fk u
// @author       BogLev
// @require      http://code.jquery.com/jquery-3.5.1.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @downloadURL  https://github.com/syllent/YT-Tweaks/raw/master/YT-VideoUploader.js
// @updateURL	 https://github.com/syllent/YT-Tweaks/raw/master/YT-VideoUploader.js
// @match        https://*.youtube.com/*
// @match        https://www.random.org/
// @grant        window.close
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';
    var $ = window.jQuery;

    var fixedUI = document.createElement('DIV');
    fixedUI.class = 'YTUI';
    fixedUI.style.position = 'fixed';
    fixedUI.style.right = '0';
    fixedUI.style.top = '70px';
    fixedUI.style.zIndex = 99999;
    document.body.appendChild(fixedUI);

    var UI = document.createElement('DIV');
    UI.class = 'VideoUploaderUI';
    UI.style.position = 'relative';
    UI.style.display = 'flex';
    UI.style.flexDirection = 'column';
    UI.style.alignItems = 'baseline';
    UI.style.justifyContent = 'flex-start';
    UI.style.width = '160px';
    UI.style.height = '100px';
    fixedUI.appendChild(UI);

    var chanelTextArea = document.createElement('TEXTAREA');
    chanelTextArea.id = 'name-channel-text-area';
    chanelTextArea.name = 'name-channel';;
    chanelTextArea.maxLength = '5000';
    chanelTextArea.cols = '15';
    chanelTextArea.rows = '3';
    UI.appendChild(chanelTextArea);
    $(chanelTextArea).hide();

    var startButton = document.createElement('INPUT');
    startButton.id = 'YT-Tweak-startUploadingButton';
    startButton.type = 'submit';
    startButton.value = 'test';
    startButton.style.margin = '3px';
    startButton.style.width = '9em';
    startButton.style.fontSize = '15px';
    startButton.onclick = function(){
        videoInfoChanger();
    };
    UI.appendChild(startButton);


    var windowTitle;
    var count = 0;
    var windowFocus = false;
    var uploadDone =false;
    window.onfocus = function() { windowFocus = true; };
    window.onblur = function() { windowFocus = false; };

    $(document).ready(function() {
        if(document.URL.includes('https://www.random.org/')){
            window.open('https://www.youtube.com/channel_switcher?next=%2Faccount&feature=settings', '_self');
        }
        else if(document.URL.includes('https://www.youtube.com/channel_switcher?next=%2Faccount&feature=settings')){
            $(chanelTextArea).show();
            setTimeout(function() {
                var title = document.title;
                chanelTextArea.focus();
                document.title = 'CHANNEL';
                setTimeout(function() {document.title = title;}, 1000);
                $(chanelTextArea).on('input', function() {
                    var href = 'https://www.youtube.com' +
                        $('div.page-info-name:contains("'+chanelTextArea.value+'")')
                            .closest('a')
                                .attr('href');
                    setTimeout(function() {
                        window.open(href, '_self');
                    }, 500);
                });
           }, 200);
        }
        else if(document.URL.includes('https://www.youtube.com/account')) {
            for (var i = 0; i < 2; i++) {
                window.open('https://www.youtube.com/upload', '_blank');
            }
            window.open('https://www.youtube.com/upload', '_self');
        }
        else if(document.URL.includes('https://studio.youtube.com/channel/')) {
            try {
                setTimeout(function(){
                    clickQuery('ytcp-button.style-scope.ytcp-uploads-file-picker');
                }, 1000);
            } catch (error) {
                console.error(error);
            }
            var count = 1;
            $(document).on('DOMNodeInserted', function (e) {
                if(e.target.tagName=='PAPER-DIALOG' && e.target.className=='style-scope ytcp-uploads-mini-indicator' && count++==1){
                    if (windowFocus) {
                        $('span.count.style-scope.ytcp-uploads-mini-indicator').on('DOMCharacterDataModified', function (e1) {
                            if(e1.target.innerHTML=='Загрузка завершена' || e1.target.innerHTML=='Uploads complete'){
                                videoInfoChanger();
                                uploadDone = true;
                            }
                        });
                    } else {
                        $('span.count.style-scope.ytcp-uploads-mini-indicator').on('DOMCharacterDataModified', function (e1) {
                            if(e1.target.innerHTML=='Загрузка завершена' || e1.target.innerHTML=='Uploads complete'){
                                setTimeout(function(){ window.close() }, 2000);
                            }
                        });
                    }
                }
            });
        }
    });

    function videoInfoChanger(){
        setTimeout(function() {
            var videosPerPage = document.querySelector('span.dropdown-trigger-text.style-scope.ytcp-text-dropdown-trigger');
            if(videosPerPage.innerHTML == 30){
                document.querySelector("main#main").scrollTo({
                    left: 0,
                    top: document.querySelector("main#main").scrollHeight - document.querySelector("main#main").clientHeight,
                    behavior: 'smooth'
                });
                clickQuery('div.borderless.container.style-scope.ytcp-dropdown-trigger');
                clickQuery('paper-item.paper-item.style-scope.ytcp-text-menu#text-item-2');
            }
            $('ytcp-entity-page#entity-page').on('DOMAttrModified', function (e) {
                if (e.originalEvent.attrName === "class") {
                    if (e.target.className=='loaded style-scope ytcp-app') {
                        setTimeout(function() {
                            if(videosPerPage.innerHTML == 50 && count < 1){
                                count++;
                                setDescription();
                            }
                            else if(count == 1){
                                count++;
                                setTags();
                            }
                            else if(count > 1){
                                alert('test2');
                                var el = document.querySelector('span.page-description.style-scope.ytcp-table-footer').innerHTML;
                                if (el.search('1–50') != -1){
                                    alert('1–50');
                                    count = 0;
                                    clickQuery('ytcp-icon-button.rtl-flip.style-scope.ytcp-table-footer#navigate-after');
                                }
                            }
                            else {
                                alert(count);
                            }
                        }, 500);
                    }
                }
            });
        }, 500);
    }
    function setDescription(){
        setTimeout(function() {
            clickQuery('ytcp-checkbox-lit.style-scope.ytcp-table-header#selection-checkbox');
            setTimeout(function() {
                clickQuery('ytcp-dropdown-trigger.style-scope.ytcp-text-dropdown-trigger');
                setTimeout(function() {
                    clickQuery('paper-item.paper-item.style-scope.ytcp-text-menu#text-item-1[test-id=DESCRIPTION]');
                    setTimeout(function() {
                        clickQuery('ytcp-text-dropdown-trigger.style-scope.ytcp-select#trigger');
                        setTimeout(function() {
                            clickQuery('paper-item.paper-item.style-scope.ytcp-text-menu#text-item-2[test-id=SET_TO]');
                            setTimeout(function() {
                                document.querySelector('textarea.style-scope.ytcp-form-textarea').focus();
                                setTimeout(function() {
                                    windowTitle = document.title;
                                    document.title = 'DESCRIPTION';
                                    setTimeout(function() {
                                        document.title = windowTitle;
                                        setTimeout(function() {
                                            clickQuery('ytcp-button.chain-edit-button.style-scope.ytcp-bulk-actions#submit-button');
                                            setTimeout(function() {
                                                clickQuery('ytcp-paper-checkbox.style-scope.ytcp-checkbox#paper-checkbox');
                                                setTimeout(function() {
                                                    clickQuery('ytcp-button.style-scope.ytcp-confirmation-dialog#confirm-button');
                                                }, 1000);
                                            }, 1000);
                                        }, 1000);
                                    }, 1000);
                                }, 500);
                            }, 2000);
                        }, 500);
                    }, 500);
                }, 1000);
            }, 500);
        }, 1000);
    }
    function setTags(){
        setTimeout(function() {
            clickQuery('ytcp-checkbox-lit.style-scope.ytcp-table-header#selection-checkbox');
            setTimeout(function() {
                clickQuery('ytcp-dropdown-trigger.style-scope.ytcp-text-dropdown-trigger');
                setTimeout(function() {
                    clickQuery('paper-item.paper-item.style-scope.ytcp-text-menu#text-item-2[test-id=TAGS]');
                    setTimeout(function() {
                        clickQuery('ytcp-text-dropdown-trigger.style-scope.ytcp-select#trigger');
                        setTimeout(function() {
                            clickQuery('paper-item.paper-item.style-scope.ytcp-text-menu#text-item-1[test-id=SET_TO]');
                            setTimeout(function() {
                                document.querySelector('input.text-input.style-scope.ytcp-chip-bar#text-input').focus();
                                setTimeout(function() {
                                    windowTitle = document.title;
                                    document.title = 'TAGS';
                                    setTimeout(function() {
                                        document.title = windowTitle;
                                        setTimeout(function() {
                                            clickQuery('ytcp-button.chain-edit-button.style-scope.ytcp-bulk-actions#submit-button');
                                            setTimeout(function() {
                                                clickQuery('ytcp-paper-checkbox.style-scope.ytcp-checkbox#paper-checkbox');
                                                setTimeout(function() {
                                                    clickQuery('ytcp-button.style-scope.ytcp-confirmation-dialog#confirm-button');
                                                }, 1000);

                                            }, 1000);
                                        }, 500);
                                    }, 1000);
                                }, 200);
                            }, 2000);
                        }, 500);
                    }, 500);
                }, 1000);
            }, 500);
        }, 1000);
    }
    function clickQuery(QuerySelector){
        if (document.querySelector(QuerySelector) == null){
            console.log(QuerySelector+' click error');
            setTimeout(function() { clickQuery(QuerySelector) }, 100);
        }
        else {
            var timeOut = Math.floor(Math.random() * (1000 - 500 + 1) + 500);
            setTimeout(function() {
                try{
                    document.querySelector(QuerySelector).click();
                    console.log('click');
                }
                catch(e){
                    alert(e);
                }
            }, timeOut);
        }
    }
})();
