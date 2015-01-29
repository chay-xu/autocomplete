/**
 * @file drop AutoComplete
 * @author xucaiyu
 * @email 569455187@qq.com
 * @version 1.0.0
 * @date 2014-11-26
 * @license MIT License 
 */
;(function(){
    var data = {
        ipt: '#search-autocomplete',
        warp: '#search-hint',
        item: 'ul',
        ajax: {
            url: '',
            key: 'wd'
        },
        data: {
            data: {}
        },
        toChar: null,       // toUpperCase,toLowerCase
        selectClass: 'search-hint-select',
        highlight: '<strong style="color:red;">$&</strong>',
        template: '{{for data}}<li data-val="${$value}">${$value | highlight}</li>{{/for}}',
        warpper: '<div class="search-hint" id="search-hint">' + 
            '<iframe frameborder="0" src="about:blank" class="search-hint-shade"></iframe>' +
            '<div class="search-txt">检索到的相关结果：</div>' +
            '<ul class="search-content"></ul></div>'    
    },
    ignoredKeyCode = [9, 13, 17, 19, 20, 27, 33, 34, 35, 36, 37, 39, 44, 92, 113, 114, 115, 118, 119, 120, 122, 123, 144, 145];
    
    function inArray( value, array ){
        if( toString.call( array ) !== '[object Array]' ) return;
        
        for( var i in array ){
            if( array[ i ] == value ) return true;
        }
    }

    function count( object ){
        var len = 0,
            type = Object.prototype.toString.call( object );

        if( type === '[object Array]' || type === '[object String]' ){
            return object.length;
        }else{
            for( var i in object ){
                len++;
            }
            return len;
        }
    }

    function AutoComplete( options ){
        this.opts = $.extend( {}, data, options );
        
        var opts = this.opts;
        
        this.$ipt = $( opts.ipt );
        this.$warp = $( opts.warpper );
        this.$item = this.$warp.find( opts.item );

        
        this.selectClass = opts.selectClass;

        this.isHide = true;
        this.isSelect = false;
        this.lastKey = '';
        this.isEmpty = false;
        this.index = -1;
    
    
        this.init();
    
    }
    AutoComplete.prototype = {
        init: function(){
            var _self = this;


            //_self.$warp.css('width', _self.$ipt.outerWidth() )
            _self.$ipt.before( this.$warp );
        
            _self.$ipt.focus(function( e ){

                var val = _self.$ipt.val();

                if( val !== '' && !_self.isEmpty ){
                    _self.activate();
                }

            });
        
            _self.$ipt.blur(function( e ){

                _self.hide();
            });

            // window capture focus
            // if( !-[1,] ){
            //     $( window ).bind( 'releaseCapture', function( e ){
            //         // 禁止失去焦点   
            //         e.preventDefault();
            //         e.stopPropagation();

            //         _self.$ipt.blur();
            //         console.log(11100)
            //     });
            // }else{
            //     $( window ).bind( 'blur', function( e ){
            //         // 禁止失去焦点   
            //         e.preventDefault();
            //         e.stopPropagation(); 

            //         _self.$ipt.blur();
            //         console.log(11100)
            //     });
            // }
            
            _self.bindKeyDown();
            _self.bindMouse();  
        },
        bindKeyDown: function(){
            var _self = this;
        
            _self.$ipt.keydown(function( e ){
                var keycode = e.keyCode;
    
                // 如果列表隐藏了，按键则进行新的autocomplete
                if( _self.isHide ){
                    _self.activate();
                    return;
                }

                // console.log( keycode );
                switch( keycode ){
                    case 38:
                        e.preventDefault();
                        _self.focusPrev();
                        break;
                    case 40:
                        e.preventDefault();
                        _self.focusNext();
                        break;
                    case 13:
                        if( _self.isSelect ){
                            _self.selectValue();
                            e.preventDefault();
                            return false;
                        }
                        break;
                    case 27:
                        _self.hide();
                        break;
                    default:
                        if( !inArray( keycode, ignoredKeyCode ) )   
                            _self.activate();       
                }
            })
            _self.$ipt.bind('paste', function( e ){
                _self.activate();       
            })      
        },
        focusPrev: function(){
            this.focusMove( -1 );
        },
        focusNext: function(){
            this.focusMove( 1 );
        },
        focusMove: function( modifier ){
            var _self = this,
                $list = $( 'li', _self.$item ),
                len = $list.length,
                i = _self.index,
                next, val;
                            
            next = i + modifier;
            // 开始值或结束值时多次按同一方向键，class混乱
            if( next > len ){
                next = 0;
            }else if( next < -1 ){
                next = len - 1;
            }
                        
            if( $list.eq( i ).hasClass( _self.selectClass ) ){
                $list.eq( i ).removeClass( _self.selectClass );
            }   
            // 处理按键循环
            if( next >= len ){
                next = -1;
                val = _self.lastKey;
            }else if( next < 0 ){
            
                next = len;
                val = _self.lastKey;
            }else{
                $list.eq( next ).addClass( _self.selectClass );
                val = $( 'li.'+ _self.selectClass, _self.$item ).attr( 'data-val' );
            }
        
            _self.$ipt.val( val );

            _self.index = next;
            _self.isSelect = true;
        },
        bindMouse: function( type ){
            var _self = this;
        
            _self.$item.delegate('li', 'mouseover mouseout mousedown click', function( e ){
                var type = e.type,
                    _li = $( this );
                // 禁止失去焦点   
                e.preventDefault();
                e.stopPropagation();
         
                switch( type ){
                    case 'mouseover':
                        $( 'li', _self.$item ).eq( _self.index ).removeClass( _self.selectClass );
                        _li.addClass( _self.selectClass );
                        _self.isSelect = true;
                        _self.index = _li.index();
                        break;
                    case 'mouseout':
                        $( 'li', _self.$item ).eq( _self.index ).removeClass( _self.selectClass );
                        _self.isSelect = false;
                        _self.index = -1;
                        break;
                    case 'mousedown':
                    case 'click':
                        if( e.button == 0 )
                            _self.selectValue();
                        break;
                }
            })
        },
        selectValue: function(){
            var _self = this,
                val = $( 'li.'+ _self.selectClass, _self.$item ).attr( 'data-val' ) ;

            _self.$ipt.val( val );
            _self.hide();
            _self.isSelect = false;
        },
        hide: function(){
            var _self = this;
            
            clearTimeout( _self.keyTimeout );
            // before removing the hidden li className
            $( 'li', _self.$item ).eq( _self.index ).removeClass( _self.selectClass );
            // _self.$ipt.blur();

            _self.$warp.hide();
            _self.isHide = true;
            _self.index = -1;
        },
        show: function(){
            var _self = this;
        
            _self.isHide && _self.$warp.show();
            _self.isHide = false;
        },
        activate: function(){
            var _self = this;

            _self.keyTimeout && clearTimeout( _self.keyTimeout );
        
            _self.keyTimeout = setTimeout( function(){ _self.activateData(); }, 100 );
        
        },              
        activateData: function(){
            var _self = this,
                val = _self.$ipt.val(),
                key = _self.opts.toChar ? val[ _self.opts.toChar ]() : val;

            // input值为空，上一次数据获取也为空
            if( val == '' && _self.isEmpty ) return;

            // input值不为空，上一次数据也不为空，上一次输入和现在值一样
            if( key !== '' && !_self.isEmpty && _self.lastKey == key ){
                _self.show();
                return;
            }
            // _self.hide();
            if( _self.opts.ajax.url ){
                $.ajax({
                    type: 'post',
                    url: _self.opts.ajax.url,
                    data: _self.opts.ajax.key + '=' + key,
                    dataType: 'json',
                    success: function( data ){
                
                        _self.search( data, key )
                    }
                })
            }else{
                _self.search( _self.opts.data, key )
            }
        },
        search: function( data, key ){
            var _self = this;

            if( count( data.data ) == 0 ){
                _self.isEmpty = true;
                _self.$item.html( '' );
                _self.hide();
            }else{
                _self.isEmpty = false;                          
                _self.renderHtml( data, key );
                _self.show();
            }
            _self.lastKey = key;
            _self.data = data;
        },
        renderHtml: function( data, key ){
            var _self = this;
            
            fasTpl.tools('highlight', function( val ){
                var highlightReg = new RegExp( key, 'gi');
                
                return val.replace( highlightReg, _self.opts.highlight )
            })
            
            var html = fasTpl( _self.opts.template, data );
            _self.$item.html( html );
        }
    }
    
    typeof define == 'function' ? define(function(){
        return AutoComplete;
    }) : typeof exports != 'undefined' ? module.exports = AutoComplete : window.AutoComplete = AutoComplete;
})();