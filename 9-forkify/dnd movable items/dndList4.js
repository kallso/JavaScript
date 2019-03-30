var dragSrcEl = null;

function handleDragStart(e) {
    // Target (this) element is the source node.
    dragSrcEl = this;

    e.dataTransfer.effectAllowed = "move";

    this.classList.add("dragElem");
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.

    if (dragSrcEl != this) {
    	console.log(e);
        if (!e.relatedTarget.closest(".column")) {
            
            var storedSourceHTML = dragSrcEl.outerHTML;
            var sourceEl = document.getElementById(dragSrcEl.id);

            this.outerHTML = storedSourceHTML;
            sourceEl.outerHTML = this.outerHTML;

            addDnDHandlers(document.getElementById(this.id));
        } else if (e.relatedTarget.closest(".column")) {
            if (e.relatedTarget.closest(".column").id !== this.id) {
                var storedSourceHTML = dragSrcEl.outerHTML;
                var sourceEl = document.getElementById(dragSrcEl.id);

                this.outerHTML = storedSourceHTML;
                sourceEl.outerHTML = this.outerHTML;

                addDnDHandlers(document.getElementById(this.id));
            }
        }
    }
    return false;
}

function handleDragEnd(e) {
    // this/e.target is the source node.

    var sourceEl = document.getElementById(this.id);
    sourceEl.classList.remove("dragElem");

    addDnDHandlers(document.getElementById(this.id));
}

function addDnDHandlers(elem) {
    elem.addEventListener("dragstart", handleDragStart, false);
    elem.addEventListener("dragenter", handleDragEnter, false);
    elem.addEventListener("dragend", handleDragEnd, false);
}

Array.from(document.querySelectorAll("#columns .column")).forEach(
    addDnDHandlers
);
