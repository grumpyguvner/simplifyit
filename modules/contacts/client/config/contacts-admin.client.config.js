(function () {
  'use strict';

  // Configuring the Contacts Admin module
  angular
    .module('contacts.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Contacts',
      state: 'admin.contacts.list'
    });
  }
}());
