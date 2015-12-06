'use strict';

var BASE_URL = 'https://api.soundcloud.com';
var CLIENT_ID = 'd2de86b6f2a8c564b00e1f78421fab9d';

var app = angular.module("localSoundApp", ['ngSanitize', 'firebase']);

app.controller("localSoundCtrl", ['$scope', '$http', '$sce', function ($scope, $http, $sce) {
        
    //To test local data; will be replaced by firebase data array.
    $scope.posts = [
        {
            username: "AboveandBeyond",
            full_name: "Above & Beyond",
            track_count: 0,
            rating: 0,
            post_date: Date(),
            soundcloud_url: "https://soundcloud.com/aboveandbeyond"
        },
        {
            username: "Tiesto",
            full_name: "Tiesto",
            track_count: 0,
            rating: 0,
            post_date: Date(),
            soundcloud_url: "https://soundcloud.com/tiesto"
        }
    ];
    
    
    $scope.sortReverse  = false;  // resets/initilizes the default sort order
    $scope.isVisible = []; // resets/initilizes the array for show buttons
    $scope.isHidden = []; // resets/initilizes the array for hide buttons
    $scope.seletedIndex = -1; // resets/initilizes the username selected

    //initilizes show/hide button array. Should be kept locally.
    for (var i=0; i<$scope.posts.length; i++) {
        $scope.isVisible[i] = 'true'    ;    
    }
    
    //Local method to add posts
    //TODO: change to add to firebase
    $scope.addPost = function() {
        $scope.post = {
            username: "AboveandBeyond",
            full_name: "Above & Beyond",
            track_count: 0,
            rating: 0,
            post_date: Date(),
            soundcloud_url: "https://soundcloud.com/aboveandbeyond"
            //location : $scope.getLocation()
        }
        
        $scope.posts.push($scope.post);
    }
      
    //$scope.addPost;
    
    
    //TODO: change from local to firebase
    $scope.upvote = function($index) {
        $scope.posts[$index].rating += 1;
    }
    
    //TODO: change from local to firebase
    $scope.downvote = function($index) {
        $scope.posts[$index].rating -= 1;
    }
    
    $scope.loadInfo = function($index) {
    	$scope.selectedIndex = $index;
    	var id = $scope.posts[$index].soundcloud_url;

    	//Shows or hides SoundCloud player depending on what button was pressed
        if($scope.isVisible[$index]) {
    		var src = "https://w.soundcloud.com/player/?url=" + id + "&amp;auto_play=false&amp;hide_related=false&amp;show_comments=false&amp;show_user=true&amp;show_reposts=false&amp;visual=true";
    		$scope.player = '<iframe width="100%" height="350" scrolling="yes" frameborder="no"  src=' + src + '></iframe>'
    		$scope.trustPlayer = $sce.trustAsHtml($scope.player);
    	} else {
    		$scope.trustPlayer = $sce.trustAsHtml('');
    	}
    	$scope.isVisible[$index] = !$scope.isVisible[$index];
		$scope.isHidden[$index] = !$scope.isHidden[$index];
        console.log($scope.isVisible);
    }
    
    console.log($scope.posts);
    
}])
.factory('featuredPosts', ['$firebaseArray', function($firebaseArray) {
    var myFirebase = new Firebase("https://localsound.firebaseio.com/");
    var ref = myFirebaseRef.push();
    
    return $firebaseArray(ref);
}])
.filter('fDate', [
    '$filter', function($filter) {
        return function(input, format) {
            return $filter('date')(new Date(input), format);
        };
    }
]);;