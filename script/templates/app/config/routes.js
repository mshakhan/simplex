simplex.routes.root(function() {
  return { 
    controller: 'root', 
    action: 'index' 
  }
})

simplex.routes.enableStaticHandler()
simplex.routes.enableDefaultRoute()

