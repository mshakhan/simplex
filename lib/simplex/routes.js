var routes = {
  associations: {},
  
  map: function(regexp, handler) {
    this.associations[regexp] = handler 
  },

  root: function(handler) {
    this.map('^\/$', handler)
  },

  match: function(path) {
    for(regexp in this.associations) {
      var match = new RegExp(regexp).exec(path)
      if(match) {
        return this.associations[regexp](match)
      }      
    }
    return null
  }  
}

exports.routes = routes
