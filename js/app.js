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
        .state('login', {
            url: '/login',
        templateUrl: "templates/login.html"
        })
}).controller("localSoundCtrl", ['$scope', '$http', '$sce', function ($scope, $http, $sce) {
    
    var authRef = new Firebase('https://localsound.firebaseio.com/web/uauth')
    
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
    $scope.addPost = function () {
        $scope.inputLink = document.getElementById("scLink").value;
        console.log($scope.inputLink);

        $scope.post = {
            username: "AboveandBeyond",
            full_name: "Above & Beyond",
            track_count: 0,
            rating: 0,
            post_date: Date(),
            soundcloud_url: $scope.inputLink
            //location : $scope.getLocation()
        }
        
        $scope.posts.push($scope.post);
        console.log($scope.posts);
    }
      
    //TODO: Add upvote functionality to featured posts
    $scope.upVote = function() {
        $scope.posts[$index].rating += 1;
        console.log($scope.posts[$index].rating);
    }
    
    //TODO: Add downvote functionality to featured posts
    $scope.downVote = function() {
         $scope.posts[$index].rating -= 1;
    }
    
    $scope.login = function(email, password) {     
        authRef.authWithPassword({
            email: email,
            password: password
        }, function(error, authData) {
            if(error) {
                console.log("Login Failed!", error);
                deffered.reject(error);
            } else {
                console.log(authData);
                $scope.isLoggedIn = true;
                $scope.$apply();
            }
        });  
    }
    
    $scope.logout = function() {
        authRef.unauth();
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

    $scope.showModal = false;
    $scope.toggleModal = function () {
        console.log("opened or closed new post modal");
        $scope.showModal = !$scope.showModal;
    }


}])
.controller("signupCtrl", ['$scope', 'profileData', function($scope, profileData) {

    var ref = new Firebase('https://localsound.firebaseio.com/Profiles');
    
    $scope.confirmPassword = "";
    $scope.registrationInfo = {};   
    $scope.passwordMatch = function() {
        
        if(($scope.registrationInfo.password == $scope.confirmPassword) || $scope.confirmPassword == "") {
            return true;
        } else {
            false
        }
    }
    
    $scope.createProfileData = function(authData) {
        delete $scope.registrationInfo.password;
        ref.child(authData.uid).set($scope.registrationInfo);
    }
    
    $scope.register = function() {
        ref.createUser({
            email: $scope.registrationInfo.email,
            password: $scope.registrationInfo.password
        }, function(error, authData) {
            if(error) {
                console.log(error);
            } else {
                console.log("Success");
                $scope.createProfileData(authData);
            }
        })
    }



}])
.controller("newEventCtrl", ['$scope', 'eventData', function($scope, eventData) {

    var ref = new Firebase('https://localsound.firebaseio.com/Events');
    
    $scope.eventObject = {};   
    
    $scope.createEvent = function() {
        ref.push({
            city: $scope.eventObject.city,
            title: $scope.eventObject.title,
            body: $scope.eventObject.body,
            dateTime: $scope.eventObject.dateTime.toString(),
            link: $scope.eventObject.link,
            duration: $scope.eventObject.duration
        }, function(error, eData) {
            if(error) {
                console.log(error);
            } else {
                console.log("Success");
            }
        })
    }
}])
.directive('modal', function () {
    return {
        template: '<div class="modal fade">' + 
            '<div class="modal-dialog">' + 
              '<div class="modal-content">' + 
                '<div class="modal-header">' + 
                  '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                  '<h4 class="modal-title">{{ title }}</h4>' + 
                '</div>' + 
                '<div class="modal-body" ng-transclude></div>' + 
              '</div>' + 
            '</div>' + 
          '</div>',
        restrict: 'E',
        transclude: true,
        replace:true,
        scope:true,
        link: function postLink(scope, element, attrs) {
            scope.title = attrs.title;

            scope.$watch(attrs.visible, function(value){
                if(value == true)
                    $(element).modal('show');
                else
                    $(element).modal('hide');
            });

            $(element).on('shown.bs.modal', function(){
                scope.$apply(function(){
                    scope.$parent[attrs.visible] = true;
                });
            });

            $(element).on('hidden.bs.modal', function(){
                scope.$apply(function(){
                    scope.$parent[attrs.visible] = false;
                });
            });
        }
    }})
.factory('profileData', ['$firebaseArray', function($firebaseArray){
    var myFirebaseRef = new Firebase("https://localsound.firebaseio.com/Profiles");
    var ref = myFirebaseRef.push();
    
    return $firebaseArray(ref);
}])
.factory('featuredPosts', ['$firebaseArray', function($firebaseArray) {
    var myFirebaseRef = new Firebase("https://localsound.firebaseio.com/Posts");
    var ref = myFirebaseRef.push();
    
    return $firebaseArray(ref);
}])
.factory('eventData', ['$firebaseArray', function($firebaseArray){
    var myFirebaseRef = new Firebase("https://localsound.firebaseio.com/Events");
    var ref = myFirebaseRef.push();
    
    return $firebaseArray(ref);
}])
.filter('fDate', [
    '$filter', function($filter) {
        return function(input, format) {
            return $filter('date')(new Date(input), format);
        };
    }
]);