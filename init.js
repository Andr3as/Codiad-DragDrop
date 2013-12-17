/*
 * Copyright (c) Codiad & Andr3as, distributed
 * as-is and without warranty under the MIT License.
 * See http://opensource.org/licenses/MIT for more information. 
 * This information must remain intact.
 */

(function(global, $){
    
    var codiad = global.codiad,
        scripts = document.getElementsByTagName('script'),
        path = scripts[scripts.length-1].src.split('?')[0],
        curpath = path.split('/').slice(0, -1).join('/')+'/',
        instance = null;

    $(function() {
        codiad.Drag.init();
    });

    codiad.Drag = {
        
        path: curpath,
        files: [],
		
        init: function() {
			var _this   = this;
			instance    = this;
			var fn		= function(){
				//Drag
				$('#file-manager a:not(#project-root)').draggable({
					opacity: 0.85,
					revert: true,
					zIndex: 100
				});
				//Drop
				$('.directory').droppable({
					accept  : "#file-manager a:not(#project-root)",
					drop    : _this.drop,
					over    : _this.over,
					out     : _this.out
				});
			};
			amplify.subscribe('file-manager.onIndex', function(obj){
				setTimeout(fn, 250);
				setTimeout(function(){
					//Reopen closed files
					$.each(instance.files, function(i, item){
						codiad.filemanager.openFile(item, false);
					});
					instance.files = [];
				}, 250);
			});
			amplify.subscribe('file-manager.onCreate', function(obj){
				setTimeout(fn, 250);
			});
        },
		
		//////////////////////////////////////////////////////////
        //
        //  Drop item
        //
        //  Parameters:
        //
        //  event - {Event} - Check for more details
        //	ui - {Object} - http://api.jqueryui.com/droppable/
        //
        //////////////////////////////////////////////////////////
        drop: function(event, ui) {
			var dest    = $(this).attr('data-path');
			var source  = $(ui.draggable).attr('data-path');
			var target  = dest + instance.getName(source);
			//Close file(s) if open and save it/them for reopening
			if (instance.isDir(ui.draggable)) {
				$.each(codiad.active.sessions, function(i, item){
					if (instance.startsWith(i,source)) {
						codiad.active.save(i);
						codiad.active.close(i);
						instance.files.push(i.replace(source, target));
					}
				});
			} else {
				if (codiad.active.isOpen(source)) {
					codiad.active.save(source);
					codiad.active.close(source);
					instance.files.push(target);
				}
			}
			instance.move(source, dest, ui.draggable);
			instance.out();
        },
		
		//////////////////////////////////////////////////////////
        //
        //  Item over
        //
        //  Parameters:
        //
        //  event - {Event} - Check for more details
        //	ui - {Object} - http://api.jqueryui.com/droppable/
        //
        //////////////////////////////////////////////////////////
		over: function(event, ui) {
			$(this).addClass('drop_over');
        },
		
		//////////////////////////////////////////////////////////
        //
        //  Item out
        //
        //  Parameters:
        //
        //  event - {Event} - Check for more details
        //	ui - {Object} - http://api.jqueryui.com/droppable/
        //
        //////////////////////////////////////////////////////////
		out: function(event, ui) {
			$(this).removeClass('drop_over');
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Move item
        //
        //  Parameters:
        //
        //  source - {String} - Dropping item path
        //	dest - {String} - Dropping zone path
        //	element - {jQuery} - Dropped item
        //
        //////////////////////////////////////////////////////////
        move: function(source, dest, element) {
			$.getJSON(this.path+"controller.php?action=move&source="+source+"&dest="+dest, function(json){
				codiad.message[json.status](json.message);
				if (json.status == "success") {
					element.context.parentElement.remove();
					codiad.filemanager.rescan(codiad.project.getCurrent());
					$('.drop_over').removeClass('drop_over');
				}
			});
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Is file or directory
        //
        //  Parameters:
        //
        //	element - {jQuery} - Item
        //
        //////////////////////////////////////////////////////////
        isDir: function(element) {
			if ($(element).hasClass('directory')) {
				return true;
			} else {
				return false;
			}
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Get name
        //
        //  Parameters:
        //
        //	path - {String} - File path
        //
        //////////////////////////////////////////////////////////
        getName: function(path) {
			return path.substring(path.lastIndexOf("/"));
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Starts string with something
        //
        //  Parameters:
        //
        //	string - {String} - String to search in
        //	needle - {String} - Needle to search for
        //
        //////////////////////////////////////////////////////////
        startsWith: function(string, needle) {
			if (string.indexOf(needle) === 0) {
				return true;
			} else {
				return false;
			}
        }
    };
})(this, jQuery);