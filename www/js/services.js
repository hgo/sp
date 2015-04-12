angular.module('starter.services', [])
	.factory('Lists', function ($q, $rootScope) {
		var all = function () {
			var q = $q.defer();
			db.find({
				selector: {
					$and: [{
						_id: {
							$exists: true
						}
				}, {
						type: 'list'
				}]
				},
				sort: ['_id']
			}).then(function (result) {
				q.resolve(result.docs);
			}).catch(function (err) {
				console.log(err);
				q.reject();
			});
			return q.promise;
		};
		var count = function (ids) {
			var myMapReduceFun = {
				map: function (doc) {
					if (doc.type === 'item' && !doc.completed) {
						emit(doc.list, doc.id);
					}
				},
				reduce: '_count'
			};
			var q = $q.defer();
			db.query(myMapReduceFun, {
				reduce: true,
				group: true
			}).then(function (result) {
				q.resolve(result.rows);
				console.log(result);
			}).catch(function (err) {
				q.reject();
				console.log(err);
			});
			return q.promise;
		};


		var first = function () {
			var q = $q.defer();
			db.find({
				selector: {
					$and: [{
						_id: {
							$exists: true
						}
				}, {
						type: 'list'
				}]
				},
				sort: ['_id'],
				limit: 1
			}).then(function (result) {
				q.resolve(result.docs[0]);
			}).catch(function (err) {
				console.log(err);
				q.reject();
			});
			return q.promise;
		};

		var get = function (id) {
			var q = $q.defer();
			db.find({
				selector: {
					$and: [{
						_id: {
							$eq: id
						}
				}, {
						type: 'list'
				}]
				}
			}).then(function (result) {
				q.resolve(result.docs[0]);
			}).catch(function (err) {
				console.log(err);
				q.reject();
			});
			return q.promise;
		};
		var create = function (name, color) {
			var defer = $q.defer();
			var item = {
				_id: new Date().toISOString() + '_list',
				name: name,
				color: color,
				type: 'list'
			};
			db.put(item).then(function (result) {
				get(result.id).then(function (result) {
					defer.resolve(result);
					//$rootScope.$broadcast('list:changed', result);
				});
			}).catch(function (err) {
				defer.reject(err);
			});
			return defer.promise;
		};
		var deleteL = function (list) {
			var defer = $q.defer();
			db.find({
				"selector": {
					"$and": [{
						"type": {
							"$eq": 'item'
						}
					}, {
						"_id": {
							"$exists": true
						}
					}, {
						list: {
							$eq: list._id
						}
						}]
				}
			}).then(function (result) {
				var items = result.docs;
				angular.forEach(items, function (i) {
					i._deleted = true;
				});
				db.bulkDocs(items).then(function () {
					$rootScope.$broadcast('item:changed', items);
					db.remove(list)
						.then(function () {
							//$rootScope.$broadcast('list:changed', list);
							defer.resolve();
						})
						.catch(function (err) {
							defer.reject(err);
						});
				}, function (err) {
					defer.reject(err);
				});
			}, function (err) {
				defer.reject(err);
			})
			return defer.promise;
		};
		return {
			all: all,
			create: create,
			first: first,
			get: get,
			count: count,
			delete: deleteL
		};
	})
	.factory('Items', function ($q, $rootScope) {
		var limit = 25;

		function resultToItems(result) {
			var docs = [];
			angular.forEach(result.rows, function (value, key) {
				this.push(value.doc);
			}, docs);
			return docs;
		}
		return {
			all: function (list) {
				var defer = $q.defer();
				db.find({
					"selector": {
						"$and": [{
							"completed": {
								"$eq": false
							}
					}, {
							"_id": {
								"$exists": true
							}
					}, {
							"type": {
								"$eq": 'item'
							}
					}, {
							priority: {
								"$gt": 0
							}
					}, {
							list: {
								$eq: list
							}
						}]
					},
					"sort": [{
						'priority': 'asc'
				}, {
						'_id': 'desc'
				}]
				}).then(function (result) {
					defer.resolve(result.docs);
				}).catch(function (err) {
					console.error(err);
					if (err.status === 404) {
						defer.resolve();
					} else {
						defer.reject();
					}
				});
				return defer.promise;
			},
			allCompleted: function (list) {
				var defer = $q.defer();
				db.find({
					"selector": {
						"$and": [{
							"completed_at": {
								"$exists": true
							}
					}, {
							"completed": {
								"$eq": true
							}
					}, {
							"type": {
								"$eq": 'item'
							}
					}, {
							list: {
								$eq: list
							}
						}]
					},
					"sort": [{
						'completed_at': 'desc'
				}]
				}).then(function (result) {
					defer.resolve(result.docs);
				}).catch(function (err) {
					console.error(err);
					if (err.status === 404) {
						defer.resolve();
					} else {
						defer.reject();
					}
				});
				return defer.promise;
			},
			delete: function (item) {
				var defer = $q.defer();
				db.remove(item)
					.then(function () {
						$rootScope.$broadcast('item:changed', item);
						defer.resolve();
					})
					.catch(function (err) {
						defer.reject(err);
					});
				return defer.promise;
			},
			complete: function (item) {
				var defer = $q.defer();
				item.completed = true;
				item.completed_at = new Date().toISOString();
				db.put(item)
					.then(function () {
						$rootScope.$broadcast('item:changed', item);
						defer.resolve();
					})
					.catch(function (err) {
						defer.reject(err);
					});
				return defer.promise;
			},
			edit: function (item) {
				var defer = $q.defer();
				db.put(item)
					.then(function (result) {
						$rootScope.$broadcast('item:changed');
						defer.resolve(result.rev); //revision degismeli, daha sonraki updatelerde conflict cikmasin diye
					}).catch(function (err) {
						defer.reject(err);
					});
				return defer.promise;
			},
			create: function (name, priority, list) {
				var defer = $q.defer();
				var item = {
					_id: new Date().toISOString() + '_item',
					name: name,
					completed: false,
					type: 'item',
					priority: priority,
					list: list
				};
				db.put(item).then(function (result) {
					console.log(result);
					defer.resolve(result);
					$rootScope.$broadcast('item:changed', result);
				}).catch(function (err) {
					console.log(err);
					defer.reject(err);
				});
				return defer.promise;
			}
		};
	});