log = {
  level: 0,
  
  append: function(message) {
    simplex.utils.puts(message)
  }  
}

function puts(level, message) {
  simplex.utils.puts('[' + new Date() + ' ' + level + '] ' + message)
}

var levels = [
  'debug',
  'info',
  'error',
  'warning',
  'fatal',
  'unknown'
]


levels.forEach(function(level, levelIndex) {
  log[level] = function(message) {
    if(levelIndex >= log.level) {
      puts(level, message)          
    }
  }  
})

exports.log = log
