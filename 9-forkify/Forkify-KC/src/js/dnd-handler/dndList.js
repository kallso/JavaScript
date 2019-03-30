let dragSrcEl = null;

function handleDragStart(e) {
    // Target (this) element is the source node.
    dragSrcEl = this;

    e.dataTransfer.effectAllowed = "move";

    this.classList.add("dragElem");
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.

    if (dragSrcEl != this) {
        console.log(e, 'you just entered : ' + this.dataset.itemid);
    	const li = e.relatedTarget.closest(".shopping__item");
        if (!li || (li && li.id !== this.dataset.itemid)) {           
            
            const storedSourceHTML = dragSrcEl.outerHTML;
            const sourceEl = document.querySelector(`[data-itemid~=${dragSrcEl.dataset.itemid}]`);

            this.outerHTML = storedSourceHTML;
            sourceEl.outerHTML = this.outerHTML;

            addDnDHandlers(document.querySelector(`[data-itemid~=${this.dataset.itemid}]`));
        }
    }
    return false;
}

function handleDragOver(e) {
    // this/e.target is the source node.

    event.preventDefault();
    return false;
}

function handleDragEnd(e) {
    // this/e.target is the source node.

    const sourceEl = document.querySelector(`[data-itemid~=${this.dataset.itemid}]`);
    sourceEl.classList.remove("dragElem");

    addDnDHandlers(document.querySelector(`[data-itemid~=${this.dataset.itemid}]`));
}


export function addDnDHandlers(elem) {
    elem.addEventListener("dragstart", handleDragStart, false);
    elem.addEventListener("dragenter", handleDragEnter, false);
    elem.addEventListener("dragend", handleDragEnd, false);
    elem.addEventListener("dragover", handleDragOver, false);
}
