(function () {
    'use strict';

    angular
        .module('app.objects')
        .controller('contactsController', contactsController);

    /** @ngInject */
    function contactsController($state, $mdDialog, msUtils, hostUrlDevelopment, CustomerService, errors,
                                $mdToast, AuthService, objectId, contactDetails, contacts, $rootScope) {

        var vm = this;

        //For Error ----------------------------------------------------------------------------------------------------
        vm.error = errors;

        //For Progress Loader-------------------------------------------------------------------------------------------
        vm.progress = false;

        //For Session---------------------------------------------------------------------------------------------------
        vm.sessionData = {};
        vm.sessionData = AuthService.getSessionData('customerData');

        //For Global Variable-------------------------------------------------------------------------------------------
        var params;
        var header = {
          authId: vm.sessionData.authId,
          channel_name: vm.sessionData.channel_name,
          proxy: vm.sessionData.proxy
        };

        //Data
        vm.contact = angular.copy(contactDetails);
        vm.contacts = contacts;
        vm.title = 'Edit Contact';
        vm.newContact = false;
        vm.allFields = false;

        //Methods
        vm.addNewContact = addNewContact;
        vm.saveContact = saveContact;
        vm.deleteContactConfirm = deleteContactConfirm;
        vm.closeDialog = closeDialog;

        if ( !vm.contact )
        {
            vm.contacts = {
                'name': '',
                'title': '',
                'email': '',
                'contactNumber' : '',
                'address' : ''
            };

            vm.title = 'New Contact';
            vm.newContact = true;
        }

        function addNewContact(){

            //For Progress Loader
            vm.progress = true;

            if (vm.sessionData.proxy == true) {
                params = {
                    customerId: vm.sessionData.customerAdminId,
                    objectId:objectId
                }
            }
            else {
                params = {
                    customerId: vm.sessionData.userId,
                    objectId:objectId
                }
            }

            CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdatecontact, params, vm.contact, header)
                .then(function (response) {

                    //For Progress Loader
                    vm.progress = false;

                    switch (response.code) {
                        case 0:
                            $mdToast.show($mdToast.simple().textContent('Successfully Created').position('top right'));
                            $mdDialog.hide();
                            break;
                        case 4006:
                            console.log(response.message);
                            break;
                        case 1006:
                            console.log(response.message);
                            break;
                        case 4004:
                            console.log(response.message);
                            break;
                        case 11:
                            console.log(response.message);
                        default:
                            console.log(response.message);
                    }
                })
                .catch(function (response) {
                    //For Progress Loader
                    vm.progress = false;
                    console.log('catch');
                });
        }

        /**
         * Save manufacture
         */
        function saveContact() {

            //For Progress Loader
            vm.progress = true;

            if (vm.sessionData.proxy == true) {
                params = {
                    customerId: vm.sessionData.customerAdminId,
                    objectId:objectId
                }
            }
            else {
                params = {
                    customerId: vm.sessionData.userId,
                    objectId:objectId
                }
            }
            vm.contact.objectId = '';
            CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdatecontact, params, vm.contact, header)
                .then(function (response) {

                    //For Progress Loader
                    vm.progress = false;

                    switch (response.code) {
                        case 0:
                            $mdToast.show($mdToast.simple().textContent('Successfully Updated').position('top right'));
                            $mdDialog.hide();
                            break;
                        case 4006:
                            console.log(response.message);
                            break;
                        case 1006:
                            console.log(response.message);
                            break;
                        case 4004:
                            console.log(response.message);
                            break;
                        case 11:
                            console.log(response.message);
                        default:
                            console.log(response.message);
                    }
                })
                .catch(function (response) {
                    //For Progress Loader
                    vm.progress = false;
                    console.log('catch');
                });
        }

        /**
        * Delete Category Confirm Dialog
        */
        function deleteContactConfirm(ev)
        {
            var confirm = $mdDialog.confirm()
                .title('Are you sure want to delete the contact?')
                .htmlContent('<b>' + vm.contact.name + '</b>' + ' will be deleted.')
                .ariaLabel('delete contact')
                .targetEvent(ev)
                .ok('OK')
                .cancel('CANCEL');

            $mdDialog.show(confirm).then(function ()
            {
                //For Progress Loader
                vm.progress = true;

                if (vm.sessionData.proxy == true) {
                    params = {
                        customerId: vm.sessionData.customerAdminId,
                        objectId: objectId,
                        contactId: vm.contact.contactId
                    }
                }
                else {
                    params = {
                        customerId: vm.sessionData.userId,
                        objectId: objectId,
                        contactId: vm.contact.contactId
                    }
                }

                CustomerService.addNewMember('POST', hostUrlDevelopment.test.removecontact, params, '', header)
                    .then(function (response) {

                        //For Progress Loader
                        vm.progress = false;

                        switch (response.code) {
                            case 0:
                                vm.contacts.splice(vm.contacts.indexOf(contactDetails), 1);
                                $mdToast.show($mdToast.simple().textContent("Contact Removed Successfully...").position('top right'));
                                $rootScope.$broadcast('updateContactTimeline', '');
                                break;
                            case 4006:
                                console.log(response.message);
                                break;
                            case 1006:
                                console.log(response.message);
                                break;
                            case 4004:
                                console.log(response.message);
                                break;
                            case 11:
                                console.log(response.message);
                                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                            default:
                                console.log(response.message);
                        }
                    })
                    .catch(function (response) {
                        //For Progress Loader
                        vm.progress = false;
                        console.log('catch');
                    });
            });
        }


       /**
       * Close dialog
       */
       function closeDialog()
       {
           $mdDialog.hide();
       }


    }
})();
