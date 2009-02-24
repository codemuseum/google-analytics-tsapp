var GoogleAnalyticsEdit = {
  init: function() {
    TSEditor.registerOnEdit('google-analytics', function(el) { GoogleAnalyticsEdit.instantiate(el); });
  },
  
  instantiate: function(el) {
    all = $(el).select('.all-editable')[0];
    
    // Observe site-wide, each analytics, and any adds
    all.select('.site-wide .readonly a').each(function(siteWideA) { siteWideA.observe('click', function() {
        all.select('.site-wide .readonly')[0].addClassName('hidden');
        all.select('.site-wide .editable')[0].removeClassName('hidden');
        all.select('.site-wide .editable input')[0].focus();
    }); });
    
    // Observe already existing keys
    all.select('.analytics-keys .analytics-key').each(function(keyEl) { GoogleAnalyticsEdit.observeKey(keyEl); });
    
    // Allow new keys to be created
    var creationCode = all.select('.new-analytics-key-code')[0].remove().innerHTML;
    var allKeys = all.select('div.analytics-keys')[0];
    all.select('a.add-analytics-key').each(function(addKeyA) { addKeyA.observe('click', function() {
      var newEl=$(document.createElement('div'));
      newEl.update(creationCode);
      newEl = newEl.firstDescendant().remove();
      allKeys.appendChild(newEl);
      if (newEl.getElementsBySelector('select')[0]) { newEl.getElementsBySelector('select')[0].focus(); }
      else {newEl.getElementsBySelector('input')[0].focus(); }
      GoogleAnalyticsEdit.observeKey(newEl);
    }); });
  },
  
  observeKey: function(key) {
    // Remove & Edit
    key.select('.remove a').each(function(a) { a.observe('click', function(ev) { key.remove(); }); });
    
    key.select('a.edit-analytics-key').each(function(a) { a.observe('click', function(ev) { 
      a.remove();
      GoogleAnalyticsEdit.outputSelectValue(key);
      key.select('.editable')[0].removeClassName('hidden');
      key.select('input')[0].focus();
    }); });
    
    key.select('select').each(function(selector) { selector.observe('change', function() {
    GoogleAnalyticsEdit.outputSelectValue(key);
      if (selector.options[selector.selectedIndex].value == '') {
        key.select('a.edit-analytics-key').each(function(a) { a.remove(); });
        key.select('.editable')[0].removeClassName('hidden');
        key.select('input')[0].focus();
      }
    }); });
  },
  
  outputSelectValue: function(key) {
    var selector = key.select('select')[0];
    var valSplitLocation = selector.options[selector.selectedIndex].value.indexOf("-");
    var analyticsKey = valSplitLocation != -1 ? selector.options[selector.selectedIndex].value.substring(valSplitLocation + 1) : '';
    key.select('input')[0].value = analyticsKey;
    key.select('input')[1].value = valSplitLocation != -1 ? selector.options[selector.selectedIndex].innerHTML : '';
  }
};
GoogleAnalyticsEdit.init();