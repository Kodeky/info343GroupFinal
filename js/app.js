'use strict';


	
angular.module('CoffeeApp', ['ngSanitize', 'ui.router']) //ngSanitize for HTML displaying

.config(function($stateProvider) {
	$stateProvider.state('home', {
		url: '/',
		templateUrl: 'partials/home.html',
		//controller: 'MoviesCtrl'
	})
	.state('orders', {
		url: '/orders',
		templateUrl: 'partials/orders.html',
		controller: 'ProductsCtrl'
	})
	.state('detail', {
		url: '/orders/{beanID}',
		templateUrl: 'partials/order-detail.html',
		controller: 'DetailCtrl'

	})
	.state('cart', {
		url: '/cart',
		templateUrl: 'partials/cart.html',
		controller: 'CartCtrl'

	})
})
.config(function($urlRouterProvider) {
	$urlRouterProvider.otherwise('/home');
})


//For orders data browser
.controller('ProductsCtrl', ['$scope', '$http', function($scope, $http) {

	$scope.sortingCriteria = '';

	$http.get('data/products.json').then(function(response) {
 		$scope.orders = response.data;
 	});

}])

.controller('DetailCtrl', ['$scope', '$http', '$stateParams', '$filter', 'orderFactory', function($scope, $http, $stateParams, $filter, orderFactory) {
	
	var theCoffeeID = $stateParams.beanID;
	
	$http.get('data/products.json').then(function(response) {
 		var data = response.data;
		$scope.order = $filter('filter')(data, { //filter the array
			id: theCoffeeID //for items whose id property is targetId
		}, true)[0]; //save the 0th result
		
 	});
	
	$scope.postToCart = function(theNewItem) {
		theNewItem.name = $scope.order.name;
		console.log(theNewItem.name);
		theNewItem.price = $scope.order.price;
		console.log(theNewItem.price);
		orderFactory.postToCart(theNewItem);
	}
	
}])
	
.controller('CartCtrl', ['$scope', '$http', 'orderFactory',function($scope, $http, orderFactory) {
	$scope.ourOrders = orderFactory.orders;
	
	$scope.getTotal = function(){
		var total = 0;
		for(var i = 0; i < $scope.ourOrders.length; i++){
			var cost = $scope.ourOrders.price[i] * $scope.ourOrders.quantity[i];
			total += (cost);
		}
		return total;
	}
	
	$scope.submitOrder = function() {
		localStorage.clear();
		alert("thanks for your order!");
		
	}
}])

.factory('orderFactory', function() {
  var service = {};
  
  var temp = localStorage.orders;
  temp = angular.fromJson(temp);
  
  service.orders = [];
  if(temp != undefined) {
	service.orders = (temp);
  }
  
  
  service.postToCart = function(newItem){
		
		var name = newItem.name;
		var quantity = newItem.quantity;
		var grind = newItem.grind;
		var price = newItem.price;
		var theNewItem = '{"name":"'+name+'","quantity":"'+quantity+'","grind":"'+grind+'","price":"'+price+'"}'; //object that is the new post
		theNewItem = theNewItem.toString();
		
		// Store
		service.orders.push(angular.fromJson(theNewItem));
		localStorage.orders = angular.toJson(service.orders,false);

  }
  
  return service;
});

