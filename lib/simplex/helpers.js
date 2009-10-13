var helpers = {
  optionsToArgs: function(options) {
    var args = ' ';
    for(p in options) {
      args += p + '="' + options[p] + '"';
    }
    args += ' ';
    return args;
  },
  
  linkTo: function(name, path, options) {
    var link = '<a href="' + path + '"';
    if(options) {
      link += this.optionsToArgs(options);
    }
    link += '>' + name + '</a>';
    return link;
  }
}

if(!this.document) {
  exports.helpers = helpers;
} else {
  window.helpers = helpers;
}
