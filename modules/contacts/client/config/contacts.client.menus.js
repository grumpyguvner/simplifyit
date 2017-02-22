(function () {
  'use strict';

  angular
    .module('contacts')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Contacts',
      state: 'contacts.list',
      position: 5,
      roles: ['user']
    });

  }
}());
