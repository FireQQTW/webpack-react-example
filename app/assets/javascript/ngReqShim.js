// ngReqShim
module.exports = function() {
  global.ngReqShim = function () { return window.angular };  
}
