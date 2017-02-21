(function () {
  'use strict';

  angular
    .module('orders.admin')
    .controller('OrdersAdminListController', OrdersAdminListController);

  OrdersAdminListController.$inject = ['OrdersService'];

  function OrdersAdminListController(OrdersService) {
    var vm = this;

    vm.orders = OrdersService.query();
  }
}());
