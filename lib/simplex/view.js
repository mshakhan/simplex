// TODO! implement layouts

var cache = {}

var view = {
  render: function(templateName, data) {
    data = data || {}
    
    var fileName = simplex.utils.joinPath(
      [simplex.env.root, 'views', templateName + '.ejs']
    )
    var template = null
    node.fs.cat(fileName, 'binary').addCallback(function(content) {
      template = content
    }).wait()

    return ejs(template, data, fileName)
  }  
}
// Idea from http://ejohn.org/blog/javascript-micro-templating/
function compile(template) {
  var fn = new Function("obj",
    "var buffer=[], print = function() { buffer.push.apply(buffer, arguments); };" +
    "with(obj) { buffer.push('" +
    template
      .replace(/[\r\t\n]/g, " ")
      .split("<%").join("\t")
      .replace(/((^|%>)[^\t]*)'/g, "$1\r")
      .replace(/\t=(.*?)%>/g, "',$1,'")
      .split("\t").join("');")
      .split("%>").join("buffer.push('")
      .split("\r").join("\\'")
  + "'); } return buffer.join('');")
  
  return fn
}

function ejs(template, data, cacheName) {
  var compiledTemplate = cacheName ? cache[cacheName] : compile(template)
  if(!compiledTemplate) { compiledTemplate = compile(template) }
  if(cacheName) { cache[cacheName] = compiledTemplate }
  
  return compiledTemplate(data)
}

exports.view = view
