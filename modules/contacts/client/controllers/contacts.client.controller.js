(function () {
  'use strict';

  angular
    .module('contacts')
    .controller('ContactsController', ContactsController);

  ContactsController.$inject = ['$scope', 'contactResolve', 'Authentication'];

  function ContactsController($scope, contact, Authentication) {
    var vm = this;

    vm.contact = contact;
    vm.authentication = Authentication;

  }
}());
