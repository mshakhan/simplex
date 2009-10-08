var model = {
  define: function(name, options) {
    return new Base(name, options)
  },
  
  loadAll: function() {
    simplex.utils.requirePath([
      simplex.env.root,
      'models'
    ])
  }   
}

// This object is now empty. User can extend it in initializer
function Base(name, options) {
  this.name = name
  utils.copyMembers(options, this)
}

model.Base = Base
exports.model = model
