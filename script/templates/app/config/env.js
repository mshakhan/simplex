node.mixin(require('../vendor/simplex/lib/simplex.js'))

simplex.env = {
  type: 'dev',
  root: node.cwd(),
  port: 8000
}
