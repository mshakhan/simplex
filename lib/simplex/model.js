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
  node.mixin(this, options)
  if(!this.db) {
    this.db = simplex.env.db
    if(!this.db) {
      throw new Error('No database configuration for model ' + name)
    }
  }
}

Base.prototype.create = function(options) {
  simplex.utils.puts(this.adapter)
}

model.Base = Base
exports.model = model
