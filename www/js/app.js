// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function ($ionicPlatform) {
		$ionicPlatform.ready(function () {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			}
			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleDefault();
			}
		});
	})
	.config(function ($stateProvider, $urlRouterProvider) {

		// Ionic uses AngularUI Router which uses the concept of states
		// Learn more here: https://github.com/angular-ui/ui-router
		// Set up the various states which the app can be in.
		// Each state's controller can be found in controllers.js
		$stateProvider

		// setup an abstract state for the tabs directive
			.state('a', {
			url: "/a",
			abstract: true,
			templateUrl: "templates/menu.html"
		})

		// Each tab has its own nav history stack:

		.state('a.dash', {
			url: '/dash',
			views: {
				'content': {
					templateUrl: 'shoppingList.html',
					controller: function ($scope, Items, $ionicModal, $timeout,$q) {
						$scope.mode = 'normal';
						$scope.selectedItems = {};
						$scope.title = function(){
							return $scope.mode === 'edit' ? Object.keys($scope.selectedItems).length+ ' Selected': 'Shopping List';
						};
						function initialModal() {
							$scope.modal = {
								input: '',
								closeText: 'Cancel',
								buttonText: 'Create Item'
							};
						}
						$ionicModal.fromTemplateUrl('new-item-modal.html', {
							scope: $scope,
							focusFirstInput: true,
						}).then(function (modal) {
							$scope.newItemModal = modal;
							initialModal();
						});

						function refreshList() {
							Items.all().then(function (results) {
								console.log('refresh list');
								console.log(results);
								$scope.recentItems = results;
							});
							Items.allCompleted().then(function(results){
								$scope.completedItems = results;
							});
						}
						$scope.create = function (input) {
							Items.create(input).then(function (itemAdded) {
								$timeout(function () {
									keepKeyboardOpen();
									refreshList();
									$scope.modal.input = '';
									$scope.modal.buttonText = 'Create Another Item';
									$scope.modal.closeText = 'That\'s Enough';
								});
							});
						};
						$scope.showModal = function () {
							$scope.newItemModal.show().then(
								function () {
									keepKeyboardOpen();
									if (typeof cordova !== 'undefined' && !cordova.plugins.Keyboard.isVisible) {
										cordova.plugins.Keyboard.show();
									}
								}
							);
						};
						$scope.closeModal = function () {
							jQuery('#modal-input').off('blur');
							if (typeof cordova !== 'undefined' && cordova.plugins.Keyboard.isVisible) {
								cordova.plugins.Keyboard.close();
							}
							$timeout(function () {
								$scope.newItemModal.hide().then(function(){
									initialModal();
								});
							}, 320);
						};
						$scope.deleteItem = function(item,$index){
							Items.delete(item).then(function(){
								refreshList();
							},function(err){
								alert(err);
							});
						};
						$scope.completeItem = function(item,$index){
							Items.complete(item).then(function(){
								refreshList();
							},function(err){
								alert(err);
							});
						};
						$scope.selectItem = function(item){
							if($scope.selectedItems[item._id]){
								delete $scope.selectedItems[item._id];
							}else{
								$scope.selectedItems[item._id] = item;
							}
						};
						$scope.onHold = function(item){
							$scope.mode = $scope.mode !== 'edit' ? 'edit' : 'normal';
							$scope.selectItem(item);
						};
						$scope.stopEdit = function(){
							$scope.mode = 'normal';
							$scope.selectedItems = {};
							
						};
						$scope.isSelected = function(item){
							return $scope.selectedItems[item._id] ? true : false;
						};
						$scope.deleteSelectedItems = function(){
							if(Object.keys($scope.selectedItems).length === 0){
								$scope.stopEdit();
								return;
							}
							var promises = [];
							angular.forEach($scope.selectedItems,function(value,key){
								console.log(value);
								promises.push(Items.delete(value));
							});
							var allQ = $q.all(promises);
							allQ.then(function(){
								console.log('allQ');
								$scope.stopEdit();
								refreshList();
							});
						};
						$scope.completeSelectedItems = function(){
							if(Object.keys($scope.selectedItems).length === 0){
								$scope.stopEdit();
								return;
							}
							var promises = [];
							angular.forEach($scope.selectedItems,function(value,key){
								console.log(value);
								promises.push(Items.complete(value));
							});
							var allQ = $q.all(promises);
							allQ.then(function(){
								console.log('allQ');
								$scope.stopEdit();
								refreshList();
							});
						};

						function keepKeyboardOpen() {
							console.log('keepKeyboardOpen');
							var txtInput = jQuery('#modal-input');
							console.log(txtInput);
							jQuery(txtInput).one('blur', function () {
								txtInput.focus();
							});
						}
						keepKeyboardOpen();

						refreshList();

					}
				}
			}
		})

		.state('a.chats', {
				url: '/chats',
				views: {
					'tab-chats': {
						templateUrl: 'templates/tab-chats.html',
						controller: 'ChatsCtrl'
					}
				}
			})
			.state('a.chat-detail', {
				url: '/chats/:chatId',
				views: {
					'tab-chats': {
						templateUrl: 'templates/chat-detail.html',
						controller: 'ChatDetailCtrl'
					}
				}
			})

		.state('a.account', {
			url: '/account',
			views: {
				'tab-account': {
					templateUrl: 'templates/tab-account.html',
					controller: 'AccountCtrl'
				}
			}
		});

		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/a/dash');

	});