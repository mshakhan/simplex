var utils = {}
node.mixin(utils, require('/utils.js'))

utils.copyMembers = function(from, to) {
  for(p in from) {
    to[p] = from[p]
  }
}

utils.joinPath = function(path) {
  return path.join('/')
}  

utils.ls = function(path) {
  var files = ''
  utils.exec("ls " + utils.joinPath(path)).addCallback(function(stdout, e) {
    files = stdout
  }).wait()
  files = files.replace(/\n$/g, '')
  files = files.split('\n')
  if (1 == files.length && '' == files[0]) {
    files = []
  }
  return files
}

utils.requirePath = function(path) {
  var files = utils.ls(path)
  for(var i = 0; i < files.length; ++i) {
    require(utils.joinPath([utils.joinPath(path), files[i]]))
  } 
} 

utils.loadInitializers = function() {
  utils.requirePath([
    simplex.env.root,
    'config',
    'initializers'
  ])
} 

exports.utils = utils