/** @jsx React.DOM */

'use strict'

var CommentBox = require('./CommentBox');

module.exports = function() {

  // render Component 
  React.render(  
    <CommentBox url="assets/public/comments.json" pollInterval={2000} />,
    document.getElementById("example")
  );  
}