var app = angular.module("localSoundApp", []);

app.controller("localSoundCtrl", function ($scope) {
    $scope.posts = [];
    

    
    $scope.addPost = function() {
        $scope.post = {
            username: "jDoe",
            full_name: "John Doe",
            track_count: 0,
            rating: 0,
            post_date: Date(),
            location : $scope.getLocation()
        }
        
        $scope.posts.push($scope.post);
    }
    
    $scope.addPost();
    console.log($scope.posts);
});