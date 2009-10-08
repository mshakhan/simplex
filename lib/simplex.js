var http              = require("/http.js")

var simplex = {}

node.mixin(simplex, require("simplex/utils.js"))
node.mixin(simplex, require('simplex/log.js'))
node.mixin(simplex, require('simplex/view.js'))
node.mixin(simplex, require('simplex/model.js'))
node.mixin(simplex, require('simplex/routes.js'))
node.mixin(simplex, require('simplex/controller.js'))

simplex.start = function(env) {
  simplex.env = env
  simplex.utils.loadInitializers()
  require(simplex.utils.joinPath([
    simplex.env.root,
    'config',
    'routes.js'
  ]))

  simplex.model.loadAll()
  simplex.controller.loadAll()
  
  http.createServer(function(request, response) {
    try {
      simplex.controller.dispatch(request, response)        
    } catch(ex) {
      handleException(ex, response)
    }
  }).listen(env.port)
  simplex.log.info('Server started on port ' + env.port)
}

function handleException(ex, response) {
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
