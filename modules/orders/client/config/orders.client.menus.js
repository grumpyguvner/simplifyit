(function () {
  'use strict';

  angular
    .module('orders')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Order Book',
      state: 'orders.list',
      roles: ['*']
    });

  }
}());
