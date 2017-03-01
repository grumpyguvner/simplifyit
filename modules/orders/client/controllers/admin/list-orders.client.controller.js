﻿(function () {
  'use strict';

  angular
    .module('orders.admin')
    .controller('OrdersAdminListController', OrdersAdminListController);

  OrdersAdminListController.$inject = ['OrdersService'];
  ContactsAdminListController.$inject = ['ContactsService'];

  function OrdersAdminListController(OrdersService) {
    var vm = this;

    vm.orders = OrdersService.query();

    //select data options
    var select;
    select.customers = ContactsService.query();

  }
}());
