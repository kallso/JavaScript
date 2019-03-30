var dragSrcEl = null;
var IDofElementJustEntered = null;

function handleDragStart(e) {
    // Target (this) element is the source node.
    dragSrcEl = this;

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this.outerHTML);

    this.classList.add("dragElem");
}

function handleDragOver(e) {
    /*if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }

    //this.classList.add('over');

    e.dataTransfer.dropEffect = "move"; // See the section on the DataTransfer object.

    return false;*/
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.

    
    if (dragSrcEl != this && !(e.relatedTarget.closest('.column'))) {
    		IDofElementJustEntered = this.id;
    
    		// this.id !== e.relatedTarget.closest('.column').id
        
        // Set the source column's HTML to the HTML of the column we dropped on.
        //alert(this.outerHTML);
        //dragSrcEl.innerHTML = this.innerHTML;
        //this.innerHTML = e.dataTransfer.getData('text/html');
        //console.log(dragSrcEl.id, typeof(dragSrcEl.id));
        //console.log(e.dataTransfer.getData('text/html'));
        //var dropHTML = e.dataTransfer.getData('text/html');
        console.log('-----------------------------');
        console.log('you just entered ' + this.id);
        console.log(e);
        console.log('this.id = '+ this.id);
        console.log('dragSrcEl.id = ' + dragSrcEl.id);

        var storedSourceHTML = dragSrcEl.outerHTML;
        var sourceEl = document.getElementById(dragSrcEl.id);

				this.outerHTML = storedSourceHTML;
        sourceEl.outerHTML = this.outerHTML;
        

				console.log('After the swap this.id = ' + document.getElementById(this.id).id);
        console.log('-----------------------------');
        //document.getElementById(this.id).classList.add('over');
        addDnDHandlers(document.getElementById(this.id));
    } else if (dragSrcEl != this && e.relatedTarget.closest('.column')) {
    	if (e.relatedTarget.closest('.column').id !== this.id) {
      	var storedSourceHTML = dragSrcEl.outerHTML;
        var sourceEl = document.getElementById(dragSrcEl.id);

				this.outerHTML = storedSourceHTML;
        sourceEl.outerHTML = this.outerHTML;
        addDnDHandlers(document.getElementById(this.id));
      }
      
    }
    return false;
}

function handleDragLeave(e) {
    //this.classList.remove('over');  // this / e.target is previous target element.
    //const test = document.getElementById("test");
    //this.parentNode.parentNode.removeChild(test);
    //this.style.marginBottom = '0px';
    
    //console.log(e);
    /*
    if (this.id === IDofElementJustEntered) {
    	addDnDHandlers(document.getElementById(this.id));
    }
    console.log('you just leaved ' + this.id);*/
    
    //console.log(dragSrcEl.id);
}

function handleDragExit(e) {
    
    console.log('you just EXITED ' + this.id);
}

function handleDrop(e) {
    // this/e.target is current target element.

    if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting.
    }
    //e.preventDefault();

    /*

  // Don't do anything if dropping the same column we're dragging.
  if (dragSrcEl != this) {
    // Set the source column's HTML to the HTML of the column we dropped on.
    //alert(this.outerHTML);
    //dragSrcEl.innerHTML = this.innerHTML;
    //this.innerHTML = e.dataTransfer.getData('text/html');
    this.parentNode.removeChild(dragSrcEl);
    var dropHTML = e.dataTransfer.getData('text/html');
    this.insertAdjacentHTML('beforebegin',dropHTML);
    var dropElem = this.previousSibling;
    addDnDHandlers(dropElem);

  }
  this.classList.remove('over');
  return false;

  */
}

function handleDragEnd(e) {
    // this/e.target is the source node.

    var sourceEl = document.getElementById(this.id);
    //this.classList.remove('over');
    sourceEl.classList.remove("dragElem");
		
    console.log('----------------------------------------------------------');
    /*[].forEach.call(cols, function (col) {
    col.classList.remove('over');
  });*/
    addDnDHandlers(document.getElementById(this.id));
}

function addDnDHandlers(elem) {
    elem.addEventListener("dragstart", handleDragStart, false);
    elem.addEventListener("dragenter", handleDragEnter, false);
    elem.addEventListener("dragover", handleDragOver, false);
    elem.addEventListener("dragleave", handleDragLeave, false);
    elem.addEventListener("dragexit", handleDragExit, false);
    elem.addEventListener("drop", handleDrop, false);
    elem.addEventListener("dragend", handleDragEnd, false);
}

var cols = document.querySelectorAll("#columns .column");
//[].forEach.call(cols, addDnDHandlers);
Array.from(cols).forEach(addDnDHandlers);
