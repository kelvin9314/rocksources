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
  
      var button_height = 'padding:0 0;font-size:8px;height:20px;max-height:20px;';
  
      var kb = document.createElement('div');
      kb.innerHTML = '\
      <style type="text/css">\
      #'+ctrl.show_input_keys_id+' {\
        background-color: #ffe5cc;\
        color: #000;\
        float: left;\
        font-size:18px;min-width: 5em; max-width: 8em;\
      }\
      #'+ctrl.candidate_id+' {\
        clear: both;\
        font-size:38px;\
        height: 80px;\
        max-width:100%;\
        overflow-x: hidden; overflow-y: auto;\
        weight: 10%;\
      }\
      .'+ctrl.control_classes.candidates+' {\
        height: 30px; min-width: 29px; max-width: 300px;\
        font-size: 25px;\
        padding: 0px; margin: 0px;\
        border: 1px solid lightgrey;\
      }\
      .'+ctrl.control_classes.capital_toggle+', .'+ctrl.control_classes.capital_toggle_on+', .'+ctrl.control_classes.end_composition+', .'+ctrl.control_classes.end_composition+', .'+ctrl.control_classes.back_input_key+', .'+ctrl.control_classes.backspace_output_texts+', .'+ctrl.control_classes.switch_engine+'   {\
        border-radius: 25px;\
        color: white;\
        font-family:arial, "Hiragino Sans GB", "Microsoft Yahei", 微軟黑體, Tahoma, Arial, Helvetica, STHeiti; \
        font-weight:600;\
        height: 48px;\
        margin: auto;\
        padding:0 55px;\
      }\
      .'+ctrl.control_classes.inputkey+' {\
        -moz-border-radius: 0.25em;\
        -webkit-border-radius: 0.25em;\
        background-color: #ffb412;\
        border-radius: 0.25em;\
        border: 1px solid lightgrey;\
        border:#FFFFFF;\
        box-shadow:1px 2px 1px #8F8F8F;\
        cursor: pointer;\
        color: white;\
        font-weight:600;\
        font-family:arial, "Hiragino Sans GB", "Microsoft Yahei", 微軟黑體, Tahoma, Arial, Helvetica, STHeiti; \
        font-size: 38px;\
        margin: 2px 4px;\
        padding: 0 10px ;\
        text-align: center;\
        width: 70px;\
      }\
      .'+ctrl.control_classes.switch_engine+' {\
        background-color: #000;\
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
        margin: auto;\
        padding: 1px ;\
        width: 95%;\
      }\
      .input_method_function_keys {\
        vertical-align:middle;\
      }\
      </style>\
      <div class="input_method_candidate_id" id="'+ctrl.candidate_id+'"><!-- required --></div>\
      </div>\
          <div class="input_method_show_input_keys_id" id="'+ctrl.show_input_keys_id+'"></div>\
      </div>\
       <div class="input_method_space" style="'+button_height+'"></div>\
      <br>\
      <div id="'+ctrl.keyboard_id+'" class="'+ctrl.keyboard_id+'"><!-- required --></div>\
      <div class="input_method_function_keys"> \
        <button class="'+ctrl.control_classes.capital_toggle+'" style="float:left;clear:left;">大小寫</button>\
        <button class="'+ctrl.control_classes.backspace_output_texts+'" style="float:left;">清除</button>\
        <button class="'+ctrl.control_classes.switch_engine +'"  style="float:left;">切換輸入法</button>\
        <button class="'+ctrl.control_classes.end_composition+'" style="float:left;">完成</button>\
        <button class="'+ctrl.control_classes.back_input_key+'"  style="float:left;">倒退</button><!-- ↤ ⍅ ⍇ -->\
      </div>';
      
      with (kb.style) {
        margin= '0';
        color= '#000';
        backgroundColor = '#d5d5d5';
        border = '1px solid #ececec';
        borderRadius= '0.25em';
        padding= '5px 0 5px 5px';
        position = 'absolute';
        zIndex = '99999';
        display= 'none';
        width= '90%';
      }
      
      kb.className="ime-keyboard-area"
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

      function getElementPosition(element){
          var kb_render_position = { x:0, y:0}
          var screenAvailHeight = window.screen.availHeight;  // 768
          var screenAvailWidth = window.screen.availWidth;    //1024

          var elementDistanceFromTop = element.getBoundingClientRect().top;
          var elementDistanceFromBottom = element.getBoundingClientRect().bottom;
          var elementDistanceFromLeft = element.getBoundingClientRect().left;
          var elementDistanceFromRight = element.getBoundingClientRect().right;
 
          var kbHight = window.getComputedStyle(kb).getPropertyValue('height').replace('px','');
          kbHight = (isNaN(kbHight)) ? 380 : (+kbHight)
          // var kbWidth = window.getComputedStyle(kb).getPropertyValue('width').replace('px','');
          // kbWidth = (isNaN(kbWidth)) ? 372 : (+kbWidth)
          
          var height;
          var width ;
          // 判斷 input element上下方有足夠空間顯示鍵盤
          if( screenAvailHeight - elementDistanceFromBottom > kbHight){
              kb_render_position.x = elementDistanceFromBottom + 10
          }else{
              kb_render_position.x = elementDistanceFromTop - kbHight - 10
          }
          // 判斷 鍵盤和 input element width的對齊
          // if(elementDistanceFromLeft + kbWidth <= screenAvailWidth){
          //     kb_render_position.y = elementDistanceFromLeft
          // }else{
          //     kb_render_position.y = screenAvailWidth - kbWidth
          // }

          return kb_render_position
      }
  
      TouchInputMethod.oncomposition = function() {
          var target = TouchInputMethod.get_target();
          var keyboardPosition = getElementPosition(target)
          kb.style.top = keyboardPosition.x + 'px';
          // kb.style.left = keyboardPosition.y + 'px';
          kb.style.left = '5%';
          kb.style.display = "block";
          if (old_oncomposition)
              old_oncomposition.call(TouchInputMethod);
      }
  
      TouchInputMethod.oncompositionend = function() {
          kb.style.display = "none";
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

      // 不是點撃在 input / keyboard 上時, keyboard 會隱藏
      $('.input__field').focus(function() {
          TouchInputMethod.oncomposition()
          $(document).bind('focusin.ime-keyboard-area click.ime-keyboard-area click.input_method_candidates',function(e) {
              if ($(e.target).closest('.ime-keyboard-area, .input__field, .input_method_candidates').length) return;
              TouchInputMethod.oncompositionend()
          });
      });
        
      // }, false);
      TouchInputMethod.init();
      
  }
  , false);
  
  })();
  
  
