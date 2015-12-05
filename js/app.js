'use strict';

var BASE_URL = 'https://api.soundcloud.com';
var CLIENT_ID = 'd2de86b6f2a8c564b00e1f78421fab9d';

var app = angular.module("localSoundApp", ['ngSanitize', 'firebase']);

app.controller("localSoundCtrl", ['$scope', '$http', '$sce', function ($scope, $http, $sce) {
    
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
    ];
    

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
      
    $scope.addPost;
    
    
    //TODO: Add upvote functionality to featured posts
    $scope.upVote = function() {
        
    }
    
    //TODO: Add downvote functionality to featured posts
    $scope.downVote = function() {
        
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