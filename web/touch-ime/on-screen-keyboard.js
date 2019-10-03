/*
Touch 輸入法 Copyright (C) 2013 遊手好閒的石頭成 <shirock.tw@gmail.com>

on-screen-keyboard.js is a part of Touch IME.

Touch IME is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

You should see https://rocksources.googlecode.com/ to get more
information about Touch IME.
*/
(function(){
// 將 OnScreenKeyboard 函數綁在 window 事件上，除了用於配置軟鍵盤外，還可藉由
// 被 window 參照的關係，使軟鍵盤個體不會被視為要回收的垃圾。
window.addEventListener('DOMContentLoaded',
function/*OnScreenKeyboard*/() {
    if (typeof(TouchInputMethod) == 'undefined')
        return;

    console.info('OnScreenKeyboard initial');
    var ctrl = TouchInputMethod.get_controls();

    var button_height = 'padding:2px 0;font-size:16px;height:30px;max-height:30px;';

    var kb = document.createElement('div');
    kb.innerHTML = '\
    <style type="text/css">\
    #'+ctrl.show_input_keys_id+' {\
        font-size:18px;min-width: 5em; max-width: 8em;\
        float: left; clear: left;\
    }\
    #'+ctrl.candidate_id+' {\
        clear: both;\
        height: 60px; max-width:320px;\
        overflow-x: hidden; overflow-y: auto;\
        margin-bottom: 5px;\
    }\
    .'+ctrl.control_classes.select_engine+' {\
        position: relative;\
        background-color: #A9A9A9;\
    }\
    .'+ctrl.control_classes.select_engine+'::after {\
        position: absolute;\
        content: "";\
        top: 14px;\
        right: 10px;\
        width: 0;\
        height: 0;\
        border: 6px solid transparent;\
        border-color: #fff transparent transparent transparent;\
    }\
    .'+ctrl.control_classes.inputkey+' {\
        width: 32px; height: 32px;\
        max-width: 32px; max-height: 32px;\
        font-size: 18px;\
        padding: 0px; margin: 0px;\
        border: 1px solid lightgrey;\
    }\
    .'+ctrl.control_classes.candidates+' {\
        height: 30px; min-width: 29px; max-width: 300px;\
        font-size: 16px;\
        padding: 0px; margin: 0px;\
        border: 1px solid lightgrey;\
    }\
    .'+ctrl.control_classes.capital_toggle_on+' {\
        background-color: #0aa;\
    }\
    .'+ctrl.control_classes.end_composition+' {\
        background-color: #77ae01;\
    }\
    </style>\
    <div>\
    <div id="'+ctrl.candidate_id+'"><!-- required --></div>\
    </div>\
    <div id="'+ctrl.show_input_keys_id+'"></div>\
     </div>\
     <div style="'+button_height+'"><button class="'+ctrl.control_classes.back_input_key+'">⍇</button><!-- ↤ ⍅ ⍇ -->\
     <select class="'+ctrl.control_classes.select_engine+'" style="width:150px;"></select>\
    </div>\
    </div>\
    <div id="'+ctrl.keyboard_id+'"><!-- required --></div>\
    <div style="text-align:center;'+button_height+'">\
     <button class="'+ctrl.control_classes.capital_toggle+'" style="float:left;clear:left;">Shift</button>\
     <button class="'+ctrl.control_classes.backspace_output_texts+'" style="float:left;">清除</button>\
     <button class="'+ctrl.control_classes.end_composition+'" >完成</button>\
    <div>\
    </div>';

    with (kb.style) {
        margin= 0;
        color= '#000';
        backgroundColor = '#d5d5d5';
        border = '1px solid #ececec';
        borderRadius= '0.25em';
        padding = '0';
        padding= '5px 0 5px 5px';
        position = 'absolute';
        visibility = 'hidden';
        zIndex = '99999';
    }

    var inputs = kb.getElementsByTagName('button');
    for (var i = 0; i < inputs.length; ++i)
        inputs[i].style.fontSize = '16px';
    kb.getElementsByTagName('select')[0].style.fontSize = '16px';

    document.getElementsByTagName('body')[0].appendChild(kb);

    var kb_x, kb_y;
    var being_dragged = false;
    var old_oncomposition = TouchInputMethod.oncomposition;
    var old_oncompositionend = TouchInputMethod.oncompositionend;

    TouchInputMethod.oncomposition = function() {
        var target = TouchInputMethod.get_target();
        kb.style.top = (target.offsetTop + target.offsetHeight + 10) + 'px';
        kb.style.left = (target.offsetLeft + 10) + 'px';
        kb.style.visibility = "visible";
        if (old_oncomposition)
            old_oncomposition.call(TouchInputMethod);
    }

    TouchInputMethod.oncompositionend = function() {
        kb.style.visibility = "hidden";
        if (old_oncompositionend)
            old_oncompositionend.call(TouchInputMethod);
    }

    kb.addEventListener('mousedown', function(ev){
        if (ev.target.nodeName != 'DIV' ||
            (ev.target.id == ctrl.candidate_id && ev.target.childElementCount > 0))
        {
            return;
        }
        //ev.preventDefault();
        ev.stopPropagation();
        being_dragged = true;
        kb_x = (ev.clientX - kb.offsetLeft);
        kb_y = (ev.clientY - kb.offsetTop);
    }, false);

    kb.addEventListener('mouseup', function(ev){
        //console.log('up', ev.target, ev.clientX, ev.clientY);
        if (!being_dragged)
            return;
        being_dragged = false;
        kb.style.left = ev.clientX - kb_x + 'px';
        kb.style.top = ev.clientY - kb_y + 'px';
    }, false);

    window.addEventListener('mousemove', function(ev){
        if (!being_dragged)
            return;
        kb.style.left = ev.clientX - kb_x + 'px';
        kb.style.top = ev.clientY - kb_y + 'px';
    }, false);

    TouchInputMethod.init();
}
, false);

})();

