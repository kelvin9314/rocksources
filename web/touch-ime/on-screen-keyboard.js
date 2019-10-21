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
    
        var button_height = 'padding:2px 0;font-size:8px;height:20px;max-height:20px;';
    
        var kb = document.createElement('div');
        kb.innerHTML = '\
        <style type="text/css">\
        #'+ctrl.show_input_keys_id+' {\
          font-size:18px;min-width: 5em; max-width: 8em;\
          float: left;\
          background-color: #ffe5cc;\
          color: #000;\
        }\
        #'+ctrl.candidate_id+' {\
          clear: both;\
          font-size:38px;\
          weight: 120px;\
          max-width:320px;\
          height: 80px;\
          overflow-x: hidden; overflow-y: auto;\
          margin-bottom: 5px;\
          margin: 2px;\
        }\
        .'+ctrl.control_classes.switch_engine+' {\
          height: 48px;\
          weight: 48px;\
          color: #FFF;\
          border-radius: 0.25em;\
          background-color: #000;\
          font-weight:600;\
          margin:0.125em;\
          padding:5px;\
        }\
        .'+ctrl.control_classes.inputkey+' {\
          width: 32px; height: 32px;\
          max-width: 32px; max-height: 32px;\
          font-size: 25px;\
          padding: 0px; margin: 0px;\
          border: 1px solid lightgrey;\
          width: 10px:\
          height: 10px:\
        }\
        .'+ctrl.control_classes.candidates+' {\
          height: 30px; min-width: 29px; max-width: 300px;\
          font-size: 25px;\
          padding: 0px; margin: 0px;\
          border: 1px solid lightgrey;\
        }\
        .'+ctrl.control_classes.capital_toggle+', .'+ctrl.control_classes.capital_toggle_on+', .'+ctrl.control_classes.end_composition+', .'+ctrl.control_classes.end_composition+', .'+ctrl.control_classes.back_input_key+', .'+ctrl.control_classes.backspace_output_texts+'   {\
          font-family:arial, "Hiragino Sans GB", "Microsoft Yahei", 微軟黑體, Tahoma, Arial, Helvetica, STHeiti; \
          height: 48px;\
          weight: 48px;\
          color: white;\
          font-weight:600;\
          border-radius: 0.25em;\
          margin:0.125em;\
          padding:5px;\
        }\
        .'+ctrl.control_classes.capital_toggle+' {\
          background-color: #0aa;\
        }\
        .'+ctrl.control_classes.capital_toggle_on+' {\
          background-color: #0ac;\
        }\
        .'+ctrl.control_classes.end_composition+' {\
          background-color: #77ae01;\
        }\
        .'+ctrl.control_classes.back_input_key+' {\
          background-color: #ff6c00;\
        }\
        .'+ctrl.control_classes.backspace_output_texts+' {\
          background-color: #f5132e;\
        }\
        .'+ctrl.keyboard_id+' {\
          font-family:arial, "Hiragino Sans GB", "Microsoft Yahei", 微軟黑體, Tahoma, Arial, Helvetica, STHeiti; \
          font-size: 38px;\
          margin: 0.125em;\
          padding: 5px ;\
        }\
        .'+ctrl.keyboard_id+' {\
          font-family:arial, "Hiragino Sans GB", "Microsoft Yahei", 微軟黑體, Tahoma, Arial, Helvetica, STHeiti; \
          font-size: 38px;\
          margin: 0.125em;\
          padding: 5px ;\
        }\
        </style>\
        <div class="input_method_space">\
        <div class="input_method_candidate_id" id="'+ctrl.candidate_id+'"><!-- required --></div>\
        </div>\
            <div class="input_method_show_input_keys_id" id="'+ctrl.show_input_keys_id+'"></div>\
         </div>\
         <div class="input_method_space" style="'+button_height+'"></div>\
        <div id="'+ctrl.keyboard_id+'" class="'+ctrl.keyboard_id+'"><!-- required --></div>\
        <div class="input_method_space" style="text-align:center;margin:0.25em;padding:5px;'+button_height+'">\
         <button class="'+ctrl.control_classes.capital_toggle+'" style="float:left;clear:left;">大小寫</button>\
         <button class="'+ctrl.control_classes.backspace_output_texts+'" style="float:left;">清除</button>\
         <button class="'+ctrl.control_classes.switch_engine +'"  style="float:left;">切換輸入法</button>\
         <button class="'+ctrl.control_classes.end_composition+'" style="float:left;">完成</button>\
         <button class="'+ctrl.control_classes.back_input_key+'"  style="float:left;">倒退</button><!-- ↤ ⍅ ⍇ -->\
        <div>\
        </div>';
        
        with (kb.style) {
          fontSize= '64px';
          margin= '0';
          color= '#000';
          backgroundColor = '#d5d5d5';
          border = '1px solid #ececec';
          borderRadius= '0.25em';
          padding= '5px 0 5px 5px';
          position = 'absolute';
          visibility = 'hidden';
          zIndex = '99999';
        }
        
        kb.id="ime-keyboard-area"
        var inputs = kb.getElementsByTagName('button');
        for (var i = 0; i < inputs.length; ++i)
            inputs[i].style.fontSize = '20px';
      //   kb.getElementsByTagName('select')[0].style.fontSize = '25px';
    
        document.getElementsByTagName('body')[0].appendChild(kb);
    
        var kb_x, kb_y;
        var being_dragged = false;
        var old_oncomposition = TouchInputMethod.oncomposition;
        var old_oncompositionend = TouchInputMethod.oncompositionend;
    
        TouchInputMethod.oncomposition = function() {
            var target = TouchInputMethod.get_target();
            // console.log(target);
            console.log(`target.offsetLeft : ${target.offsetLeft}`);
            // console.log(`getBoundingClientRect().bottom ${target.getBoundingClientRect().bottom}`);
            var keyboardPosition = {x:0, y:0}
            var elementDistanceFromTop = target.getBoundingClientRect().bottom;
            var elementDistanceFromLeft = target.getBoundingClientRect().left;
            var elementDistanceFromRight = target.getBoundingClientRect().right;
            console.log(`elementDistanceFromLeft : ${elementDistanceFromLeft}`);
            console.log(`elementDistanceFromRight : ${elementDistanceFromRight}`);


            var kbHight = +window.getComputedStyle(kb).getPropertyValue('height').replace('px','');
            var kbWidth = +window.getComputedStyle(kb).getPropertyValue('width').replace('px','');
            console.log(`kbHight ${kbHight}`);
            console.log(`kbWidth ${kbWidth}`);
            // 判決 input 下方是否位置顯示 kb
            keyboardPosition.x = (elementDistanceFromTop > kbHight) ? kbHight : elementDistanceFromTop
            // 判決 input 左方/右方是否位置顯示 kb
  
            kb.style.top = keyboardPosition.x + 'px';
            kb.style.left = (target.offsetLeft + 40) + 'px';
            // console.log(`kbHight :${kbHight}`);

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

        // kb.addEventListener('mouseleave', function(ev){
        //   console.log('keyboard closed');
        //   TouchInputMethod.oncompositionend()
        // }, false);

        window.addEventListener('mousemove', function(ev){
            if (!being_dragged)
                return;
            kb.style.left = ev.clientX - kb_x + 'px';
            kb.style.top = ev.clientY - kb_y + 'px';
        }, false);

        var anotherBlockIds = ['HeaderContainer', 'Header', 'MainContainer', 'Main', 'MBcenter_title', 'Login_Container']
        // var inputBlockIds = [
        //     'PhoneNumber', 
        //     'Password', 
        //     'CardNumber', 
        //     'CheckPassword',
        //     'IDnumber',
        //     'Approve', 
        //     'BycNumber', 
        //     'checkbox-01']

        // var input = document.querySelector('#Password')

        // input.onfocus = function(e){
        //     console.log('onfocus')
        // }
        // input.onblur = function(e){
        //     console.log(e)
        // }

        window.addEventListener('click', function(ev){
            ev.stopPropagation();
            if(ev.target.className.includes("input__field")){
                console.log('---kb show---');
                TouchInputMethod.oncomposition(ev.target)
            }
            if(anotherBlockIds.includes(ev.target.id)){
                console.log('---kb end---');
                TouchInputMethod.oncompositionend()
            }
          
        }, false);
        TouchInputMethod.init();
    }
    , false);
    
    })();
    
    