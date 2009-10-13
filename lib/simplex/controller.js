var STATUS = {
  OK:             200,
  notFound:       404,
  internalError:  500
}
  
var CONTENT_TYPE = {
  txt: 'text/plain',
  text: this.txt,
  
  htm: 'text/html',
  html: this.htm,
  
  stream: 'application/octet-stream',
  
  png: 'image/png',
  
  js: 'text/javascript',
  
  css: 'text/css',
  
  jpg: 'image/jpeg',
  jpeg: this.jpg,
  
  dflt: this.txt,
  fromExtension: function(extension) {
    return this[extension] || this.dflt
  } 
}

var controller = {
  ENCODING: 'binary',
  STATUS: STATUS,
  CONTENT_TYPE: CONTENT_TYPE,
  STATIC_PATH: 'static',
  
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
    var contentType = options.contentType
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
      contentType = contentType || CONTENT_TYPE.text
      body = options.text
    } else if(options.html) {
      contentType = contentType || CONTENT_TYPE.html
      body = options.html
    } else if(options.template) {
      contentType = contentType || CONTENT_TYPE.html
      body = simplex.view.render(options.template, options.locals)
    } else if(options.static) {
      node.fs.cat(options.static.path, this.ENCODING).addCallback(function(content) {
        if(!contentType) {
          contentType = CONTENT_TYPE.fromExtension(
            options.static.extension) 
        }
        
        body = content
      }).wait()
    }
    
    header["Content-Type"] = contentType
    response.sendHeader(status, header)
    response.sendBody(body, this.ENCODING)
    response.finish()  
  },
  
  handleStatus: function(status) {
    return '<h1 style="text-align:center">' +
    'Error ' + status + 
    '</h1><hr />' 
  }         
}

function locationExist(location) {
  if(!location.static) {
    var c = controller[location.controller]
    if(c) {
      if(c.actions[location.action]) {
        return true
      }
    }
    return false
  } else {
    var ret = true
    try {
      // why this method throws exception when file is not exists and wait() method called????
      node.fs.stat(location.static.path).wait()
    } catch(ex) {
      ret = false
    }
    return ret
  }
}

function process(location, request, response) {
  if(!location.static) {
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
  } else {
    controller.render(response, { static: location.static })        
  }
}

function Base(name, options) {
  this.name = name
  node.mixin(this, options)
  this.helpers = simplex.helpers
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
    node.mixin(this.params, location)
    action.call(this)
  }
}

controller.Base = Base
exports.controller = controller
