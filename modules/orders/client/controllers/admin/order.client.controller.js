(function () {
  'use strict';

  angular
    .module('orders.admin')
    .controller('OrdersAdminController', OrdersAdminController);

  OrdersAdminController.$inject = ['$scope', '$state', '$window', 'orderResolve', 'Authentication', 'Notification'];

  function OrdersAdminController($scope, $state, $window, order, Authentication, Notification) {
    var vm = this;

    vm.order = order;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Order
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.order.$remove(function() {
          $state.go('admin.orders.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Order deleted successfully!' });
        });
      }
    }

    // Save Order
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.orderForm');
        return false;
      }

      // Create a new order, or update the current instance
      vm.order.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.orders.list'); // should we send the User to the list or the updated Order's view?
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Order saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Order save error!' });
      }
    }
  }
}());
