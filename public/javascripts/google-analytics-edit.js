var GoogleAnalyticsEdit = {
  init: function() {
    TSEditor.registerOnEdit('google-analytics', function(el) { GoogleAnalyticsEdit.instantiate(el); });
  },
  
  instantiate: function(el) {
    var self = this;
    var all = this.findTag(el, 'div', 'all-editable');
    var sitewide = this.findTag(all, 'div', 'site-wide');
    
    // Observe site-wide, each analytics, and any adds
    this.findTag(sitewide, 'a', 'edit-site-wide-analytics-key').onclick = function() {
      self.addClass(self.findTag(sitewide, 'div', 'readonly'), 'hidden');
      self.removeClass(self.findTag(sitewide, 'div', 'editable'), 'hidden');
      sitewide.getElementsByTagName('input')[0].focus();
    }
    
    // Observe already existing keys
    var customBox = this.findTag(all, 'div', 'analytics-keys');
    var customs = this.findEveryTag(customBox, 'div', 'analytics-key');
    for (var i=0; i < customs.length; ++i) this.observeKey(customs[i]);
    
    // Allow new keys to be created
    var codeBox = this.findTag(all, 'div', 'new-analytics-key-code');
    var creationCode = codeBox.innerHTML;
    codeBox.parentNode.removeChild(codeBox);
    
    this.findTag(all, 'a', 'add-analytics-key').onclick = function() {
      var newEl=document.createElement('div');
      newEl.innerHTML = creationCode;
      newEl = self.firstDescendant(newEl);
      newEl.parentNode.removeChild(newEl);
      customBox.appendChild(newEl);
      if (newEl.getElementsByTagName('select')[0]) { newEl.getElementsByTagName('select')[0].focus(); }
      else {newEl.getElementsByTagName('input')[0].focus(); }
      self.observeKey(newEl);
    };
  },
  
  observeKey: function(key) {
    var self = this;
    var edit = this.findTag(key, 'a', 'edit-analytics-key');
    
    // Remove & Edit
    this.findTag(key, 'a', 'remove-button').onclick = function() { key.parentNode.removeChild(key); };
    
    if (edit) {
      edit.onclick = function() {
        edit.onclick = null;
        edit.parentNode.removeChild(edit);
        edit = null;
        self.outputSelectValue(key);
        self.removeClass(self.findTag(key, 'div', 'editable'), 'hidden');
        key.getElementsByTagName('input')[0].focus();
      };
    }
    
    var selector = key.getElementsByTagName('select')[0];
    selector.onchange = function() {
      self.outputSelectValue(key);
      if (selector.options[selector.selectedIndex].value == '') {
        if (edit) { 
          edit.onclick = null;
          edit.parentNode.removeChild(edit);
          edit = null;
        }
        self.removeClass(self.findTag(key, 'div', 'editable'), 'hidden');
        key.getElementsByTagName('input')[0].focus();
      }
    }
  },
  
  outputSelectValue: function(key) {
    var selector = key.getElementsByTagName('select')[0];
    var valSplitLocation = selector.options[selector.selectedIndex].value.indexOf("-");
    var analyticsKey = valSplitLocation != -1 ? selector.options[selector.selectedIndex].value.substring(valSplitLocation + 1) : '';
    key.getElementsByTagName('input')[0].value = analyticsKey;
    key.getElementsByTagName('input')[1].value = valSplitLocation != -1 ? selector.options[selector.selectedIndex].innerHTML : '';
  },
  
  findTag: function(base, tagName, className) {
    var tags = base.getElementsByTagName(tagName);
    for (var i = 0; i < tags.length; ++i) {
      var el = tags[i];
      if (this.hasClass(el, className)) { return el; }
    }
  },
  findEveryTag: function(base, tagName, className) {
    var tags = base.getElementsByTagName(tagName);
    var matches = new Array();
    for (var i = 0; i < tags.length; ++i) {
      var el = tags[i];
      if (this.hasClass(el, className)) { matches.push(el); }
    }
    return matches;
  },
  hasClass: function(ele,cls) {
  	return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
  },

  addClass: function(ele,cls) {
  	if (!this.hasClass(ele,cls)) ele.className += " "+cls;
  },

  removeClass: function(ele,cls) {
  	if (this.hasClass(ele,cls)) {
      	var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
  		ele.className=ele.className.replace(reg,' ');
  	}
  },
  firstDescendant: function(element) {
    element = element.firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return element;
  }
  
};
GoogleAnalyticsEdit.init();