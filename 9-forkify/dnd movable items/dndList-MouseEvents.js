let currentDroppable = null;

function onDragStart() {
    return false;
}

function onMouseDown(event) {
    let shiftX = event.clientX - this.getBoundingClientRect().left;
    let shiftY = event.clientY - this.getBoundingClientRect().top;

    this.style.position = "absolute";
    this.style.zIndex = 1000;
    document.body.append(this);

    moveAt(event.pageX, event.pageY);

    function moveAt(pageX, pageY) {
        this.style.left = pageX - shiftX + "px";
        this.style.top = pageY - shiftY + "px";
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);

        this.hidden = true;
        let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
        this.hidden = false;

        if (!elemBelow) return;

        let droppableBelow = elemBelow.closest(".droppable");
        if (currentDroppable != droppableBelow) {
            if (currentDroppable) {
                // null when we were not over a droppable before this event
                leaveDroppable(currentDroppable);
            }
            currentDroppable = droppableBelow;
            if (currentDroppable) {
                // null if we're not coming over a droppable now
                // (maybe just left the droppable)
                enterDroppable(currentDroppable);
            }
        }
    }

    document.addEventListener("mousemove", onMouseMove);

    this.onmouseup = function() {
        document.removeEventListener("mousemove", onMouseMove);
        this.onmouseup = null;
    };
}

function addDnDHandlers(elem) {
    elem.addEventListener("dragstart", onDragStart, false);
    elem.addEventListener("mousedown", onMouseDown, false);
}

Array.from(document.querySelectorAll("#columns .column")).forEach(addDnDHandlers);

function enterDroppable(elem) {
    elem.style.background = "pink";
}

function leaveDroppable(elem) {
    elem.style.background = "";
}
