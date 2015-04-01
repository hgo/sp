angular.module('starter.directives', [])
	.directive('lselect', function ($timeout) {
		return {
			restrict: 'AE',
			scope: {
				colors: "="
			},
			replace: true,
			templateUrl: 'templates/lists/label-select.html',
			link: function (scope, elem, attrs) {
				var _el = jQuery(elem)
				var handle = function () {
					jQuery.each(jQuery('.label-grid'), function (i, dom) {
						var d = jQuery(dom);
						d.height(d.width());
					});
					scope.loaded = true;
					scope.selectLabel = function (color) {
						jQuery(_el.find('.label-grid')).removeClass('selected');
						jQuery(_el.find('.label-grid.' + color)).addClass('selected');
						scope.$parent.selectedLabelColor = color;
					}
				};
				scope.$on('lselect.enter', handle);
			}
		};
	})
	/*.directive('swipeToRemove', function ($timeout) {
	return {
		restrict: 'AE',
		scope: {
			remove: "="
		},
		replace: true,
		templateUrl: 'templates/lists/label-select.html',
		link: function (scope, elem, attrs) {
			var _el = jQuery(elem);
			$ionicGesture.on('swipeleft', function () {

			}, elem, {
				direction: 'xy'
			})
			scope.$on('modal.shown', function () {
				jQuery.each(jQuery('.label-grid'), function (i, dom) {
					var d = jQuery(dom);
					d.height(d.width());
				});
				scope.loaded = true;
				scope.selectLabel = function (color) {
					jQuery(_el.find('.label-grid')).removeClass('selected');
					jQuery(_el.find('.label-grid.' + color)).addClass('selected');
					scope.$parent.selectedLabelColor = color;
				}
			});
		}
	};
});*/