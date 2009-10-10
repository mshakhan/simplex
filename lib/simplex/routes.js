var routes = {
  DEFAULT_PATH: '^\\/(\\w+)\\/?(\\w*)*\\/?(\\d*)',  
  ROOT_PATH: '^\/$',
  
  associations: {},
    
  map: function(regexp, handler) {
    this.associations[regexp] = handler 
  },

  root: function(handler) {
    this.map(this.ROOT_PATH, handler)
  },

  match: function(path) {
    for(regexp in this.associations) {
      var match = new RegExp(regexp).exec(path)
      if(match) {
        return this.associations[regexp](match)
      }      
    }
    return null
  },
  
  load: function() {
    require(simplex.utils.joinPath([
      simplex.env.root,
      'config',
      'routes.js'
    ]))    
  },
  
  defaultHandler: function(match) {
    var location = {}
    location.controller = match[1]
    location.action = match[2] ? match[2] : 'index'
    if(match[3]) {
      location.id = match[3]    
    }
    
    return location
  },
  
  enableDefaultRoute: function() {
    this.map(DEFAULT_PATH, this.defaultHandler)
  }
}  

exports.routes = routes
