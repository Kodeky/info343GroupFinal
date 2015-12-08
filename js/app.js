'use strict';

var SOUNDCLOUD_BASE_URL = 'https://api.soundcloud.com';
var SOUNDCLOUD_CLIENT_ID = '3a0c15409a6b0e2610d61620155a549c';

var FACEBOOK_APP_ID = '1676203739293367';

var app = angular.module("localSoundApp", ['ngSanitize', 'firebase', "ui.router"]);

app.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/');
	$stateProvider
	    .state('index', {
	        url: '/',
			templateUrl: "templates/home.html"
	    })
        .state('profile', {
            url: '/profile',
            templateUrl: "templates/profile.html"
        })
        .state('events', {
            url: '/events',
            templateUrl: "templates/events.html"
        })
        .state('signup', {
            url: '/signup',
            templateUrl: "templates/signup.html"
        })
}).controller("localSoundCtrl", ['$scope', '$http', '$sce', function ($scope, $http, $sce) {
    
    var ref = new Firebase("https://localsound.firebaseio.com");
                               
    $scope.sortReverse  = false;  // resets/initilizes the default sort order
    $scope.isVisible = []; // resets/initilizes the array for show buttons
    $scope.isHidden = []; // resets/initilizes the array for hide buttons
    $scope.seletedIndex = -1; // resets/initilizes the username selected
    $scope.isLoggedIn = false; //resets/intitilzes logged in trigger

    
    //To test local data; will be replaced by firebase
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
    
    //Initializes Show and hide for posts
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
      
    //TODO: Add upvote functionality to featured posts
    $scope.upVote = function() {
         $scope.posts[$index].rating += 1;
    }
    
    //TODO: Add downvote functionality to featured posts
    $scope.downVote = function() {
         $scope.posts[$index].rating -= 1;
    }
    
    //Facebook OAuth login
    $scope.login = function() {        
        ref.authWithOAuthPopup("facebook", function(error, authData) {
            if (error) {
                alert("Login Failed!", error);
            } else {
                $scope.isLoggedIn = true;
                $scope.$digest();
            }
        }, {
            remember: "sessionOnly"
        });
    }
    
    $scope.logout = function() {
        $scope.isLoggedIn = false;
    }
    
    //Loads featured info
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
    }
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