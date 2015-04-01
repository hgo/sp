// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directives'])

.run(function ($ionicPlatform, $rootScope, $state, $ionicConfig) {
		$ionicConfig.views.maxCache(0);
		$rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, rejection) {
			console.log(rejection);
			if (rejection === 'empty list') {
				event.preventDefault();
				$state.go('firstList');
			}
		});
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

			.state('firstList', {
				url: "/first-list",
				templateUrl: "templates/first-list.html",
				controller: function ($scope, $state, Lists) {
					$scope.$on('$ionicView.enter', function () {
						var txtInput = jQuery('#list-modal-input');
						jQuery(txtInput).one('blur', function () {
							txtInput.focus();
						});
						$scope.$broadcast('lselect.enter');
					});
					$scope.create = function (input, selectedColor) {
						if (!input || input.length < 0) {
							return;
						} else {
							Lists.create(input, selectedColor).then(function (listAdded) {
								$state.go('a.list', {
									id: listAdded._id
								}, {
									reload: true
								});
							});
						}
					};
				}
			})
			// setup an abstract state for the tabs directive

		.state('a', {
			url: "/a",
			abstract: true,
			cache: false,
			templateUrl: "templates/menu.html",
			controller: function ($scope, lists, Lists, $ionicModal, $state, $timeout, $rootScope) {
				$scope.lists = lists;
				$scope.countMap = {};
				var ids = [];
				angular.forEach(lists, function (val, id) {
					ids.push(val);
				});
				console.log(ids);

				function findCounts() {
					Lists.count().then(function (rows) {
						var m = {};
						angular.forEach(rows, function (row) {
							m[row.key] = row.value;
						});
						$timeout(function () {
							$scope.$apply(function () {
								$scope.countMap = m;
							});
						});
					});
				}
				$rootScope.$on('item:changed', function () {
					findCounts();
				});
				findCounts();
				$rootScope.$on('list:changed', function () {
					Lists.all().then(function (lists) {
						$scope.lists = lists;
					});
				});

				function initialModal() {
					$scope.modal = {
						input: '',
						closeText: 'Cancel',
						buttonText: 'Create List'
					};
				}
				$ionicModal.fromTemplateUrl('templates/lists/new-list-modal.html', {
					scope: $scope,
					focusFirstInput: true,
				}).then(function (modal) {
					$scope.newListModal = modal;
					initialModal();
				});
				$scope.$on('modal.shown', function () {
					$scope.$broadcast('lselect.enter');
				})
				$scope.showModal = function () {
					$scope.newListModal.show().then(
						function () {
							keepKeyboardOpen(true);
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
						$scope.newListModal.hide().then(function () {
							initialModal();
						});
					}, 320);
				};

				function keepKeyboardOpen(focus) {

					var txtInput = jQuery('#modal-input');
					if (focus) {
						txtInput.focus();
					}
					txtInput.one('blur', function () {
						txtInput.focus();
					});
				}
				$scope.create = function (input, selectedColor) {
					if (!input || input.length < 0) {
						return;
					} else {
						$scope.closeModal();
						Lists.create(input, selectedColor).then(function (listAdded) {
							$scope.lists.push(listAdded);
							$state.go('a.list', {
								id: listAdded._id
							}, {
								reload: true
							});
						});
					}

				};
				$scope.closeModal = function () {
					$scope.newListModal.hide().then(function () {
						initialModal();
					});
				};
			},
			resolve: {
				lists: function (Lists, $q) {
					var q = $q.defer();
					Lists.all().then(function (lists) {
						if (lists.length === 0) {
							q.reject('empty list');
						} else {
							q.resolve(lists);
						}
					});
					return q.promise;
				}
			}
		})

		// Each tab has its own nav history stack:

		.state('a.list', {
			url: '/list/:id',
			resolve: {
				list: function ($stateParams, $q, Lists, lists) {
					if ($stateParams.id !== 'first') {
						return Lists.get($stateParams.id);
					} else {
						return lists[0];
					}
				}
			},
			views: {
				'content': {

					templateUrl: 'templates/items/shopping-list.html',
					controller: function ($scope, $state, Items, Lists, $ionicPopover, $ionicModal, $ionicPopup, $timeout, $q, list) {
						$scope.list = list;
						$scope.mode = 'normal';
						$scope.selectedItems = {};
						$scope.title = function () {
							return $scope.mode === 'edit' ? Object.keys($scope.selectedItems).length + ' Selected' : list.name;
						};

						function initialModal() {
							$scope.modal = {
								input: '',
								closeText: 'Cancel',
								buttonText: 'Create Item'
							};
						}
						$ionicModal.fromTemplateUrl('templates/items/new-item-modal.html', {
							scope: $scope,
							focusFirstInput: true,
						}).then(function (modal) {
							$scope.newItemModal = modal;
							initialModal();
						});

						$scope.$on('$ionicView.enter', function () {
							if (!$scope.popover) {
								var popoverScope = $scope.$new();
								popoverScope.name = list.name;
								$ionicPopover.fromTemplateUrl('templates/items/popover.html', {
									scope: popoverScope
								}).then(function (popover) {
									$scope.popover = popover;
								});
							}
						})



						$scope.showPopover = function ($event) {
							$scope.popover.show($event);
						};
						$scope.closePopover = function () {
							$scope.popover.hide();
						};

						$scope.deleteList = function () {
							$scope.closePopover();
							$ionicPopup.confirm({
								title: list.name + ' will be deleted',
								template: '<p>You\'ll lost all items in it. Are you sure?</p>',
								okText: 'Yes',
								okType: 'button-assertive',
								cancelText: 'No',
								cancelType: 'button-stable'
							}).then(function (res) {
								if (res) {
									Lists.delete(list).then(function () {
										$state.go('a.list', {
											id: 'first'
										}, {
											reload: true
										});
									}, function (err) {
										alert(err);
									});
								} else {

								}
							});
						};

						function refreshList() {
							console.log(list);
							Items.all(list._id).then(function (results) {
								console.log('refresh list');
								console.log(results);
								$scope.recentItems = results;
							});
							Items.allCompleted(list._id).then(function (results) {
								$scope.completedItems = results;
							});
						}
						$scope.create = function (input, priority) {
							Items.create(input, priority, list._id).then(function (itemAdded) {
								$timeout(function () {
									keepKeyboardOpen(true);
									$scope.modal.input = '';
									$scope.modal.buttonText = 'Create Another Item';
									$scope.modal.closeText = 'That\'s Enough';
									$scope.modal.priority = '';
									refreshList();
								});
							});
						};
						$scope.showModal = function () {
							$scope.newItemModal.show().then(
								function () {
									keepKeyboardOpen(true);
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
								$scope.newItemModal.hide().then(function () {
									initialModal();
								});
							}, 320);
						};
						$scope.deleteItem = function (item, $index) {
							Items.delete(item).then(function () {
								refreshList();
							}, function (err) {
								alert(err);
							});
						};
						$scope.completeItem = function (item, $index) {
							Items.complete(item).then(function () {
								refreshList();
							}, function (err) {
								alert(err);
							});
						};
						$scope.selectItem = function (item) {
							if ($scope.selectedItems[item._id]) {
								delete $scope.selectedItems[item._id];
							} else {
								$scope.selectedItems[item._id] = item;
							}
						};
						$scope.onHold = function (item) {
							$scope.mode = $scope.mode !== 'edit' ? 'edit' : 'normal';
							$scope.selectItem(item);
						};
						$scope.stopEdit = function () {
							$scope.mode = 'normal';
							$scope.selectedItems = {};

						};
						$scope.isSelected = function (item) {
							return $scope.selectedItems[item._id] ? true : false;
						};
						$scope.deleteSelectedItems = function () {
							if (Object.keys($scope.selectedItems).length === 0) {
								$scope.stopEdit();
								return;
							}
							var promises = [];
							angular.forEach($scope.selectedItems, function (value, key) {
								console.log(value);
								promises.push(Items.delete(value));
							});
							var allQ = $q.all(promises);
							allQ.then(function () {
								console.log('allQ');
								$scope.stopEdit();
								refreshList();
							});
						};
						$scope.completeSelectedItems = function () {
							if (Object.keys($scope.selectedItems).length === 0) {
								$scope.stopEdit();
								return;
							}
							var promises = [];
							angular.forEach($scope.selectedItems, function (value, key) {
								console.log(value);
								promises.push(Items.complete(value));
							});
							var allQ = $q.all(promises);
							allQ.then(function () {
								console.log('allQ');
								$scope.stopEdit();
								refreshList();
							});
						};

						function keepKeyboardOpen(focus) {

							var txtInput = jQuery('#modal-input');
							if (focus) {
								txtInput.focus();
							}
							txtInput.one('blur', function () {
								txtInput.focus();
							});
						}
						keepKeyboardOpen();

						refreshList();

					}
				}
			}
		});

		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/a/list/first');

	});