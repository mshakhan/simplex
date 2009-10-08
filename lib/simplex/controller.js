var STATUS = {
  OK:       200,
  notFound: 404,
  internalError: 500
}
  
var CONTENT_TYPE = {
  text: 'text/plain',
  html: 'text/html'  
}

var controller = {
  STATUS: STATUS,
  
  CONTENT_TYPE: CONTENT_TYPE,
  
  define: function(name, options) {
    controller[name] = new Base(name, options)
  },
  
  dispatch: function(request, response) {
    simplex.log.info('requested: "' + request.uri.path + '"')
    var location = simplex.routes.match(request.uri.path)
    if(location && locationExist(location)) {
      process(location, request, response)
    } else {
      this.render(response, { status: STATUS.notFound })    
    }
  },
  
  loadAll: function() {
    simplex.utils.requirePath([
      simplex.env.root,
      'controllers'
    ])  
  },
  
  render: function(response, options) {
    if (!options) { options = {} }
    
    var status = options.status || STATUS.OK
    var contentType = options.contentType || CONTENT_TYPE.text
    var body = options.body || ''
    var header = options.header || {}
    
    if(options.status) {
      if (status != STATUS.OK) {
        simplex.log.append('status: ' + status)  
        contentType = CONTENT_TYPE.html
        body = this.handleStatus(status)
        if(options.body) {
          body += options.body
        }      
      }
    } else if(options.text) {
      body = options.text
    } else if (options.html) {
      contentType = CONTENT_TYPE.html
      body = options.html
    } else if (options.template) {
      contentType = CONTENT_TYPE.html
      body = simplex.view.render(options.template, options.locals)
    }
    
    header["Content-Type"] = contentType
    response.sendHeader(status, header)
    response.sendBody(body)
    response.finish()  
  },
  
  handleStatus: function(status) {
    return '<h1 style="text-align:center">' +
    'Error ' + status + 
    '</h1><hr />' 
  }         
}

function locationExist(location) {
  var c = controller[location.controller]
  if(c) {
    if(c.actions[location.action]) {
      return true
    }
  }
  return false
}

function process(location, request, response) {
  var c = controller[location.controller]
  c.process(
    location, 
    request, 
    response
  )
  if(!c.renderOptions) {
    c.renderOptions = {}
  }
  c.renderOptions.locals = c
  if (!c.rendered) {
    c.renderOptions.template = 
      simplex.utils.joinPath([
        c.name,
        location.action
      ])
  }
  controller.render(response, c.renderOptions)      
}

function Base(name, options) {
  this.name = name
  simplex.utils.copyMembers(options, this)
}

Base.prototype.render = function(options) {
  this.renderOptions  = options  
  this.rendered       = true
}

Base.prototype.process = function(location, request, response) {
  var action = this.actions[location.action]
  if (action) {
    this.request = request
    this.response = response
    this.params = request.uri.params
    for(p in location) {
      this.params[p] = location[p]      
    }
    action.call(this)
  }
}

controller.Base = Base
exports.controller = controller
