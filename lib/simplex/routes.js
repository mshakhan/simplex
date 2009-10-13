var routes = {
  DEFAULT_PATH: '^\\/(\\w+)\\/?(\\w*)*\\/?(\\d*)',  
  DEFAULT_STATIC_PATH: '^(\\/(\\w+))\\.(htm|html|ico|jpg|gif|png|txt)$',
  ROOT_PATH: '^\\/$',
  
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
        var location = this.associations[regexp](match)
        if(location) { return location }
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
  
  staticHandler: function(match) {
    return { static: { path: match[0], extension: match[3] } }
  },
  
  enableDefaultRoute: function() {
    this.map(this.DEFAULT_PATH, this.defaultHandler)
  },
  
  enableStaticHandler: function() {
    this.map(this.DEFAULT_STATIC_PATH, this.staticHandler)    
  }
}  

exports.routes = routes
