HTMLElement.prototype.show = function() {
    this.classList.add('visible');
};

HTMLElement.prototype.hide = function() {
    this.classList.remove('visible');
};

HTMLInputElement.prototype.focusAndSelect = function() {
    this.focus();
    this.select();
};