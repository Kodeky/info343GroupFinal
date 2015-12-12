//AngularJS for LocalSound WebSite
//Developed by Matthew McKenna, Gianni Mancinelli, and Sam Cochrane
//UW INFO 343 D 

'use strict';

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
})//Controller for homepage and overall functionality.
.controller("localSoundCtrl", ['$scope', '$http', '$sce', '$window', '$cookies', 'Profile', '$firebaseArray', function ($scope, $http, $sce, $window, $cookies, Profile, $firebaseArray) {
    
    var authRef = new Firebase('https://localsound.firebaseio.com/web/uauth'); //ref to firebase app auth
    var ref = new Firebase('https://localsound.firebaseio.com'); //ref to firebase app
    
    $scope.isVisible = []; // used later determine which soundcloud button is pressed
    $scope.hasVoted = [];  //used to determine if user has voted. KNOWN BUG: only works locally
    $scope.selectedIndex = -1; // used later to determine whic soundcloud button is sellected
    
    //Session Cookie for website. Set during login.
    $scope.isLoggedIn = $cookies.getObject('firebaseAuth') != null ? true : false;
   
    //Loads Syncronized array with Firebase for posts
    $scope.posts = [];
    var firePosts = $firebaseArray(ref.child("Posts"));
    firePosts.$loaded().then(function(x) {
        angular.forEach(firePosts, function(data, index) {
            var tempObj = data;
            var profile = Profile(data.uid)
            profile.$loaded().then(function(response) {
                tempObj.username = profile.username;
                tempObj.avatar = profile.avatarUrl;
            });
            $scope.posts.push(tempObj);
            $scope.isVisible[data.$id] = false;
            $scope.hasVoted[data.$id] = false;
        });
    })
    .catch(function(error) {
        console.log("Error:", error);
    });
    
    // Array for holding all event objects
    if ($scope.events === undefined) {
        $scope.events = [];
    }
    
    // Reference to firebase
    var eventRef = new Firebase('https://localsound.firebaseio.com/Events');
    
    // Make sure main page is loaded, then adds events
    eventRef.once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            $scope.events.push(childSnapshot.val());
        })
    // Checks to see if objects were able to load, throws error if not
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });


    
    //Adds post to firebase
    $scope.addPost = function() {
        $scope.inputLink = document.getElementById("scLink").value;
        var authData = $cookies.getObject('firebaseAuth');
        ref.child("Posts").push({
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
        $window.location.href = '/';
    }
      
    //Upvote functionality for posts
    $scope.upVote = function(postId) {
        var post = firePosts.$getRecord(postId);
        console.log(postId);
        post.rating += 1;
        firePosts.$save(post);
        $scope.hasVoted[postId] = true;
    }
    
    //Downvote functionality for featured posts
    $scope.downVote = function(postId) {
        var post = firePosts.$getRecord(postId);
        post.rating -= 1;
        firePosts.$save(post);
        $scope.hasVoted[postId] = true;
    }
    
    //Logs user in using Firebase, sets cookie
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
                $window.location.href = 'index.html#/';
            }
        });  
    }
    
    //Logs user out from Firebase and clears cookies
    $scope.logout = function() {
        authRef.unauth();
        $cookies.remove('firebaseAuth');
        $window.location.href = '/';
    }
    
    //Loads featured info
    $scope.loadInfo = function(index, soundcloud_url) {
    	var id = soundcloud_url;

    	//Shows or hides SoundCloud player depending on what button was pressed
        if(!$scope.isVisible[index]) {
    		var src = "https://w.soundcloud.com/player/?url=" + id + "&amp;auto_play=false&amp;hide_related=false&amp;show_comments=false&amp;show_user=true&amp;show_reposts=false&amp;visual=true";
    		$scope.player = '<iframe width="100%" height="350" scrolling="yes" frameborder="no"  src=' + src + '></iframe>'
    		$scope.trustPlayer = $sce.trustAsHtml($scope.player);
            $scope.isVisible[index] = true;
           
    	} else {
    		$scope.trustPlayer = $sce.trustAsHtml('');
            $scope.isVisible[index] = false;
    	}
            $scope.isVisible[$scope.selectedIndex] = false;
    	    $scope.selectedIndex = index;
    }
    
    
    //used for new post model
    $scope.showModal = false;
    $scope.toggleModal = function () {
        $scope.showModal = !$scope.showModal;
    }


}])//Control for signup page
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
    
    //creates profile data on firebase
    $scope.createProfileData = function(authData) {
        delete $scope.registrationInfo.password;
        $scope.registrationInfo.posts = {};
        ref.child(authData.uid).set($scope.registrationInfo);
    }
    
    //creates new firebase authentication user
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



}])//Controleer for Profile partial
.controller('profileCtrl', ['$scope', '$cookies', 'Profile', function($scope, $cookies, Profile) {
    var authData = $cookies.getObject('firebaseAuth');
    var profile = Profile(authData.uid)
    $scope.user = profile
    profile.$loaded().then(function(response) {
    });
}])//Controller for newEvents partial
.controller("newEventCtrl", ['$scope', '$firebaseObject', '$firebaseArray', function($scope, $firebaseObject, $firebaseArray) {

    // Reference to firebase
    var ref = new Firebase('https://localsound.firebaseio.com/Events');
    
    // Stores new events created on /events page
    $scope.eventObject = {}; 
    
    // Creates new event
    $scope.createEvent = function() {
        ref.push({
            city: $scope.eventObject.city,
            title: $scope.eventObject.title,
            body: $scope.eventObject.body,
            dateTime: $scope.eventObject.dateTime.toString(),
            duration: $scope.eventObject.duration
        }, function(error, eData) {
            if(error) {
                console.log(error);
            } else {
                console.log("Success");
                window.location.reload();
            }
        })
    }
    
}])//modal for new posts
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
    }})//Creates a profile firebase object
.factory("Profile", ["$firebaseObject",function($firebaseObject) {
    return function(id) {
      // create a reference to the database node where we will store our data
      var ref = new Firebase("https://localsound.firebaseio.com/Profiles");
      var profileRef = ref.child(id);

      // return it as a synchronized object
      return $firebaseObject(profileRef);
    }
  }
])//formating date for our page
.filter('fDate', [
    '$filter', function($filter) {
        return function(input, format) {
            return $filter('date')(new Date(input), format);
        };
    }
])
// Orders events depending on how long they are available
.filter('orderEventBy', function(){
 return function(input, attribute) {
    if (!angular.isObject(input)) return input;

    var array = [];
    for(var objectKey in input) {
        array.push(input[objectKey]);
    }

    array.sort(function(a, b){
        a = parseInt(a[attribute]);
        b = parseInt(b[attribute]);
        return a - b;
    });
    return array;
 }
});;