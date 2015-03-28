angular.module('starter.services', [])

.factory('Items', function ($q) {
	var limit = 25;
	function resultToItems (result) {
		var docs = [];
		angular.forEach(result.rows, function (value, key) {
			this.push(value.doc);
		}, docs);
		return docs;
	}
	return {
		all: function (page, done) {
			var defer = $q.defer();
			db.query('item_active', {
				include_docs: true
			}).then(function (result) {
				defer.resolve(resultToItems(result));
			}).catch(function (err) {
				console.error(err);
				if(err.status === 404){
					defer.resolve();
				}else{
					defer.reject();
				}
			});
			return defer.promise;
		},
		allCompleted: function () {
			var defer = $q.defer();
			db.query('item_completed', {
				include_docs: true,
				descending:true
			}).then(function (result) {
				defer.resolve(resultToItems(result));
			}).catch(function (err) {
				console.error(err);
				if(err.status === 404){
					defer.resolve();
				}else{
					defer.reject();
				}
			});
			return defer.promise;
		},
		delete: function (item) {
			var defer = $q.defer();
			db.remove(item)
				.then(function () {
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
					defer.resolve();
				})
				.catch(function (err) {
					defer.reject(err);
				});
			return defer.promise;
		},
		create: function (name) {
			var defer = $q.defer();
			var item = {
				_id: new Date().toISOString(),
				name: name,
				completed: false
			};
			db.put(item).then(function (result) {
				console.log(result);
				defer.resolve(result);
			}).catch(function (err) {
				console.log(err);
				defer.reject(err);
			});
			return defer.promise;
		}
	};
});