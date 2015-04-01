//PouchDB.debug.enable('*');
$.noConflict();
var db = new PouchDB('myDB', {
	adapter: 'websql'
});

db.createIndex({
	index: {
		fields: ['priority', '_id', 'completed', 'type', 'list'],
		name: 'recent-items'
	}
}, function () {
	db.createIndex({
		index: {
			fields: ['completed_at', 'completed', 'type', 'list'],
			name: 'completed-items'
		}
	}, function () {
		db.createIndex({
			index: {
				fields: ['_id', 'name', 'type'],
				name: 'list'
			}
		}, function () {
			angular.element(document).ready(function () {
				angular.bootstrap(document, ["starter"]);
			});
		})
	})
});