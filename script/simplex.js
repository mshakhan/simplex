#!/usr/local/bin/node
// Poor man generator 

var simplex = require('../lib/simplex.js').simplex
var utils = simplex.utils

function run() {
  var args = process.ARGV
  if(args.length < 3) {
    printUsage()
    return
  }

  var action = args[2]

  if('generate' == action) {
    var options = {}
    options.type = args[3]
    options.name = args[4]
    generate(options)
  } else {
    printUsage()
    return
  }
}

function generate(options) {
  if(options.type == 'app') {
    generateApp(options.name)
  } else {
    printUsage()
    return
  }
}

function generateApp(name) {
  var appTemplateDir = utils.joinPath(
    [node.cwd(), 'script', 'templates', 'app'])
  utils.exec("mkdir " + name).wait()
  utils.exec("cp -rf " + appTemplateDir + '/* ' + 
    name).wait()
  utils.exec("cp -rf " + node.cwd() + '/*' + ' ' + 
    name + '/vendor/simplex').wait()
  utils.exec(
    "cp -rf " + node.cwd() + '/lib/simplex/helpers.js' + ' ' + 
    name + '/static').wait()
  utils.exec("find " + name + " -name dummy.txt -exec rm {} \;")
  utils.puts('Completed')
}

function printUsage() {
  utils.puts('simplex.js generate type [options]')
  utils.puts('\t(only generate app path is now available)')
}

run()
