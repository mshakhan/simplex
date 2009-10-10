var http              = require("/http.js")

var simplex = {}

node.mixin(simplex, require("simplex/utils.js"))
node.mixin(simplex, require('simplex/log.js'))
node.mixin(simplex, require('simplex/view.js'))
node.mixin(simplex, require('simplex/model.js'))
node.mixin(simplex, require('simplex/routes.js'))
node.mixin(simplex, require('simplex/controller.js'))

simplex.env = simplex.env || {}
simplex.env.port = simplex.env.port || 8000

simplex.start = function() {  
  simplex.utils.loadInitializers()
  simplex.routes.load()
  simplex.model.loadAll()
  simplex.controller.loadAll()
  
  http.createServer(function(request, response) {
    try {
      simplex.controller.dispatch(request, response)        
    } catch(ex) {
      simplex.handleException(ex, response)
    }
  }).listen(env.port)
  simplex.log.info('Server started on port ' + env.port)
}

simplex.handleException = function(ex, response) {
  simplex.log.error(ex.message)
  simplex.log.append(ex.stack)
  var body = null
  if('dev' == env.type) {
    body = '<h3>' + ex.message + '</h3>'
    body += '<pre>' + ex.stack + '</pre>'
    log.append(body)
    simplex.controller.render(response, { 
      status: simplex.controller.STATUS.internalError,
      body: body 
    })  
  }
}

exports.simplex = simplex
