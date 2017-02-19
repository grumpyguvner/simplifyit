(function () {
  'use strict';

  angular
    .module('contacts.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('contacts', {
        abstract: true,
        url: '/contacts',
        template: '<ui-view/>'
      })
      .state('contacts.list', {
        url: '',
        templateUrl: '/modules/contacts/client/views/list-contacts.client.view.html',
        controller: 'ContactsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Contacts List'
        }
      })
      .state('contacts.view', {
        url: '/:contactId',
        templateUrl: '/modules/contacts/client/views/view-contact.client.view.html',
        controller: 'ContactsController',
        controllerAs: 'vm',
        resolve: {
          contactResolve: getContact
        },
        data: {
          pageTitle: 'Contact {{ contactResolve.title }}'
        }
      });
  }

  getContact.$inject = ['$stateParams', 'ContactsService'];

  function getContact($stateParams, ContactsService) {
    return ContactsService.get({
      contactId: $stateParams.contactId
    }).$promise;
  }
}());
