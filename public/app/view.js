angular.module('app.view', [])
.controller('ViewController', function($scope, $http, $routeParams, Snippets) {
  $scope.displayEditor = false;

  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/solarized_dark");
  editor.session.setMode("ace/mode/javascript");

  // use Ace's Range instead of the window's
  var Range = ace.require('ace/range').Range;

  // stop the browser's warning message
  editor.$blockScrolling = Infinity;

  // make editor read only
  editor.setReadOnly(true);

  $scope.init = function() {
    Snippets.retrieveSnippet($routeParams.id)
    .then(function(snippet) {
      console.log(snippet);
      if (snippet !== false) {
        // set editor to display
        $scope.displayEditor = true;

        // set snippet title
        $scope.title = snippet.data.title;
        $scope.username = snippet.data.userName;
        $scope.createdAt = snippet.data.createdAt;
        $scope.highlights = snippet.data.highlights;

        $scope.tags = snippet.data.tags;


        // add code to editor
        editor.setValue(snippet.data.code);

        snippet.data.highlights.forEach(function(highlight) {
          // set markers for highlighted code
          var range = new Range(highlight.start.row, highlight.start.column, highlight.end.row, highlight.end.column);
          editor.session.addMarker(range, "highlighter-" + highlight.color);
        });
      }
    });
  }();
});
