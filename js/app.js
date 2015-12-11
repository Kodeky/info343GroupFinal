'use strict';

var SOUNDCLOUD_BASE_URL = 'https://api.soundcloud.com';
var SOUNDCLOUD_CLIENT_ID = '3a0c15409a6b0e2610d61620155a549c';

var FACEBOOK_APP_ID = '1676203739293367';

var app = angular.module("localSoundApp", ['ngSanitize', 'firebase', "ui.router", 'ngCookies']);

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
}).controller("localSoundCtrl", ['$scope', '$http', '$sce', '$window', '$cookies', 'Profile', '$firebaseArray', function ($scope, $http, $sce, $window, $cookies, Profile, $firebaseArray) {
    
    var authRef = new Firebase('https://localsound.firebaseio.com/web/uauth');
    var ref = new Firebase('https://localsound.firebaseio.com');
    
    $scope.sortReverse  = false;  // resets/initilizes the default sort order
    $scope.isVisible = []; // resets/initilizes the array for show buttons
    $scope.isHidden = []; // resets/initilizes the array for hide buttons
    $scope.seletedIndex = -1; // resets/initilizes the username selected
    $scope.isLoggedIn = $cookies.getObject('firebaseAuth') != null ? true : false; //resets/intitilzes logged in trigger
    
    
    /*$scope.posts = {
        rating: 0,
        avatar: "http://www.google.com",
        username: "mnmckenn",
        soundcloud_url: "https://soundcloud.com/tiesto/clublife-by-tiesto-podcast-452-first-hour"
    }
    */
    
    //To test local data; will be replaced by firebase
    var firePosts = $firebaseArray(ref.child("Posts"));
    $scope.posts = firePosts;
    
    //console.log($scope.posts);
    
    //Initializes Show and hide for posts
    for (var i=0; i<$scope.posts.length; i++) {
        $scope.isVisible[i] = 'true'    ;    
    }
    
    //Local method to add posts
    //TODO: change to add to firebase
    $scope.addPost = function() {
        $scope.inputLink = document.getElementById("scLink").value;
        var authData = $cookies.getObject('firebaseAuth');
        ref.child("Posts").$add({
            uid: authData.uid,
            rating: 0,
            soundcloud_url: $scope.inputLink,
            dateTime: Date()

        }, function(error, eData) {
            if(error) {
                console.log(error);
            } else {
                console.log("Success");
            }
        })
    }
      
    //TODO: Add upvote functionality to featured posts
    $scope.upVote = function(index) {
        $scope.posts[index].rating += 1;
    }
    
    //TODO: Add downvote functionality to featured posts
    $scope.downVote = function(index) {
         $scope.posts[index].rating -= 1;
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
    
                $cookies.putObject('firebaseAuth', authData);
                $scope.isLoggedIn = true;
                $scope.$apply();
                $window.location.href = '#/';
            }
        });  
    }
    
    $scope.logout = function() {
        authRef.unauth();
        $cookies.remove('firebaseAuth');
        $window.location.href = '#/';
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
        $scope.showModal = !$scope.showModal;
    }


}])
.controller("signupCtrl", ['$scope', '$window', function($scope, $window) {

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
        $scope.registrationInfo.numPosts = 0;
        $scope.registrationInfo.posts = {};
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
                $window.location.href = '#/login';
            }
        })
    }



}])
.controller('profileCtrl', ['$scope', '$cookies', 'Profile', function($scope, $cookies, Profile) {
    var authData = $cookies.getObject('firebaseAuth');
    var profile = Profile(authData.uid)
    $scope.user = profile
    profile.$loaded().then(function(response) {
          console.log($scope.user.email);
    });
  
    
    $scope.saveProfile = function() {
      $scope.user.$save().then(function() {
        alert('Profile saved!');
      }).catch(function(error) {
        alert('Error!');
      });
    };
    
}])
.controller("newEventCtrl", ['$scope', '$firebaseObject', '$firebaseArray', function($scope, $firebaseObject, $firebaseArray) {

    var ref = new Firebase('https://localsound.firebaseio.com/Events');
    var fireEvents = $firebaseArray(ref);
    console.log(fireEvents);
    
    
    // object for storing new events created on /events page
    $scope.eventObject = {}; 
    
    // creates new event
    $scope.createEvent = function() {
        ref.$add({
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
    
    console.log($scope.events);
    // array for holding all event objects
    if ($scope.events === undefined) {
        $scope.events = [];
    }
    console.log($scope.events);
    
    // make sure main page is loaded, then show events
    ref.once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            $scope.events.push(childSnapshot.val());
        })
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

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
.factory("Profile", ["$firebaseObject",function($firebaseObject) {
    return function(id) {
      // create a reference to the database node where we will store our data
      var ref = new Firebase("https://localsound.firebaseio.com/Profiles");
      var profileRef = ref.child(id);

      // return it as a synchronized object
      return $firebaseObject(profileRef);
    }
  }
])
.filter('fDate', [
    '$filter', function($filter) {
        return function(input, format) {
            return $filter('date')(new Date(input), format);
        };
    }
]);