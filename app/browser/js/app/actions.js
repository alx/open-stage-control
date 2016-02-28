var editor =  require('./editor')

module.exports = {

    stateQuickSave: function(preset){
        if (preset) {
            STATE = preset
        } else {
            STATE = module.exports.stateGet()
        }
        $('.quickload').removeClass('disabled')
    },

    stateQuickLoad: function(){
        module.exports.stateSet(STATE,true)
    },

    stateSave: function() {
        state = module.exports.stateGet()
        if (WEBFRAME) {
            IPC.send('stateSave',STATE)
        } else {
            var down = $('<a download="'+new Date().toJSON().slice(0,10)+'_'+new Date().toJSON().slice(11,16)+'.preset"></a>')
            var blob = new Blob([STATE],{type : 'text/plain'});
            down.attr('href', window.URL.createObjectURL(blob))
            down[0].click()
        }

    },

    stateGet: function (){
        var data = []
        $.each(WIDGETS,function(i,widget) {
            var v = widget[widget.length-1].getValue()
            if (v!=undefined) data.push(i+' '+v)
        })
        return data.join('\n')
    },

    stateLoad: function() {
        if (WEBFRAME) {
            IPC.send('stateLoad')
        } else {
            var prompt = $('<input type="file" accept=".preset"/>')
            prompt.click()
            prompt.on('change',function(e){
                var reader = new FileReader();
                reader.onloadend = function(e) {
                    var preset = e.target.result
                    module.exports.stateSet(preset,true)
                    STATE = preset
                }
                reader.readAsText(e.target.files[0],'utf-8');
            })
        }
    },

    stateSend: function(){
        var data = module.exports.stateGet()
        module.exports.stateSet(data,true)

    },

    stateSet: function(preset,send){

        $.each(preset.split('\n'),function(i,d) {
            var data = d.split(' ')

            setTimeout(function(){
                if (WIDGETS[data[0]]!=undefined) {
                    WIDGETS[data[0]][WIDGETS[data[0]].length-1].setValue(data[1].split(','),send,true)
                }
            },i)
        })
    },

    toggleFullscreen: function(){

        if (WEBFRAME) {
            IPC.send('fullscreen')
        } else {
            var isInFullScreen = document.webkitIsFullScreen

            if (isInFullScreen) {
                document.webkitExitFullscreen()
            } else {
                document.documentElement.webkitRequestFullScreen()
            }
        }
    },

    sessionBrowse: function(){

        if (WEBFRAME) {
            IPC.send('sessionBrowse')
        } else {
            var prompt = $('<input type="file" accept=".js"/>')
            prompt.click()
            prompt.on('change',function(e){
                var reader = new FileReader();
                reader.onloadend = function(e) {
                    var session = e.target.result
                    IPC.send('sessionOpen',{file:session})
                }
                reader.readAsText(e.target.files[0],'utf-8');
            })
        }
    },

    sessionSave: function() {
        var sessionfile = JSON.stringify(SESSION,null,'    ')
        if (WEBFRAME) {
            IPC.send('sessionSave',sessionfile)
        } else {
            var down = $('<a download="'+new Date().toJSON().slice(0,10)+'_'+new Date().toJSON().slice(11,16)+'.js"></a>')
            var blob = new Blob([sessionfile],{type : 'text/plain'});
            down.attr('href', window.URL.createObjectURL(blob))
            down[0].click()
        }

    },


    createPopup: function(title,content) {

        var popup = $(`
            <div class="popup">
                <div class="popup-wrapper">
                <div class="popup-title">${title}<span class="closer">${module.exports.icon('remove')}</span></div>
                <div class="popup-content"></div>
                </div>
            </div>`),
            closer = popup.find('.popup-title .closer')

        closer.click(function(){
            popup.close()
        })


        popup.close = function(){
            $(document).unbind('keydown.popup')
            popup.remove()
        }

        popup.find('.popup-content').append(content)
        $('body').append(popup)

        $(document).on('keydown.popup', function(e){
            if (e.keyCode==27) popup.close()
        })


        return popup
    },

    brightnessReduce: function(){
        $('.brightness-reset.disabled, .brightness-increase.disabled').removeClass('disabled')
        var b = parseFloat($('#brightness').data('brightness')) - 0.1,
            v = parseInt(255*b)
        $('#brightness').data('brightness',b).css({background:`rgb(${v},${v},${v})`})
        if (b<=0) $('.brightness-reduce').addClass('disabled')
    },
    brightnessIncrease: function(){
        $('.brightness-reset.disabled, .brightness-reduce.disabled').removeClass('disabled')
        var b = parseFloat($('#brightness').data('brightness')) + 0.1,
            v = parseInt(255*b)
        $('#brightness').data({brightness:b}).css({background:`rgb(${v},${v},${v})`})
        if (b>=1) $('.brightness-increase').addClass('disabled')
    },
    brightnessReset: function(){
        $('.brightness-increase.disabled, .brightness-reduce.disabled').removeClass('disabled')
        $('.brightness-reset').addClass('disabled')
        var b = .5,
            v =  127
        $('#brightness').data('brightness',b).css({background:`rgb(${v},${v},${v})`})
    },

	editorEnable: editor.enable,
	editorDisable: editor.disable

}
