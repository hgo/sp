PouchDB.debug.enable('*');
$.noConflict();
var db = new PouchDB('myDB', {
	adapter: 'websql'
});

function createDesignDoc(name, mapFunction) {
	var ddoc = {
		_id: '_design/' + name,
		views: {}
	};
	ddoc.views[name] = {
		map: mapFunction.toString()
	};
	return ddoc;
}
var ia = createDesignDoc('item_active', function (doc) {
	if (!doc.completed) {
		emit(doc._id, doc);
	}
});
var ic = createDesignDoc('item_completed', function (doc) {
	if (doc.completed) {
		emit(doc.completedAt, doc);
	}
});
db.put(ia).then(function (doc) {
	// design doc created!
	db.put(ic).then(function (doc) {
		// design doc created!
		bootstrap();
	}).catch(function (err) {
		bootstrap();
		// if err.name === 'conflict', then
		// design doc already exists
	});

}).catch(function (err) {
	// if err.name === 'conflict', then
	// design doc already exists
	db.put(ic).then(function (doc) {
		bootstrap();
		// design doc created!
	}).catch(function (err) {
		bootstrap();
		// if err.name === 'conflict', then
		// design doc already exists
	});
});

function bootstrap() {
	angular.element(document).ready(function () {
		angular.bootstrap(document, ["starter"]);
	});
}
ionic.Platform.ready(function () {



});