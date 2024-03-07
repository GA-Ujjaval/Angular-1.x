(function () {
  'use strict';

  angular
    .module('app.customer.scrumboard')
    .controller('ScrumboardCardDialogController', ScrumboardCardDialogController);

  /** @ngInject */
  function ScrumboardCardDialogController(ScrumboardService, $rootScope, $http, hostUrlDevelopment, errors, AuthService, $state, $mdToast, $scope,
                                          $filter, $document, $mdDialog, fuseTheming, fuseGenerator, msUtils, BoardService, DialogService, cardId, Tasks, response,
                                          Tags, showView, $timeout, defualts, introService, $q, $location, isTemplate, GlobalSettingsService, pageTitleService, pageTitles, clipboardService) {


    var vm = this;
    vm.isMenuShown = false;

    vm.clipboardService = clipboardService;

    $scope.$watch('vm.clipboardService.getItemsCount()', function (newVal, oldVal) {
      vm.clipBoardItemsCount = newVal;
    });
    /**
     * filter By Where Used Resolution Tasks
     * @type {filterByWhereUsedResolutionTasks}
     */
    vm.filterByWhereUsedResolutionTasks = filterByWhereUsedResolutionTasks;

    vm.goToDetails = goToDetails;

    /**
     * where used tab toggle exist
     * @type {whereUsedToggleResolutionTasksFilter}
     */
    vm.whereUsedToggleResolutionTasksFilter = whereUsedToggleResolutionTasksFilter;

    /**
     *
     * @type {resolutionTaskExistInWhereUsedTab}
     */
    vm.resolutionTaskExistInWhereUsedTab = resolutionTaskExistInWhereUsedTab;

    /**
     * update tab visibility
     */
    vm.updateTabs = updateTabs;

    vm.closePopup = closePopup;

    function closePopup() {
      $mdDialog.hide();
    }

    //Methods
    vm.hasModifications = hasModifications;
    vm.changeItems = [];
    vm.changeItems1 = [];
    vm.changeItems2 = [];
    vm.Products = [];
    vm.Parts = [];
    vm.addedSubsribers = [];
    vm.changeitemcardUrl = hostUrlDevelopment.test.changeitemcard;
    vm.removechangeitemcard = hostUrlDevelopment.test.removechangeitemcard;
    vm.openCardDialog = DialogService.openCardDialog;
    vm.palettes = fuseTheming.getRegisteredPalettes();
    vm.rgba = fuseGenerator.rgba;
    vm.toggleInArray = msUtils.toggleInArray;
    vm.exists = msUtils.exists;
    vm.existsFuseObject = msUtils.existsFuseObject;
    vm.closeDialog = closeDialog;
    vm.getCardList = getCardList;
    vm.removeCard = removeCard;
    vm.preventDefault = preventDefault;
    vm.isChangeItemExists = isChangeItemExists;
    /* Attachment */
    vm.toggleCoverImage = toggleCoverImage;
    vm.removeAttachment = removeAttachment;
    vm.addremoveCoverImage = addremoveCoverImage;
    vm.gotoAttachment = gotoAttachment;
    vm.arrayOfAttachmentFiles = [];
    /* Labels */
    vm.labelQuerySearch = labelQuerySearch;
    vm.filterLabel = filterLabel;
    vm.addNewLabel = addNewLabel;
    vm.updateLabel = updateLabel;
    vm.removeLabel = removeLabel;
    vm.removePriority = removePriority;
    /* Members */
    vm.memberQuerySearch = memberQuerySearch;
    vm.memberIdQuerySearch = memberIdQuerySearch;
    vm.filterMember = filterMember;
    /* Checklist */
    vm.updateCheckedCount = updateCheckedCount;
    vm.addCheckItem = addCheckItem;
    vm.removeChecklistItem = removeChecklistItem;
    vm.createCheckList = createCheckList;
    vm.completedTasks = completedTasks;
    vm.updateTask = updateTask;
    /* Additional info*/
    vm.showBoardTypeAttributeList = showBoardTypeAttributeList;
    vm.updateAttribute = updateAttribute;
    vm.OpenLinkFunction = OpenLinkFunction;
    /* Comment */
    vm.addNewComment = addNewComment;
    /* Avatar Image Availability*/
    vm.isAvatarAvailable = isAvatarAvailable;
    /* default avatar */
    vm.defaultAvatar = defaultAvatar;
    /* Open Task Window */
    vm.openTaskDialog = openTaskDialog;
    vm.addTaskCallback = addTaskCallback;
    vm.updateTaskCallback = updateTaskCallback;
    vm.formatDate = formatDate;
    vm.formatDueDate = formatDueDate;
    vm.changeView = changeView;
    vm.sortIdTasks = sortIdTasks;
    vm.toggleCompleted = toggleCompleted;
    vm.cardDialogClass = cardDialogClass;

    /* Change Items */
    vm.changeItemsQuerySearch = changeItemsQuerySearch;
    vm.changeItemsIDQuerySearch = changeItemsIDQuerySearch;
    vm.filterChangeItem = filterChangeItem;

    /* handle due date change */
    vm.handleDueDateChange = handleDueDateChange;
    vm.toggleChangeItemFilter = toggleChangeItemFilter;
    vm.toggleECOChangeItemFilter = toggleECOChangeItemFilter;

    /* build title of the card */
    vm.buildCardTitle = buildCardTitle;
    /* find the stacked bar length */
    vm.findStackedBarLength = findStackedBarLength;
    /* find the stacked bar values */
    vm.findStackedBarValues = findStackedBarValues;
    vm.filtersByChangeItemId = filtersByChangeItemId;
    vm.filterByChangeItems = filterByChangeItems;
    vm.toggleModificationFilter = toggleModificationFilter;
    vm.isModificationExists = isModificationExists;
    vm.getParentAssemblyItemBorderColor = getParentAssemblyItemBorderColor;
    vm.getChangeItemById = getChangeItemById;
    vm.updateCard = updateCard;
    vm.updateCardDescription = updateCardDescription;
    vm.addMember = addMember;
    vm.removeMember = removeMember;
    vm.changeItemFuntion = changeItemFuntion;
    vm.checkItemCard = checkItemCard;
    vm.changeItemFuntions = changeItemFuntions;
    vm.changeItemRemoveFunctions = changeItemRemoveFunctions;
    vm.addCardPriority = addCardPriority;
    vm.fileAdded = fileAdded;
    vm.upload = upload;
    vm.fileSuccess = fileSuccess;
    vm.findModificationsCount = findModificationsCount;
    vm.updateModificationsItemColour = updateModificationsItemColour;
    vm.filteredResultCount = filteredResultCount;
    vm.subscribedFunction = subscribedFunction;
    vm.subscribedMembers = subscribedMembers;
    vm.addSubscribers = addSubscribers;
    vm.removeSubscribers = removeSubscribers;
    vm.isEmptyObject = isEmptyObject;
    vm.isEmptyImpactObject = isEmptyImpactObject;
    vm.isValidImpactObject = isValidImpactObject;
    vm.getallfuseobject = getallfuseobject;
    vm.parseStrings = parseStrings;
    vm.downloadCardInPdf = downloadCardInPdf;
    vm.checkProxyDetails = checkProxyDetails;
    vm.getallfuseobject = getallfuseobject;

    checkProxyDetails();

    function checkProxyDetails() {
      if ($rootScope.enableMinorRev !== undefined && $rootScope.configurationSettings !== undefined) {
        vm.enableMinorRev = $rootScope.enableMinorRev;
        vm.configurationSettings = $rootScope.configurationSettings;
      } else {
        proxyDetails();
      }
    }

    function downloadCardInPdf() {

      var pdfEx = new CardToPDFExporter();

      vm.card.comments.sort(pdfEx.sortByTimeAsc);
      vm.card.activities.sort(pdfEx.sortByTimeAsc);

      var docDefinition = {
        content: [
          {text: vm.buildCardTitle(), fontSize: 16, margin: [0, 0, 0, 10]},
          {
            columns: [
              ['Board: ' + vm.board.name,
                'List: ' + vm.getCardList(true).name,
                (vm.card.name ? 'Title: ' + checkTitleLength(vm.card.name) : ''),
                (vm.card.idLabels.length > 0 ? ('Priority: ' + vm.board.labels.getById(vm.card.idLabels[0]).name) : ''),
                'Last modified on ' + moment(vm.card.activities[0].time).format('ll'), 'by ' + (vm.members.getById(vm.card.activities[0].idMember).name || '')
                ],
              ['Coordinators: ',
                pdfEx.getCoordinators().join(', '),
                pdfEx.getDueDateString(vm.card.due),
                'Subscribers: ',
                pdfEx.getSubscribers().join(', ') || 'No Subscribers']
            ],

            columnGap: 10
          },
          pdfEx.getPartitionLabel('Description:'),
          vm.card.description || 'No description provided.',
          pdfEx.getPartitionLabel('Affected Objects'),
          pdfEx.generateAffectedObjects(),
          pdfEx.getPartitionLabel('Additional Info'),
          pdfEx.generateAdditionalInfo(),
          pdfEx.getPartitionLabel('Attachments'),
          pdfEx.generateAttachments(),
          pdfEx.getPartitionLabel('Tasks'),
          pdfEx.generateTasks(),
          pdfEx.getPartitionLabel('Approvals'),
          vm.completedTask || '0' + '/' + vm.tasks.length || '0',
          pdfEx.getPartitionLabel('Comments'),
          pdfEx.generateComments(),
          pdfEx.getPartitionLabel('Activities'),
          pdfEx.getActivities()
        ]
      };
      pdfMake.createPdf(docDefinition).open();
      vm.card.activities.sort(pdfEx.sortByTimeDesc);
    }

    function checkTitleLength(title) {
      if (!title) {
        return '';
      } else {
        let lengthOfTitle = title.length;
        let separator = '\n';
        let blocks = [];
        if (lengthOfTitle <= 40) {
          return title;
        } else {
          while (lengthOfTitle > 40) {
            blocks.push(40);
            lengthOfTitle -= 40;
          }
          _.forEach(blocks, (block, index) => {
            let upIndex = index + 1;
            title = title.slice(0, upIndex * block) + separator + title.slice(upIndex * block);
          });
        }
        return title;
      }
    }



    function CardToPDFExporter() {

      var getAffectedObjects = function () {
        vm.parseStrings(vm.changeItems1[0]);
        return getArrayOfValues(vm.changeItems1, null, function (obj) {
          return vm.parseStrings(obj);
        })();
      };
      var getSubscribers = getArrayOfValues(vm.addedSubsribers, null, function (subscriber) {
        return getMemberNameById(subscriber)
      });
      var getCommentsTime = getArrayOfValues(vm.card.comments, 'time', null);

      var getCommentsAuthors = getArrayOfValues(vm.card.comments, 'idMember', function (propValue) {
        return getMemberNameById(propValue);
      });

      let getCommentsText = getArrayOfValues(vm.card.comments, 'message', function (propValue) {
        return '"' + propValue + '"';
      });

      var getAdditionalInfoKeys = getArrayOfValues(vm.card.additionalInfo, null, function (infoObj) {
        return infoObj.attributeKey
      });

      var getAdditionalInfoValues = getArrayOfValues(vm.card.additionalInfo, null, function (infoObj) {
        return infoObj.attributeValue || '_______'
      });

      var getAttachments = getArrayOfValues(vm.card.attachments, null, function (attachment) {
        return new AttachmentLink(attachment.name, attachment.src);
      });

      var getCoordinators = getArrayOfValues(vm.card.idMembers, null, function (memberId) {
        var name = '';
        vm.membersdd.forEach(function (memberObj) {
          if (memberId === memberObj.id)
            name = memberObj.name;
        });
        return name;
      });

      this.getSubscribers = getSubscribers;
      this.getPartitionLabel = getPartitionLabel;
      this.getActivities = getActivities;
      this.sortByTimeAsc = sortByTimeAsc;
      this.sortByTimeDesc = sortByTimeDesc;
      this.getAffectedObjects = getAffectedObjects;
      this.getCoordinators = getCoordinators;
      this.getTasks = getTasks;
      this.generateAffectedObjects = generateAffectedObjects;
      this.generateAttachments = generateAttachments;
      this.generateTasks = generateTasks;
      this.generateComments = generateComments;
      this.generateAdditionalInfo = generateAdditionalInfo;
      this.getDueDateString = getDueDateString;

      var dateOptions = {
        year: "numeric", month: "short",
        day: "numeric", hour: "2-digit", minute: "2-digit"
      };

      function getPartitionLabel(text) {
        var label = {};
        label.text = text;
        label.bold = true;
        label.fontSize = 16;
        label.margin = [0, 20, 0, 10];

        return label;
      }

      function getActivities() {
        let activities = [];
        let rex = /(<([^>]+)>)/ig;
        vm.card.activities.forEach(function (activity) {
          activities.push({
            text: [{
              text: getMemberNameById(activity.idMember) + '   ',
              bold: true
            }, activity.message.replace(/&lt/g, '<').replace(/&gt/g, '>').replace(/;/g, '').replace(rex , '  ').replace(/\s+/g,' ').replace(/&#65279/g,'') + '   ', {
              text: new Date(activity.time).toLocaleTimeString('en-us', dateOptions),
              fontSize: 10
            }]
          });
        });

        return activities;
      }

      function sortByTimeAsc(a, b) {
        if (a.time > b.time) {
          return -1;
        } else {
          return 1;
        }
      }

      function sortByTimeDesc(a, b) {
        if (a.time < b.time) {
          return -1;
        } else {
          return 1;
        }
      }

      function getTasks() {
        var tasks = [];
        vm.tasks.forEach(function (task) {
          var owners = '';
          var dueDate = '';

          task.idMembers.forEach(function (memberId) {
            owners += getMemberNameById(memberId) + ', ';
            owners = owners.slice(0, owners.length - 2);
            if (owners) {
              owners = 'Owners: ' + owners;
            }

            dueDate = task.dueDate ? new Date(task.dueDate).toLocaleTimeString('en-us', dateOptions) : '';
          });

          tasks.push(task.title + '   ' + owners + '  ' + dueDate);
        });
        return tasks;
      }

      function generateAttachments() {
        var attachments = getAttachments();
        if (attachments.length) {
          return {ul: attachments};
        } else {
          return 'No attached documents.';
        }
      }

      function AttachmentLink(name, link) {
        this.text = name;
        this.link = link;
        this.decoration = 'underline';
      }

      /**
       * @param incArray - array to process
       * @param property - the property of array item, which should be used. if null, then the array item itself will be used
       * @param cb - the function to process the object property before pushing to general array
       * @returns {function(): Array} - function which generate new array from the passed using the callback on every item before every pushing to new array
       */
      function getArrayOfValues(incArray, property, cb) {
        return function () {
          var arr = [];

          var innerCb = function (data) {
            return data
          };

          if (typeof cb === 'function') {
            innerCb = cb;
          }

          if (property) {
            incArray.forEach(function (item) {
              arr.push(innerCb(item[property], arr));
            });
          } else {
            incArray.forEach(function (item) {
              arr.push(innerCb(item, arr));
            });
          }

          return arr;
        }
      }

      function getMemberNameById(memberId) {
        var memberName = '';
        vm.members.forEach(function (memberObj) {
          if (memberId === memberObj.id)
            memberName = memberObj.name
        });

        return memberName;
      }

      function generateComments() {
        var times = getCommentsTime();
        var texts = getCommentsText();
        var authors = getCommentsAuthors();

        var comments = [];
        for (var i = 0; i < times.length; i++) {
          comments.push(new Comment(new Date(times[i]).toLocaleTimeString('en-us', dateOptions), authors[i], texts[i]));
        }

        return comments.length ? comments : 'No comments left';
      }

      function Comment(time, author, text) {
        this.columns = [
          {
            text: [author, '  ' + time],
            width: '40%',
            bold: true
          },
          {
            text: [text],
            width: '50%'
          }
        ];

        this.margin = [0, 5, 0, 5];
      }

      function generateAffectedObjects() {
        if (vm.changeItems1 && vm.changeItems1.length) {
          return {
            ul: getAffectedObjects()
          }
        } else {
          return 'No affected objects.'
        }
      }

      function generateTasks() {
        if (vm.tasks.length) {
          return {
            ul: getTasks()
          }
        } else {
          return 'No tasks.'
        }
      }

      function generateAdditionalInfo() {
        let additionalInfo = [];
        let keys = getAdditionalInfoKeys();
        let values = getAdditionalInfoValues();
        let rex = /(<([^>]+)>)/ig;
        for (let i = 0; i < keys.length; i++) {
          additionalInfo.push(new AdditionalInfoItem(keys[i], values[i].replace(/&lt/g, '<').replace(/&gt/g, '>').replace(/;/g, '').replace(rex , '  ').replace(/\s+/g,' ').replace(/&#65279/g,'')));
        }
        return additionalInfo.length ? additionalInfo : 'No additional info provided.';
      }

      function AdditionalInfoItem(key, value) {
        this.columns = [
          {
            text: key + ':',
            bold: true
          },
          {
            text: value
          }
        ];
      }

      function getDueDateString(date) {
        var formatter = new Intl.DateTimeFormat("en-US");

        return date ? {text: 'Due Date:   ' + formatter.format(date), margin: [0, 0, 0, 10]}
          : 'Due Date: ' + 'no Due Date for the card';
      }
    }

    $scope.IntroOptionsCard = {
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      nextLabel: '<strong>NEXT!</strong>',
      prevLabel: '<span style="color:green">Previous</span>'
    };

    $scope.IntroOptionsCardHint = {
      steps: introService.getIntroObj("impactVisualizerHint"),
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: false,
      exitOnEsc: false
    };
    $timeout(function () {
      $(".card-dialog").addClass("card-dialog-hint");
    })
    $scope.BeforeChange = function (targetElement) {
      $timeout(function () {
        $(".introjs-button").css({
          'display': 'inline-block'
        });
        $(".introjs-helperLayer").addClass("introjs-helperLayer-dashboard");
        $('.introjs-skipbutton').hide();
        $(".introjs-overlay").addClass("introjs-overlay-dashboard");
        $(".introjs-overlay").click(function () {
          $scope.ExitMe();
        });
      });
    };
    $scope.CompleteCard = function (targetElement) {
      $timeout(function () {
        $("#step66").hide();
        $(".card-dialog").removeClass("card-dialog-hint");
      });
    };
    $scope.ExitCard = function (targetElement) {
      $timeout(function () {
        $("#step66").hide();
        $(".card-dialog").removeClass("card-dialog-hint");
      });
    };
    $scope.ExitTab = function (targetElement) {
      $timeout(function () {
        $(".card-dialog").addClass("card-dialog-hint");
      });
    };
    $scope.CompletedEventTab = function (targetElement) {
      $timeout(function () {
        $(".card-dialog").addClass("card-dialog-hint");
      });
    };
    $scope.CompletedEventTabWhereUsed = function (targetElement) {
      $timeout(function () {
        $(".card-dialog").addClass("card-dialog-hint");
      });
    };
    $scope.BeforeChangeEventTab = function (targetElement) {
      $timeout(function () {
        $(".introjs-button").css({
          'display': 'inline-block'
        });
        $('.introjs-skipbutton').hide();
        $(".card-dialog").removeClass("card-dialog-hint");
      });
    };
    $scope.IntroOptions = {
      steps: introService.getIntroObj("cardsBar"),
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      nextLabel: '<strong>NEXT!</strong>',
      prevLabel: '<span style="color:green">Previous</span>'
    };

    $scope.IntroOptionsCardsModifications = {
      steps: introService.getIntroObj("cardsModification"),
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      nextLabel: '<strong>NEXT!</strong>',
      prevLabel: '<span style="color:green">Previous</span>'
    };

    vm.card = {}; //For Error Constnat
    vm.error = errors;

    vm.isTemplate = isTemplate;

    //For Session
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    vm.readonly = false;

    if (vm.sessionData.userRoleSet[0] === 'read_only') {
      vm.readonly = true;
    }

    //For Service Call Parameter
    var params = '';
    var data = '';

    //For Service Call Header
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };
    vm.progressEmail = true;
    vm.board = BoardService.data || {};
    vm.boardBackup = angular.copy(BoardService.data) || {};

    if (defualts === 'affected') {
      vm.board = {};
    }

    Array.prototype.getById = function (value) {
      return this.filter(function (x) {
        return x.id === value;
      })[0];
    };

    function proxyDetails() {
      GlobalSettingsService.getProxydetails()
        .then(function (response) {
          switch (response.code) {
            case 0:
              if (response.data.fuseObjectNumberSetting) {
                vm.enableMinorRev = response.data.fuseObjectNumberSetting.enableMinorRev;
              }
              vm.configurationSettings = response.data.systemSettings.configurationSetting ?
                (response.data.systemSettings.configurationSetting.configurationEnabled === 'true') : false;
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    $rootScope.$on('updateAffectedObjects', ()=> {
      vm.progressEmail = true;
      if (angular.equals({}, vm.board)) {
        getCardDetailsById();
      } else {
        init();
        if (!vm.board.cards.getById(cardId)) {
          getCardDetailsById().then(function (resp) {
            doInitPage();
          });
        } else {
          doInitPage();
        }
      }
    });

    $scope.$on('refreshContentInCard', function () {
      let confirm = $mdDialog.confirm()
        .title('Do you want to clear the clipboard?')
        .ariaLabel('clear the clipboard?')
        .ok('Yes')
        .multiple(true)
        .cancel('No');

      $mdDialog.show(confirm).then(function () {
        clipboardService.removeAllItems();
      }, function () {
      });
    });

    if (angular.equals({}, vm.board)) {
      getCardDetailsById();
    } else {
      init();
      if (!vm.board.cards.getById(cardId)) {
        getCardDetailsById().then(function (resp) {
          doInitPage();
        });
      } else {
        doInitPage();
      }
    }
    // this is used for first board create id
    $scope.$on('first-board-create', function (event, argu) {
      vm.boradData = argu;
    });

    // Data
    vm.resolutionCardItemsName = 'cr';
    vm.modificationCardItemsName = 'co';
    vm.nonCountableImpacts = ['rev change', 'initial release', 'object name change'];
    vm.countableImpacts = ['add', 'remove', 'change'];
    vm.dtInstance = {};
    vm.dtOptions = {};
    vm.products = {};
    vm.whereUsed = {};
    vm.newLabelColor = 'red';
    vm.members = angular.copy(vm.board.members);
    vm.membersdd = angular.copy(vm.board.members);
    vm.labels = vm.board.labels;
    vm.priority = angular.copy(vm.labels);
    vm.modalInstance = null;
    vm.tasks = [];
    vm.sortedTasks = {};
    vm.tags = Tags;
    vm.widthOfCardDialog = null;
    vm.isLatest = true;

    //vm.standardView = standardView;
    vm.showView = showView;

    /**
     * Impact Status bar… Can have 4 states
     * Blue - Rev change (Part)
     * Green - Add (BOM)
     * Red - Remove (BOM)
     * Yellow - changed (BOM)
     */
    vm.impactTypes = [{
      "name": "Revision change",
      "color": "rgb(197, 197, 197)"
    },
      {
        "name": "Add",
        "color": "#50c881"
      },
      {
        "name": "Remove",
        "color": "#ff7475"
      },
      {
        "name": "Change",
        "color": "#fff16e"
      },
      {
        "name": "Initial Release",
        "color": "#2196F3"
      },
      {
        "name": "Structure change",
        "color": "#2196F3"
      }
    ];

    vm.modifications = [];
    vm.resolutionTasks = [];
    vm.productsWhereModi = {
      modifications: [],
      resolutionTasks: []
    };
    vm.whereUsed = {
      modifications: vm.modifications,
      resolutionTasks: []
    };

    if (vm.sessionData.proxy == true) {
      params = {
        customerId: vm.sessionData.customerAdminId
      }
    } else {
      params = {
        customerId: vm.sessionData.userId
      }
    }
    vm.ngFlowOptions = {
      // You can configure the ngFlow from here
      chunkSize: 100 * 1024 * 1024,
      target: hostUrlDevelopment.test.uploadfile + '?imageType=link&' + 'customerId=' + params.customerId + '&' + 'objectId=' + cardId,
      testChunks: false,
      fileParameterName: 'uploadfile'
    };

    vm.ngFlow = {
      // ng-flow will be injected into here through its directive
      flow: {}
    };

    vm.dropping = false;

    vm.taskFilters = {
      search: '',
      idChangeItems: [],
      startDate: '',
      dueDate: '',
      modifications: {}
    };

    vm.tabs = {
      selectedIndex: 0,
      resolutionTasksTab: true,
      modificationsTab: true,
      whereUsedTab: true
    };

    vm.tablists = [{
      "text": "Where Used",
      "property": "whereUsedTab",
      "tabIndex": 0,
      "visible": true
    },
      {
        "text": "Resolution Tasks",
        "property": "resolutionTasksTab",
        "tabIndex": 1,
        "visible": true
      },
      {
        "text": "Modifications",
        "property": "modificationsTab",
        "tabIndex": 2,
        "visible": true
      }
    ];

    /**
     * filters for where used tab resolution tasks filters
     * @type {{search: string, idChangeItems: Array, startDate: string, dueDate: string, modifications: {}}}
     */
    vm.whereUsedResolutionTaskFilters = {
      search: '',
      idChangeItems: [],
      startDate: '',
      dueDate: '',
      modifications: {}
    };


    function isValidImpactObject(message) {

      if (message === "Initial Release") return true;

      if (message === "Revision change") return true;

      return vm.isEmptyImpactObject(message);

    }

    function isEmptyImpactObject(message) {
      return angular.equals({}, vm.impactTypes.findByProperty('name', message, false));
    }

    function isEmptyObject(id) {
      if (vm.changeItemsImpactVizualizer) {
        return angular.equals({}, vm.changeItemsImpactVizualizer.findByProperty('objectId', id, false));
      }
    }

    function subscribedMembers(item, array) {
      if (array.indexOf(item) === -1) {
        var addArr = [];
        addArr.push(item);
        array.push(item);
        vm.addSubscribers(addArr);
      } else {
        var removeArr = [];
        removeArr.push(item);
        array.splice(array.indexOf(item), 1);
        vm.removeSubscribers(removeArr);
      }
    }

    function addSubscribers(arr) {
      data = {
        cardId: vm.card.id,
        subscribedSet: arr
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.addsubscribeuser, '', data, header)
        .then(function (response) {

          switch (response.code) {
            case 0:
              vm.card.activities = response.data.activities
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 4004:
              console.log(response.message);
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              console.log(response.message);
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
        });
    }

    function removeSubscribers(arr) {
      data = {
        cardId: vm.card.id,
        subscribedSet: arr
      }
      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.removesubscribeuser, '', data, header)
        .then(function (response) {

          switch (response.code) {
            case 0:
              vm.card.activities = response.data.activities
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 4004:
              console.log(response.message);
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              console.log(response.message);
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
        });
    }

    function subscribedFunction() {

      //For Progress Loader
      vm.progressEmail = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      }

      data = {
        cardId: vm.card.id,
        subscribed: vm.card.subscribed
      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.subscribe, params, data, header)
        .then(function (response) {

          //For Progress Loader
          vm.progressEmail = false;

          switch (response.code) {
            case 0:
              vm.card.subscribed = response.data.subscribed;
              vm.card.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 4004:
              console.log(response.message);
              break;
            case 1006:
              //For Progress Loader
              vm.progressEmail = false;
              vm.card.subscribed = false;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              console.log(response.message);
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
        });
    }


    /**
     * Init Page
     */
    function doInitPage() {
        if (vm.isTemplate) {
          BoardService.getBoardBycardId(cardId, vm.isTemplate, vm.board.id)
            .then(handleDoInitPage)
            .catch(function (response) {
              vm.progress = false;
              console.error(response);
            });
        } else {
          BoardService.getBoardBycardId(cardId)
            .then(handleDoInitPage)
            .catch(function (response) {
              vm.progress = false;
              console.error(response);
            });
        }
    }

    function handleDoInitPage(response) {
      vm.progress = false;
      switch (response.code) {
        case 0:

          vm.board = response.data;
          vm.members = angular.copy(vm.board.members);
          // vm.card = response.data.cards[0];
          if (vm.isTemplate) {
            vm.board.templatesCardList.find(function (cardObj) {
              if (cardObj.id === cardId) {
                vm.card = cardObj;
              }
            })
          } else {
            vm.card = response.data.cards[0];
          }
          vm.addedSubsribers = vm.card.subscribedSet;
          vm.changeItems1 = vm.card.idChangeItemsList;

          vm.allSubscribers = response.data.members;
          angular.forEach(vm.allSubscribers, function (value, key) {
            if (value.name == "Fuse Admin") {
              vm.allSubscribers.splice(key, 1);
            }
          });
          angular.forEach(vm.allSubscribers, function (value, key) {
            if (value.id == vm.sessionData.userId) {
              vm.allSubscribers.splice(key, 1);
            }
          });

          if (!vm.card.due) {
            vm.selectedDuedate = new Date();
            resetDueDate();
          }
          vm.card.due = new Date(moment(vm.card.due).format('YYYY/MM/DD h:mm:ss'));

          if (vm.card.whereUsedTab === "true" || vm.card.whereUsedTab === true) {
            vm.card.whereUsedTab = true;
          } else {
            vm.card.whereUsedTab = false;
          }

          if (vm.card.resolutionTasksTab === "true" || vm.card.resolutionTasksTab === true) {
            vm.card.resolutionTasksTab = true;
          } else {
            vm.card.resolutionTasksTab = false;
          }

          if (vm.card.modificationsTab === "true" || vm.card.modificationsTab === true) {
            vm.card.modificationsTab = true;
          } else {
            vm.card.modificationsTab = false;
          }
          vm.cardcopy = angular.copy(vm.card);
          getallTask();
          pageTitleService.setPageTitle(vm.buildCardTitle());
          vm.dtOptions = {
            dom: 'rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
            columnDefs: [{
              // Target the id column
              targets: 0,
              width: '72px'
            },
              {
                // Target the image column
                targets: 1,
                //filterable: false,
                //sortable: false,
                width: '80px'
              },
              {
                targets: 2,
                //sortable: false,
                //filterable: false,
                width: '110px'
              },
              {
                // Target the quantity column
                targets: 3,
                //sortable: false,
                //filterable: false,
                width: '110px'
              },
              {
                // Target the quantity column
                targets: 4,
                //sortable: false,
                //filterable: false,
                width: '110px'
              }
            ],
            initComplete: function () {
              var api = this.api(),
                searchBox = angular.element('body').find('#e-commerce-products-search');
              // Bind an external input as a table wide search box
              if (searchBox.length > 0) {
                searchBox.on('keyup', function (event) {
                  api.search(event.target.value).draw();
                });
              }
            },
            pagingType: 'simple',
            lengthMenu: [10, 20, 30, 50, 100],
            pageLength: 10,
            scrollY: 'auto',
            responsive: true
          };
          break;
        case 4006:
          $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          $mdDialog.hide();
          break;
      }

    }

    vm.getAllTask = getallTask;

    function getallTask(param, param2, isTask) {
      if (isTask) {
        $('.card-dialog').css('display', 'flex');
      }

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          boardId: vm.board.id || vm.boradData.id,
          cardId: cardId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          boardId: vm.board.id || vm.boradData.id,
          cardId: cardId
        }
      }
      ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.getalltask, params, '', header, isTask)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          vm.progressEmail = false;
          switch (response.code) {
            case 0:
              vm.tasks = response.data;
              var firsttime, secondtime;
              vm.completedTask = 0;
              if (vm.card.checklists.length > 0) {
                angular.forEach(vm.tasks, function (value) {
                  if (value.completed === true) {
                    vm.completedTask++;
                  }
                  angular.forEach(value.activities, function (val) {
                    var timeflags = true;
                    firsttime = $filter('date')(val.time, 'medium');
                    angular.forEach(vm.card.activities, function (v) {
                      secondtime = $filter('date')(v.time, 'medium');
                      if (firsttime == secondtime) {
                        timeflags = false;
                      }
                    });
                  });
                });
              } else {
                vm.card.checklists.push({
                  id: msUtils.guidGenerator(),
                  name: vm.newCheckListTitle,
                  checkItemsChecked: 0,
                  checkItems: []
                });
              }
              break;
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    /**
     * Get Card Details By Id
     */
    function getCardDetailsById() {
      // Create a new deferred object
      var deferred = $q.defer();

      if (response) {
        handleGetCardDetailsById(response, deferred);
      } else {
        if (vm.isTemplate) {
          BoardService.getBoardBycardId(cardId, vm.isTemplate, vm.board.id)
            .then(function (res) {
              handleGetCardDetailsById(res, deferred);
            })
            .catch(function (err) {
              vm.progress = false;
              $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
              deferred.reject(err);
            });
        } else {
          BoardService.getBoardBycardId(cardId)
            .then(function (res) {
              handleGetCardDetailsById(res, deferred);
            })
            .catch(function (err) {
              vm.progress = false;
              $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
              deferred.reject(err);
            });
        }
      }
      return deferred.promise;
    }

    function handleGetCardDetailsById(response, deferred) {
      vm.progress = false;
      switch (response.code) {
        case 0:
          if (!vm.isTemplate) {
            init();
          }
          /* handle due date change */
          vm.handleDueDateChange = handleDueDateChange;
          vm.board = response.data;
          BoardService.data = response.data;
          vm.members = angular.copy(vm.board.members);
          // vm.membersdd = angular.copy(vm.board.members);
          vm.membersdd = vm.releCoodrMembersdd // here I assign members, which I got from getuserbyrole service.
          vm.labels = vm.board.labels;
          vm.priority = angular.copy(vm.labels);
          // vm.card = vm.board.cards[0];
          if (vm.isTemplate) {
            vm.board.templatesCardList.find(function (cardObj) {
              if (cardObj.id === cardId) {
                vm.card = cardObj;
              }
            })
          } else {
            vm.card = vm.board.cards[0];
          }
          if (vm.card.attachments.length > 0) {
            _.forEach(vm.card.attachments, attachment => {
              if (attachment.src.indexOf('aws') !== -1) {
                const urlComponents = attachment.src.split('/');
                  urlComponents[urlComponents.length-1] = urlComponents[urlComponents.length-1].replace(/[%]/g, '%25');
                  urlComponents[urlComponents.length-1] = urlComponents[urlComponents.length-1].replace(/[\s]/g, '%20');
                  urlComponents[urlComponents.length-1] = urlComponents[urlComponents.length-1].replace(/[+]/g, '%2B');
                  urlComponents[urlComponents.length-1] = urlComponents[urlComponents.length-1].replace(/[#]/g, '%23');
                attachment.src = '';
                for (let i=0; i < urlComponents.length-1; i++) {
                  attachment.src += `${urlComponents[i]}/`;
                }
                attachment.src += urlComponents[urlComponents.length-1];
              }
            });
          }
          vm.changeItems1 = vm.card.idChangeItemsList;
          vm.card.due = vm.card.due ? new Date(moment(vm.card.due).format('YYYY/MM/DD h:mm:ss')) : null;

          if (vm.card.whereUsedTab === "true" || vm.card.whereUsedTab === true) {
            vm.card.whereUsedTab = true;
          } else {
            vm.card.whereUsedTab = false;
          }

          if (vm.card.resolutionTasksTab === "true" || vm.card.resolutionTasksTab === true) {
            vm.card.resolutionTasksTab = true;
          } else {
            vm.card.resolutionTasksTab = false;
          }

          if (vm.card.modificationsTab === "true" || vm.card.modificationsTab === true) {
            vm.card.modificationsTab = true;
          } else {
            vm.card.modificationsTab = false;
          }
          vm.cardcopy = angular.copy(vm.card);

          getallTask();

          if (vm.card.due) {
            vm.selectedDuedate = vm.formatDate(vm.card.due);
          }
          /**
           * handle due date change
           */
          $scope.$watch(
            "vm.selectedDuedate",
            function handleDueDateChange(newValue, oldValue) {
              if (newValue) {
                vm.card.due = vm.card.due && vm.card.due.getDay() ? new Date(moment(vm.card.due).format('YYYY/MM/DD h:mm:ss')) : null;
              } else {
                vm.card.due = null;
              }
            }
          );

          pageTitleService.setPageTitle(vm.buildCardTitle());
          // Resolve the promise
          deferred.resolve("Ok");
          break;
        case 4006:
          console.log(response.message);
          $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          $mdDialog.hide();
          deferred.reject("Error");
          break;
        default:
          console.log(response.message);
          deferred.reject("Error");
      }
    }

    /**
     * filtered Result Count
     * @param i
     * @returns {number}
     */
    function filteredResultCount(filteredList) {
      var count = 0;
      var t = vm.taskFilters;

      if (vm.taskFilters.idChangeItems.length > 0) {

        var mCount = 0;

        angular.forEach(vm.taskFilters.idChangeItems, function (property, k) {
          if (vm.taskFilters.modifications.hasOwnProperty(property)) {

            if ((vm.taskFilters.modifications[property] || []).length > 0) {

              angular.forEach(vm.taskFilters.modifications[property], function (a, b) {

                angular.forEach(filteredList, function (item, index) {

                  var f = (item.modificatinList || []).filter(function (l) {
                    return l.modificationMessage === a;
                  });

                  count += (f || []).length;

                });

              });

              //count += vm.taskFilters.modifications[property].length;
            } else {

              angular.forEach(filteredList, function (item, index) {

                if (property === item.objectId) {

                  if ((item.modificatinList || []).length > 1) {
                    count += ((item.modificatinList || []).length - 1);
                  } else {
                    count++;
                  }

                }

              });

              //count++;
              //var o = vm.whereUsed.resolutionTasks.findByProperty('objectId', property, false).modificatinList;
              //count += ((o || []).length > 1 ? (o || []).length - 1 : 0);
            }

          } //else {
          //count++;
          //}
        });

      } else {
        angular.forEach(filteredList, function (o, k) {
          if ((o.modificatinList || []).length > 1) {
            count += ((o.modificatinList || []).length - 1);
          } else {
            count++;
          }
        });
      }

      return count;
    }

    /**
     * update Modifications Item Colour
     * @param d
     * @returns {*}
     */
    function updateModificationsItemColour(d) {
      if (d) {
        if ((d.modificatinList || []).length > 0) {
          return vm.impactTypes.findByProperty(
            'name',
            ((d.modificatinList || []).length > 1) ? 'Revision change' : 'Initial Release',
            false
          ).color;
        }
      }
      return '';
    }

    function getWidth() {
      if ($('#card-dialog')[0]) {
        return  3 * $('#card-dialog')[0].clientWidth / 4;
      }
    }

    /**
     * find Modifications Items Count
     * @returns {number}
     */
    function findModificationsCount() {
      var count = 0;
      angular.forEach((vm.whereUsed.resolutionTasks || []), function (i, k) {
        if ((i.modificatinList || []).length > 1) {
          count += ((i.modificatinList || []).length - 1);
        } else {
          count++;
        }
      });
      return count;
    }

    /**
     * Init the controller
     */
    function init() {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.getuserbyrole, params, '', header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              var members = [];
              angular.forEach(response.data.Members, function (value, key) {
                var FullName = value.firstName + ' ' + value.lastName;
                if (value.isActive === true && value.status === true) {
                  members.push({
                    id: value.userId,
                    name: FullName
                  });
                }
              });
              vm.membersdd = members;
              vm.releCoodrMembersdd = members;
              break;
            case 1006:
              console.log(response.message);
              //$mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });

      /**
       * Sort all associated tasks
       */
      vm.dtOptions = {
        dom: 'rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
        columnDefs: [{
          // Target the id column
          targets: 0,
          width: '72px'
        },
          {
            // Target the image column
            targets: 1,
            //filterable: false,
            //sortable: false,
            width: '80px'
          },
          {
            targets: 2,
            //sortable: false,
            //filterable: false,
            width: '110px'
          },
          {
            // Target the quantity column
            targets: 3,
            //sortable: false,
            //filterable: false,
            width: '110px'
          },
          {
            // Target the quantity column
            targets: 4,
            //sortable: false,
            //filterable: false,
            width: '110px'
          }
        ],
        initComplete: function () {
          var api = this.api(),
            searchBox = angular.element('body').find('#e-commerce-products-search');

          // Bind an external input as a table wide search box
          if (searchBox.length > 0) {
            searchBox.on('keyup', function (event) {
              api.search(event.target.value).draw();
            });
          }
        },
        pagingType: 'simple',
        lengthMenu: [10, 20, 30, 50, 100],
        pageLength: 10,
        scrollY: 'auto',
        responsive: true
      };

      $timeout(function () {
        vm.widthOfCardDialog = getWidth();
        vm.showView = showView;
        //vm.changeView('CO');
        if (vm.showView) {

        }
      }, 1000);
    }

    const debouncedGetAllFuseObjectRevModi = _.debounce(getallfuseobjectRevModi, 2000);

    function getAllFuseObjectRevModi() {
      debouncedGetAllFuseObjectRevModi.cancel();
      debouncedGetAllFuseObjectRevModi();
    }

    function getallfuseobjectRevModi() {
      //var sortedArray = [];

      //For Progress Loader

      vm.progressWhereused = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          fuseObjectType: ''
        };
      } else {
        params = {
          fuseObjectType: ''
        };
      }

      ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.getallfuseobjectcustom, params, '', header)
        .then(function (response) {

          switch (response.code) {
            case 0:
              vm.productsWhereModi.resolutionTasks = [];
              vm.whereUsed.resolutionTasks = [];
              vm.changeItemsImpactVizualizer = response.data;
              angular.forEach(response.data, function (value, key) {

                angular.forEach(vm.card.whereUsed, function (val, keys) {
                  if (val === value.objectId) {

                    if (value) {
                      vm.productsWhereModi.resolutionTasks.push(value);
                    }

                  }
                });
                angular.forEach(vm.card.idChangeItems, function (val, keys) {
                  if (val === value.objectId) {
                    vm.whereUsed.resolutionTasks.push(value);
                  }
                });
              });
              //   var match = (vm.whereUsed.resolutionTasks || []).filter(function(o) {
              //     return o.objectId == i;
              //   });
              //
              //   if (match.length > 0) {
              //     sortedArray.push(match[0]);
              //   }
              //
              // // sort items assigned in to target
              // vm.whereUsed.resolutionTasks = sortedArray || [];

              /* card resolution tasks */
              vm.resolutionTasks = response.data;

              var modification = [];
              /* card resolution tasks */
              angular.forEach(response.data, function (value, key) {

                angular.forEach(value.modificatinList, function (v, k) {

                  angular.forEach(vm.card.modifications, function (val, key) {
                    if (val === v.modificationId) {
                      vm.modifications.push(v);
                    }
                  });
                });
              });
              //For Progress Loader
              vm.progressEmail = false;
              vm.progressWhereused = false;
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function removeDuplicates(originalArray, objKey) {
      var trimmedArray = [];
      var values = [];
      var value;

      originalArray.forEach(function (row, i) {
        row[objKey] = parseStrings(row);
        value = row[objKey];

        if (values.indexOf(value) === -1) {
          trimmedArray.push(row);
          values.push(value);
        }
      });
      return trimmedArray;
    }

    let allFuseObjectCalled = false;

    function getallfuseobject(progress) {
      if (allFuseObjectCalled) {
        return;
      }
      allFuseObjectCalled = true;

      if (vm.changeItems.length == []) {

        //For Progress Loader
        vm.progressAffectedobject = progress;

        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            fuseObjectType: ''
          };
        } else {
          params = {
            fuseObjectType: ''
          };
        }

        ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.getallfuseobjectcustom, params, '', header)
          .then(function (response) {
            vm.progress = false;
            switch (response.code) {
              case 0:
                vm.changeItems = response.data;
                vm.changeItems = removeDuplicates(vm.changeItems, 'displayObjectId');
                //For Progress Loader
                vm.progressAffectedobject = false;
                break;
              case 4006:
                console.log(response.message);
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            vm.progressAffectedobject = false;
            $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
          });
      }

    }

    function addCardPriority(labelId) {
      if (vm.cardcopy.idLabels.length > 0) {
        if (vm.sessionData.proxy == true) {
          params = {
            cardId: vm.card.id,
            boardId: vm.board.id,
            priorityId: vm.cardcopy.idLabels[0],
            customerId: vm.sessionData.customerAdminId
          }
        } else {
          params = {
            cardId: vm.card.id,
            boardId: vm.board.id,
            priorityId: vm.cardcopy.idLabels[0],
            customerId: vm.sessionData.userId
          }
        }
        vm.cardcopy.idLabels = [];

        ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.removecardpriority, params, '', header)
          .then(function (response) {
            vm.progress = false;
            switch (response.code) {
              case 0:
                vm.card.activities = response.data.activities;
                $mdToast.show($mdToast.simple().textContent("Remove Priority Successfully...").position('top right'));
                break;
              case 4004:
                console.log(response.message);
                break;
              case 1006:
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                console.log(response.message);
                break;
              case 4006:
                console.log(response.message);
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            vm.progress = false;
            $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
          });
      } else {
        var listId = "";
        angular.forEach(vm.board.lists, function (value, key) {
          angular.forEach(value.idCards, function (val, keys) {
            if (val === vm.card.id) {
              listId = value.id;
            }
          });
        });

        if (vm.sessionData.proxy == true) {
          params = {
            boardId: vm.board.id,
            listId: listId,
            customerId: vm.sessionData.customerAdminId
          }
        } else {
          params = {
            boardId: vm.board.id,
            listId: listId,
            customerId: vm.sessionData.userId
          }
        }

        data = {
          cardId: vm.card.id,
          cardPriority: labelId
        };

        ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdatecard, params, data, header)
          .then(function (response) {
            vm.progress = false;
            switch (response.code) {
              case 0:
                var cardP = [];
                cardP.push(response.data.cardPriority);
                vm.cardcopy.idLabels = cardP;
                vm.card.activities = response.data.activities;
                $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
                break;
              case 1006:
                vm.labels = [];
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              case 4006:
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            vm.progress = false;
            console.error(response);
          });
      }
    }

    function changeItemFuntion(CI) {
      vm.objectId = '';

      if (CI != undefined) {
        angular.forEach(vm.changeItems, function (value, key) {

          if (CI === value.displayObjectId) {
            vm.objectId = value.objectId;
          }
        });
        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            cardId: vm.card.id
          }
        } else {
          params = {
            customerId: vm.sessionData.userId,
            cardId: vm.card.id
          }
        }

        data = {
          id: vm.objectId,
          color: 'Red',
          name: CI
        };

        ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.checkitemcard, params, data, header)
          .then(function (response) {
            vm.progress = false;
            switch (response.code) {
              case 0:

                vm.items = response.data;
                vm.ItemCard = '';
                angular.forEach(response.data, function (value, key) {
                  vm.ItemCard = value;
                });

                if (response.data.length === 0) {
                  angular.forEach(vm.changeItems, function (value, key) {

                    if (CI === value.displayObjectId) {
                      vm.objectId = value.objectId;
                    }
                  });
                  if (vm.sessionData.proxy == true) {
                    params = {
                      customerId: vm.sessionData.customerAdminId,
                      cardId: vm.card.id
                    }
                  } else {
                    params = {
                      customerId: vm.sessionData.userId,
                      cardId: vm.card.id
                    }
                  }
                  data = {
                    id: vm.objectId,
                    color: 'Red',
                    name: CI
                  };

                  ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.changeitemcard, params, data, header)
                    .then(function (response) {
                      vm.progress = false;
                      switch (response.code) {
                        case 0:
                          vm.card.idChangeItems = [];
                          vm.card.idChangeItemsList = [];
                          angular.forEach(response.data.changeItemList, function (value, key) {
                            vm.card.idChangeItems.push(value.id);
                          });
                          angular.forEach(response.data.changeItemList, function (value, key) {
                            vm.card.idChangeItemsList.push(value);
                          });
                          vm.card.activities = response.data.activities;
                          $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
                          angular.forEach(vm.changeItems, function (value, key) {
                            if (CI.objectId === value.objectId) {
                              vm.changeItems1.push(value);
                            }
                          });
                          vm.card.whereUsed = response.data.whereUsed;
                          vm.card.modifications = response.data.modifications;
                          vm.card.whereUsedTab = vm.board.isWhereused;
                          vm.card.resolutionTasksTab = vm.board.isResolutionTask;
                          vm.card.modificationsTab = vm.board.isRevModification;
                          vm.whereUsed.resolutionTasks = [];
                          vm.modifications = [];
                          vm.productsWhereModi.resolutionTasks = [];
                          getAllFuseObjectRevModi();
                          break;
                        case 1006:
                          if (vm.card.idChangeItems.length == 0) {
                            vm.changeItems1 = [];
                          } else {
                            // vm.card.idChangeItems = vm.cardcopy.idChangeItems;
                            // vm.cardcopy = angular.copy(vm.card);
                            angular.forEach(vm.card.idChangeItems, function (val, keys) {
                              angular.forEach(vm.changeItems, function (value, keyws) {
                                if (val === value.objectId) {
                                  console.log('if');
                                  vm.changeItems1.push(value);
                                }
                              });
                            });
                          }
                          console.log(response.message);
                          $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                          break;
                        case 4006:
                          break;
                        case 20:
                          console.log(response.message);
                          $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                          break;
                        default:
                          console.log(response.message);
                      }
                    })
                    .catch(function (response) {
                      vm.progress = false;
                      console.error(response);
                    });
                } else {
                  checkItemCard(vm.ItemCard, vm.items);
                }
                break;
              case 1006:

                if (vm.card.idChangeItems.length == 0) {
                  vm.changeItems1 = [];
                } else {
                  // vm.card.idChangeItems = vm.cardcopy.idChangeItems;
                  // vm.cardcopy = angular.copy(vm.card);
                  angular.forEach(vm.card.idChangeItems, function (val, keys) {
                    angular.forEach(vm.changeItems, function (value, keyws) {
                      if (val === value.objectId) {
                        console.log('if');
                        vm.changeItems1.push(value);
                      }
                    });
                  });
                }
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              case 4006:
                break;
              case 20:
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            vm.progress = false;
            console.error(response);
          });
      }
    }

    function checkItemCard(ItemCard, items, ev) {
      let objectIsExist = _.find(vm.card.idChangeItems, changeItem => changeItem === ItemCard.objectId);
      if (objectIsExist) {
        vm.changeItems1 = [];
        angular.forEach(vm.card.idChangeItems, function (val, keys) {
          angular.forEach(vm.changeItems, function (value, keyws) {
            if (val === value.objectId) {
              vm.changeItems1.push(value);
            }
          });
        });
        $mdToast.show($mdToast.simple().textContent(`${ItemCard.displayPartId} already exists in the card.`).action('x').position('top right').hideDelay(0));
      } else {
        $mdDialog.show({
          template: '<md-dialog id="existDialog">' +
            '<md-dialog-content>' +
            '<b>{{ItemCard.displayPartId}}</b>' +
            'is already associated to another card' +
            '<br>' +
            '<b>{{ItemCard.boardName}}: <span ng-repeat="i in items">{{i.cardTitle}}<span ng-if="!$last">, </span></span></b>' +
            '<br>' +
            'Would you still like to proceed?' +
            '</md-dialog-content>' +
            '<md-dialog-actions>' +
            '<md-button ng-click="closeDialog()" class="md-primary">' +
            'No, do not associate' +
            '</md-button>' +
            '<md-button ng-click="yesDialog()" class="md-primary">Yes</md-button>' +
            '</md-dialog-actions>' +
            '</md-dialog>',
          controller: ExistingobjectDialogController,
          controllerAs: 'vm',
          skipHide: true,
          targetEvent: ev,
          clickOutsideToClose: true,
          escapeToClose: true,
          multiple: true,
          locals: {
            ItemCard: ItemCard,
            items: items
          }
        }).then(function () {
          if (vm.sessionData.proxy == true) {
            params = {
              customerId: vm.sessionData.customerAdminId,
              cardId: vm.card.id
            }
          } else {
            params = {
              customerId: vm.sessionData.userId,
              cardId: vm.card.id
            }
          }
          data = {
            id: ItemCard.objectId,
            color: 'Red',
            name: ItemCard.displayPartId
          };

          ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.changeitemcard, params, data, header)
            .then(function (response) {
              vm.progress = false;
              switch (response.code) {
                case 0:
                  vm.card.idChangeItems = [];
                  vm.changeItems1 = [];
                  vm.card.idChangeItemsList = [];
                  angular.forEach(response.data.changeItemList, function (value, key) {
                    vm.card.idChangeItems.push(value.id);
                  });
                  angular.forEach(response.data.changeItemList, function (value, key) {
                    vm.card.idChangeItemsList.push(value);
                  });
                  angular.forEach(response.data.changeItemList, function (val, keys) {
                    angular.forEach(vm.changeItems, function (value, keyws) {
                      if (val.id === value.objectId) {
                        vm.changeItems1.push(value);
                      }
                    });
                  });
                  console.log(response.data);
                  vm.card.activities = response.data.activities;
                  vm.card.whereUsed = response.data.whereUsed;
                  vm.card.modifications = response.data.modifications;
                  vm.card.whereUsedTab = vm.board.isWhereused;
                  vm.card.resolutionTasksTab = vm.board.isResolutionTask;
                  vm.card.modificationsTab = vm.board.isRevModification;
                  vm.whereUsed.resolutionTasks = [];
                  vm.modifications = [];
                  vm.productsWhereModi.resolutionTasks = [];
                  getAllFuseObjectRevModi();
                  $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
                  break;
                case 1006:
                  if (vm.card.idChangeItems.length == 0) {
                    vm.changeItems1 = [];
                  } else {
                    vm.changeItems1 = [];
                    angular.forEach(vm.changeItems, function (value, key) {
                      angular.forEach(vm.cardcopy.idChangeItems, function (val, k) {
                        if (val === value.objectId) {
                          vm.changeItems1.push(value);
                        }
                      });
                    });
                  }
                  console.log(response.message);
                  $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                  break;
                case 4006:
                  break;
                case 20:
                  vm.changeItems1 = [];
                  angular.forEach(vm.card.idChangeItems, function (val, keys) {
                    angular.forEach(vm.changeItems, function (value, keyws) {
                      if (val === value.objectId) {
                        vm.changeItems1.push(value);
                      }
                    });
                  });
                  console.log(response.message);
                  $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                  break;
                default:
                  console.log(response.message);
              }
            })
            .catch(function (response) {
              vm.progress = false;
              console.error(response);
            });
        });
      }
    }

    function ExistingobjectDialogController($scope, $mdDialog, ItemCard, items) {
      // Assigned from construction <code>locals</code> options...
      $scope.ItemCard = ItemCard;
      $scope.items = items;
      $scope.yesDialog = function () {
        $mdDialog.hide();
      };
      $timeout(() => {
        angular.element(document.getElementById('existDialog').parentElement).css({'z-index': '101'})
      }, 50);
      $scope.closeDialog = function () {
        $mdDialog.cancel();
        vm.changeItems1 = [];
        angular.forEach(vm.card.idChangeItems, function (val, k) {
          angular.forEach(vm.changeItems, function (value, key) {
            if (val === value.objectId) {
              vm.changeItems1.push(value);
            }
          })
        });
      };
    }

    function changeItemFuntions(CI) {
      vm.objectId = '';
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          cardId: vm.card.id
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          cardId: vm.card.id
        }
      }
      data = {
        id: CI.objectId,
        color: 'Red',
        name: CI.displayObjectId
      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.checkitemcard, params, data, header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:

              vm.items = response.data;
              vm.ItemCard = '';
              angular.forEach(response.data, function (value, key) {
                vm.ItemCard = value;
              });

              if (response.data.length === 0) {
                angular.forEach(vm.changeItems, function (value, key) {

                  if (CI.displayObjectId === value.displayObjectId) {
                    vm.objectId = value.objectId;
                  }
                });
                if (vm.sessionData.proxy == true) {
                  params = {
                    customerId: vm.sessionData.customerAdminId,
                    cardId: vm.card.id
                  }
                } else {
                  params = {
                    customerId: vm.sessionData.userId,
                    cardId: vm.card.id
                  }
                }
                data = {
                  id: vm.objectId,
                  color: 'Red',
                  name: CI.displayObjectId
                };

                ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.changeitemcard, params, data, header)
                  .then(function (response) {
                    vm.progress = false;
                    switch (response.code) {
                      case 0:
                        vm.card.idChangeItems = [];
                        vm.card.idChangeItemsList = [];
                        vm.card.activities = response.data.activities;
                        $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
                        vm.changeItems1 = [];
                        angular.forEach(response.data.changeItemList, function (val, keys) {
                          vm.card.idChangeItems.push(val.id);
                          angular.forEach(vm.changeItems, function (value, keyws) {
                            if (val.id === value.objectId) {
                              vm.changeItems1.push(value);
                            }
                          });
                        });
                        angular.forEach(response.data.changeItemList, function (value, key) {
                          vm.card.idChangeItemsList.push(value);
                        });
                        vm.card.whereUsed = response.data.whereUsed;
                        vm.card.modifications = response.data.modifications;
                        vm.card.whereUsedTab = vm.board.isWhereused;
                        vm.card.resolutionTasksTab = vm.board.isResolutionTask;
                        vm.card.modificationsTab = vm.board.isRevModification;
                        vm.whereUsed.resolutionTasks = [];
                        vm.modifications = [];
                        vm.productsWhereModi.resolutionTasks = [];
                        getAllFuseObjectRevModi();
                        break;
                      case 1006:
                        if (vm.card.idChangeItems.length == 0) {
                          vm.card.idChangeItems = [];
                        } else {
                          vm.card.idChangeItems = vm.cardcopy.idChangeItems;
                        }
                        console.log(response.message);
                        $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                        break;
                      case 4006:
                        break;
                      case 20:
                        console.log(response.message);
                        $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                        break;
                      default:
                        console.log(response.message);
                    }
                  })
                  .catch(function (response) {
                    vm.progress = false;
                    console.error(response);
                  });
              } else {
                checkItemCard(vm.ItemCard, vm.items);
              }
              break;
            case 1006:
              if (vm.card.idChangeItems.length == 0) {
                vm.card.idChangeItems = [];
                vm.changeItems1 = [];
              } else {
                vm.changeItems1 = [];
                angular.forEach(vm.changeItems, function (value, key) {
                  angular.forEach(vm.cardcopy.idChangeItems, function (val, k) {
                    if (val === value.objectId) {
                      vm.changeItems1.push(value);
                    }
                  });
                });
              }
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    function changeItemRemoveFunctions(CI, url) {
      var firstProp;
      for (var key in CI) {
        if (CI.hasOwnProperty(key)) {
          if (key === 'objectId') {
            firstProp = key;
          }
        }
      }

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          cardId: vm.card.id
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          cardId: vm.card.id
        }
      }
      if (firstProp === 'objectId') {
        data = {
          id: CI.objectId,
          color: 'Red',
          name: CI.objectName
        };
      } else {
        if (typeof CI === 'object') {
          data = {
            id: CI.id,
            color: 'Red',
            name: CI.name
          };
        } else {
          data = {
            id: CI.id,
            color: 'Red',
            name: CI
          };
        }
      }

      ScrumboardService.dataManipulation('POST', url, params, data, header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.card.idChangeItems = [];
              angular.forEach(response.data.changeItemList, function (value, key) {
                vm.card.idChangeItems.push(value.id);
              });
              vm.card.activities = response.data.activities;
              vm.whereUsed.resolutionTasks = [];
              vm.modifications = [];
              vm.productsWhereModi.resolutionTasks = [];
              vm.card.whereUsedTab = vm.board.isWhereused;
              vm.card.resolutionTasksTab = vm.board.isResolutionTask;
              vm.card.modificationsTab = vm.board.isRevModification;
              vm.card.whereUsed = response.data.whereUsed;
              vm.card.modifications = response.data.modifications;
              getAllFuseObjectRevModi();
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              if (vm.card.idChangeItems.length == 0) {
                vm.changeItems1 = [];
              } else {
                vm.changeItems1 = [];
                angular.forEach(vm.changeItems, function (value, key) {
                  angular.forEach(vm.cardcopy.idChangeItems, function (val, k) {
                    if (val === value.objectId) {
                      vm.changeItems1.push(value);
                    }
                  });
                });
              }
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    function addMember() {

      vm.progressEmail = true;

      var listId = "";
      angular.forEach(vm.board.lists, function (value, key) {
        angular.forEach(value.idCards, function (val, keys) {
          if (val === vm.card.id) {
            listId = value.id;
          }
        });
      });

      if (vm.sessionData.proxy == true) {
        params = {
          boardId: vm.board.id,
          listId: listId,
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          boardId: vm.board.id,
          listId: listId,
          customerId: vm.sessionData.userId
        }
      }

      data = {
        cardId: vm.card.id,
        membersIdList: vm.card.idMembers
      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.addremoverc, params, data, header)
        .then(function (response) {

          vm.progressEmail = false;

          switch (response.code) {
            case 0:
              vm.card.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              vm.card.idMembers = vm.cardcopy.idMembers;
              vm.cardcopy.idMembers = vm.card.idMembers;
              console.log(response.message);
              vm.progressEmail = false;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }


    function removeMember(member) {

      vm.progressEmail = true;

      var memberId = vm.card.idMembers.indexOf(member);

      if (memberId > -1) {
        vm.card.idMembers.splice(memberId, 1);
      }

      var listId = "";

      angular.forEach(vm.board.lists, function (value, key) {
        angular.forEach(value.idCards, function (val, keys) {
          if (val === vm.card.id) {
            listId = value.id;
          }
        });
      });

      if (vm.sessionData.proxy == true) {
        params = {
          boardId: vm.board.id,
          listId: listId,
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          boardId: vm.board.id,
          listId: listId,
          customerId: vm.sessionData.userId
        }
      }

      data = {
        cardId: vm.card.id,
        membersIdList: vm.card.idMembers
      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.addremoverc, params, data, header)
        .then(function (response) {

          vm.progressEmail = false;

          switch (response.code) {
            case 0:
              vm.card.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              vm.card.idMembers = vm.cardcopy.idMembers;
              // vm.cardcopy.idMembers = vm.card.idMembers;
              vm.cardcopy = angular.copy(vm.card);
              //For Progress Loader
              vm.progressEmail = false;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    /**
     * Update Card
     */
    function updateCard() {

      var listId = "";

      angular.forEach(vm.board.lists, function (value, key) {
        angular.forEach(value.idCards, function (val, keys) {
          if (val === vm.card.id) {
            listId = value.id;
          }
        });
      });

      if (vm.sessionData.proxy == true) {
        params = {
          boardId: vm.board.id,
          listId: listId,
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          boardId: vm.board.id,
          listId: listId,
          customerId: vm.sessionData.userId
        }
      }

      data = {
        cardId: vm.card.id,
        cardTitle: vm.card.name
      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdatecard, params, data, header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              $rootScope.$broadcast('updateCardTemplates');
              vm.card.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Details Updated Successfully...").position('top right'));
              break;
            case 1006:
              vm.card.name = vm.cardcopy.name;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    function updateCardDescription() {
      var listId = "";

      angular.forEach(vm.board.lists, function (value, key) {
        angular.forEach(value.idCards, function (val, keys) {
          if (val === vm.card.id) {
            listId = value.id;
          }
        });
      });

      if (vm.sessionData.proxy == true) {
        params = {
          boardId: vm.board.id,
          listId: listId,
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          boardId: vm.board.id,
          listId: listId,
          customerId: vm.sessionData.userId
        }
      }

      data = {
        cardId: vm.card.id,
        cardDescription: vm.card.description

      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdatecard, params, data, header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.card.activities = response.data.activities;
              if (!vm.isTemplate) {
                $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              }
              break;
            case 1006:
              vm.card.description = vm.cardcopy.description;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    function updateTabs(tab) {
      vm.card[tab.property] = !tab.visible;
    }

    /**
     * does resolution Task Exist In Where Used Tab by id
     * @param id
     * @returns {boolean}
     */
    function resolutionTaskExistInWhereUsedTab(id) {
      return vm.whereUsedResolutionTaskFilters.idChangeItems.indexOf(id) > -1;
    }

    /**
     * filter By Where Used Resolution Tasks
     *
     * @param item
     * @returns {boolean}
     */
    function filterByWhereUsedResolutionTasks(item) {
      return vm.resolutionTaskExistInWhereUsedTab(item.objectId);
    }

    /**
     * get parent assembly item border color
     */
    function getParentAssemblyItemBorderColor() {
      return '#c5c5c5';
    }

    /**
     * filter by change item Id
     * @param id
     * @returns {*}
     */
    function filtersByChangeItemId(id) {
      var filter = $filter('filter')(vm.modifications, {
        'modificationId': id
      }, true);
      if (filter.length) {

        return filter;
      } else {
        return vm.changeItemsImpactVizualizer.findByProperty('objectId', id, false);
      }
    }

    /**
     * This method respresent the current modification object having
     * multiple changes
     * @param m - modification
     * @returns {boolean} - true - has modifications, or else false.
     */
    function hasModifications(m) {
      if (m) {
        return (m.modificatinList || []).length > 1 ? true : false;
      }
    }

    /* find the stacked bar values */
    function findStackedBarValues(m) {
      var stackedBar = [];
      var filteredItems = (m.modificatinList || []);
      angular.forEach(vm.impactTypes, function (i, k) {

        var type = i;

        var clone = $filter('filter')(filteredItems, {
          'modificationMessage': type.name
        }, true);

        if (vm.countableImpacts.indexOf(angular.lowercase(type.name)) > -1) {
          stackedBar.push({
            id: i.id,
            length: clone.length,
            name: type.name,
            color: type.color
          });
        }
      });
      return stackedBar;
    }

    /**
     * Filter by changeItems
     *
     * @param item
     * @returns {boolean}
     */
    function filterByChangeItems(item) {
      return vm.isChangeItemExists(item.id);
    }


    /**
     * find the stacked bar length
     * @param assemblyId - assembly type id
     * @returns {number}
     */
    function findStackedBarLength(m) {
      var length = 0;
      var filteredItems = (m.modificatinList || []);
      angular.forEach(filteredItems, function (i, k) {
        var text = angular.lowercase(i.modificationMessage);
        if (vm.countableImpacts.indexOf(text) > -1) {
          length += 1;
        }
      });
      return length;
    }

    /**
     * @param full {boolean}
     *
     * build title of the card
     */
    function buildCardTitle(full) {
      var title = [''];
      title.push(vm.board.name || '');
      title.push('#');
      if (full) {
        title.push(vm.card.companySeqId);
      } else {
        title.push($filter('ellipsis')(vm.card.companySeqId, true, 15));
      }

      return title.join("");
    }


    /**
     * Calculate count of completed tasks
     * @returns {number} - count of completed tasks
     */
    function completedTasks(listTasks) {
      var completed = 0;

      angular.forEach(listTasks, function (task) {
        if (task.completed) {
          completed++;
        }
      });
      return completed;
    }

    /**
     * sort id tasks
     * @param idTask {string} -  idTask
     * @returns {boolean} - bool value of completed
     */
    function sortIdTasks(idTask) {
      var b = !vm.sortedTasks[idTask].completed;
      return b;
    }

    /**
     * handle due date change
     * @param date - date instance
     */
    function handleDueDateChange(date) {

      //For Progress Loader
      vm.progressEmail = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      data = {
        cardId: cardId,
        dueDate: new Date(moment(date).format('YYYY/MM/DD h:mm:ss'))
      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.updatecarddate, params, data, header)
        .then(function (response) {

          switch (response.code) {
            case 0:

              //For Progress Loader
              vm.progressEmail = false;

              vm.card.activities = response.data.activities;
              vm.oldDuedate = angular.copy(response.data.dueDate);
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              vm.card.due = new Date(moment(vm.cardcopy.due).format('YYYY/MM/DD h:mm:ss'));
              vm.progressEmail = false;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4002:
              vm.selectedDuedate = '';
              vm.progressEmail = false;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    /**
     * format date
     * @param dt - date string
     * @returns {string} - valid date string
     */
    function formatDate(dt) {
      if (Number(dt)) {
        return moment(new Date(dt)).format('YYYY/MM/DD');
      } else {
        return moment(new Date(dt)).format('YYYY/MM/DD');
      }
    }

    /**
     * Prevent default
     *
     * @param e
     */
    function preventDefault(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    /**
     * format date
     * @param dt - date string
     * @returns {string} - valid date string
     */
    function formatDueDate(dt) {
      return moment(new Date(dt)).format('MMM D, YYYY');
    }

    /**
     * default avatar
     * @param index
     */
    function defaultAvatar(nameOfOwner) {
      if (nameOfOwner) {
        var initials = (nameOfOwner || '').match(/\b\w/g);
        initials = (initials.shift() + initials.pop()).toUpperCase();
        return initials;
      }
    }

    /**
     * find avatar image existance
     * @param index
     */
    function isAvatarAvailable(avatar) {
      return avatar ? true : false;
    }

    /**
     * Close Dialog
     */
    function closeDialog() {
      $mdDialog.hide(vm.card);
      pageTitleService.setPageTitle(vm.board.name + ' ' + pageTitles.individualBoard);
    }

    /**
     *
     * @param isSendObject - the flag which tell, what to send if there are no lists : undefined or default object
     * this is needed to identify the place, from where the function was called.
     * So we need the default object only when exporting to PDF.
     * @returns {{name: string}} or the list of cards
     */
    function getCardList(isSendObject) {
      var response;
      if (vm.board.lists != undefined) {
        for (var i = 0, len = vm.board.lists.length; i < len; i++) {
          if (vm.board.lists[i].idCards.indexOf(vm.card.id) > -1) {
            response = vm.board.lists[i];
            break;
          }
        }

        return isSendObject ?
          response ? response : {name: 'not attached to any list'}
          : response;
      }
    }

    /**
     * filter for resolution tasks filters in where used tab
     * @param changeItemId
     */
    function whereUsedToggleResolutionTasksFilter(idChangeItem) {

      var i = vm.whereUsedResolutionTaskFilters.idChangeItems.indexOf(idChangeItem);
      if (i > -1) {
        vm.whereUsedResolutionTaskFilters.idChangeItems.splice(i, 1);
      } else {
        vm.whereUsedResolutionTaskFilters.idChangeItems.push(idChangeItem);
      }
    }

    /**
     * Toggles changeItem filter
     *
     * @param idChangeItem
     */
    function toggleChangeItemFilter(idChangeItem, hasModification) {
      var i = vm.taskFilters.idChangeItems.indexOf(idChangeItem);

      if (i > -1) {
        vm.taskFilters.idChangeItems.splice(i, 1);

        if ((vm.taskFilters.modifications[idChangeItem] || []).length > 0)
          vm.taskFilters.modifications[idChangeItem] = [];

      } else {

        if (hasModification) {
          if (!((vm.taskFilters.modifications[idChangeItem] || []).length > 0))
            vm.taskFilters.modifications[idChangeItem] = [];
        }

        vm.taskFilters.idChangeItems.push(idChangeItem);
      }
    }

    /**
     * Toggles ECO changeItem filter
     *
     * @param idChangeItem
     */
    function toggleECOChangeItemFilter(idChangeItem) {
      var i = vm.taskFilters.idChangeItems.indexOf(idChangeItem);

      if (i > -1) {
        vm.taskFilters.idChangeItems.splice(i, 1);
        vm.taskFilters.modifications[idChangeItem] = [];
      } else {

        if (!(vm.taskFilters.idChangeItems.indexOf(idChangeItem) > -1)) {
          vm.taskFilters.modifications[idChangeItem] = [];
        }

        vm.taskFilters.idChangeItems.push(idChangeItem);
      }
    }

    /**
     * Toggles Modification filter
     *
     * @param idChangeItem
     * @param idModification
     */
    function toggleModificationFilter(idChangeItem, idModification) {
      if (vm.taskFilters.idChangeItems.indexOf(idChangeItem) == -1) {
        vm.taskFilters.idChangeItems.push(idChangeItem);
      }

      if (!vm.taskFilters.modifications[idChangeItem]) {
        vm.taskFilters.modifications[idChangeItem] = [idModification];

      } else {
        var i = vm.taskFilters.modifications[idChangeItem].indexOf(idModification);

        if (i > -1) {
          vm.taskFilters.modifications[idChangeItem].splice(i, 1);
        } else {
          vm.taskFilters.modifications[idChangeItem].push(idModification);
        }
      }
    }


    /**
     * Returns if change item exists in the changeItemFilter
     *
     * @param id - id ChangeItem
     * @returns {boolean}
     */
    function isChangeItemExists(id) {
      return vm.taskFilters.idChangeItems.indexOf(id) > -1;
    }


    /**
     * Returns if change item exists in the changeItemFilter
     *
     * @param idChangeItem - id ChangeItem
     * @param idModification
     * @returns {boolean}
     */
    function isModificationExists(idChangeItem, idModification) {
      if (!vm.taskFilters.modifications[idChangeItem]) {
        return false;
      }
      return vm.taskFilters.modifications[idChangeItem].indexOf(idModification) > -1;
    }

    /**
     * Remove card
     *
     * @param ev
     */
    function removeCard(ev) {
      var confirm = $mdDialog.confirm({
        title: 'Remove Card',
        textContent: 'Are you sure want to remove card?',
        ariaLabel: 'remove card',
        targetEvent: ev,
        clickOutsideToClose: true,
        escapeToClose: true,
        ok: 'Remove',
        cancel: 'Cancel'
      });

      $mdDialog.show(confirm).then(function () {

        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            cardId: vm.card.id
          }
        } else {
          params = {
            cardId: vm.card.id
          }
        }

        ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.removecard, params, '', header)
          .then(function (response) {
            vm.progress = false;
            switch (response.code) {
              case 0:
                if (vm.isTemplate) {
                  $rootScope.$broadcast("SendUp", "some data");
                } else {
                  var cardList = getCardList(false);
                  cardList.idCards.splice(cardList.idCards.indexOf(vm.card.id), 1);
                  vm.board.cards.splice(vm.board.cards.indexOf(vm.card), 1);
                  if ($state.current.name.indexOf('scrumboard') !== -1) {
                    $rootScope.updateBoardAfterRemovingCard();
                  }
                  $rootScope.$broadcast("SendUp", "some data");
                  $mdToast.show($mdToast.simple().textContent("Card Removed Successfully...").position('top right'));
                }
                break;
              case 1006:
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              case 4006:
                break;
              case 10:
                $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            vm.progress = false;
            console.error(response);
          });
      }, function () {
        $rootScope.$broadcast("SendUp", "some data");
      });
    }

    /**
     * Toggle cover image
     *
     * @param attachmentId
     */
    function toggleCoverImage(attachmentId) {
      if (attachmentId === vm.card.idAttachmentCover) {
        vm.card.idAttachmentCover = null;
      } else {
        vm.card.idAttachmentCover = attachmentId;
      }
    }

    /**
     * Remove attachment
     *
     * @param item
     */
    function removeAttachment(item) {
      vm.progress = true;

      if (vm.card.idAttachmentCover === item.id) {
        vm.card.idAttachmentCover = '';
      }

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          cardId: vm.card.id
        }
      } else {
        params = {
          cardId: vm.card.id
        }
      }

      data = {
        id: item.id
      };
      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.addremovecardattachment, params, data, header)
        .then(function (response) {

          switch (response.code) {
            case 0:
              vm.progress = false;
              vm.card.attachments.splice(vm.card.attachments.indexOf(item), 1);
              if (vm.card.attachments.length > 0) {
                _.forEach(vm.card.attachments, attachment => {
                  if (attachment.src.indexOf('aws') !== -1) {
                    const urlComponents = attachment.src.split('/');
                    urlComponents[urlComponents.length-1] = urlComponents[urlComponents.length-1].replace(/[+]/g, '%20');
                    attachment.src = '';
                    for (let i=0; i < urlComponents.length-1; i++) {
                      attachment.src += `${urlComponents[i]}/`;
                    }
                    attachment.src += urlComponents[urlComponents.length-1];
                  }
                });
              }
              vm.card.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Removed Attachment Successfully...").position('top right'));
              break;
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    /**
     * Remove cover image
     *
     * @param item
     */
    function addremoveCoverImage(item) {
      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          cardId: vm.card.id,
          attachmentId: item
        }
      } else {
        params = {
          cardId: vm.card.id,
          attachmentId: item
        }
      }
      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.addremovecoverimage, params, '', header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.progress = false;
              vm.card.activities = response.data.activities;
              break;
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    /**
     *  Scroll to attachment section
     */

    function gotoAttachment() {
      setTimeout(function () {
        ($document.find('.attachments').length > 0) && (scrollTo(
          $document.find('md-dialog').find('md-dialog-content'),
          $document.find('.attachments')
        ));
      }, 500);
    }

    /**
     * Add label chips
     *
     * @param query
     * @returns {filterFn}
     */
    function labelQuerySearch(query) {
      return query ? vm.labels.filter(createFilterForMember(query)) : [];
    }

    /**
     * Label filter
     *
     * @param label
     * @returns {boolean}
     */
    function filterLabel(label) {
      if (!vm.labelSearchText || vm.labelSearchText === '') {
        return true;
      }

      return angular.lowercase(label.name).indexOf(angular.lowercase(vm.labelSearchText)) >= 0;
    }

    /**
     * Add change item chips
     *
     * @param query
     * @returns {filterFn}
     */
    function changeItemsQuerySearch(query) {
      if (vm.isLatest) {
        vm.changeItemsLatest = _.filter(vm.changeItems, ['isLatest', 'true']);
      } else {
        vm.changeItemsLatest = vm.changeItems;
      }
      return query ? vm.changeItemsLatest.filter(createFilterFor(query)) : [];
    }

    /**
     * Filter change Items
     *
     * @param query
     * @returns {array} IDs
     */
    function changeItemsIDQuerySearch(query) {
      return query ? changeItemsQuerySearch(query).map(function (item) {
        return item.displayObjectId;
      }) : [];
    }

    function changeItemsIDQuerySearchStatus(chip) {
      return chip ? changeItemsQuerySearch(chip).map(function (item) {
        return item.status;
      }) : [];
    }

    function parseStrings(str1) {
      var str;
      if (vm.configurationSettings && str1.configName) {
        return str = '[ ' + str1.objectNumber + ' - Config.: ' + str1.configName + ' - Rev. ' + str1.revision + '.' + str1.minorRevision + ' ]' + '\xa0\xa0\xa0' + '[ ' + str1.status + ' ]' + '\xa0\xa0\xa0' + str1.objectName;
      } else {
        if (str1.objectNumber || str1.revision || str1.minorRevision || str1.status || str1.objectName) {
          return str = '[ ' + str1.objectNumber + ' - Rev. ' + str1.revision + '.' + str1.minorRevision + ' ]' + '\xa0\xa0\xa0' + '[ ' + str1.status + ' ]' + '\xa0\xa0\xa0' + str1.objectName;
        }
      }
    };

    /**
     * Change Items filter
     *
     * @param change item
     * @returns {boolean}
     */
    function filterChangeItem(changeItem) {
      if (!vm.changeItemSearchText || vm.changeItemSearchText === '') {
        return true;
      }
      return angular.lowercase(changeItem.displayObjectId).indexOf(angular.lowercase(vm.changeItemSearchText)) >= 0;
    }

    /**
     * Open new task dialog
     *
     * @param ev
     * @param task
     * @param {boolean} newTask
     */
    var tempId;

    function openTaskDialog(ev, task, newTask) {
      tempId = task.id;
      $('.card-dialog').css('display', 'none');
      vm.modalInstance = $mdDialog.show({
        controller: 'TaskDialogController',
        controllerAs: 'vm',
        preserveScope: true,
        templateUrl: 'app/main/apps/todo/dialogs/task/task-dialog.html',
        parent: angular.element($document.body),
        targetEvent: ev,
        multiple: true,
        clickOutsideToClose: true,
        locals: {
          Task: task,
          Tasks: vm.tasks,
          Tags: vm.tags,
          ChangeItems: vm.changeItems,
          Card: vm.card,
          event: ev,
          $parent: vm,
          newTask: newTask,
          callback: newTask ? vm.addTaskCallback : vm.getAllTask,
          Members: vm.members,
          isTemplate: vm.isTemplate,
          isConfigEnable: vm.configurationSettings
        }
      });
    }

    /**
     * call back method for add task
     *
     * @param task - new task
     * @param standardView {boolean}
     */
    function addTaskCallback(task, standardView, isTask) {
      if (vm.isTemplate) {
        vm.board.templatesCardList.getById(cardId).checklists[0].checkItems.push(tempId);
      } else {
        vm.board.cards.getById(cardId).checklists[0].checkItems.push(tempId);
      }

      getallTask(null, null, isTask);

      let listId = '';

      _.forEach(vm.board.lists, function (value) {
        _.forEach(value.idCards, function (val) {
          if (val === vm.card.id) {
            listId = value.id;
          }
        });
      });

      if (vm.sessionData.proxy === true) {
        params = {
          boardId: vm.board.id,
          listId: listId,
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          boardId: vm.board.id,
          listId: listId,
          customerId: vm.sessionData.userId
        }
      }

      data = {
        cardId: vm.card.id
      };
      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdatecard, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.card.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Details Updated Successfully...").position('top right'));
              break;
            case 1006:
              vm.card.name = vm.cardcopy.name;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
      /*if (standardView) {
       scroll();
       }*/
    }

    /**
     * call back method for edit task
     *
     * @param task
     * @param standardView {boolean}
     */
    function updateTaskCallback(task, standardView) {
      if (vm.isTemplate) {
        vm.openCardDialog(null, cardId, function () {
        }, task, Tags, standardView, '', '', vm.isTemplate);
      } else {
        vm.openCardDialog(null, cardId, function () {
        }, task, Tags, standardView);
      }
      scroll();
      /*if (standardView) {
       scroll();
       }*/
    }

    /**
     * Add label
     */
    function addNewLabel() {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }
      if (vm.newLabelName != '') {
        var boardPriority = [];
        boardPriority.push({
          name: vm.newLabelName,
          color: vm.newLabelColor
        });
        vm.newLabelName = '';
      }
      data = {
        boardId: vm.board.id,
        boardPriority: boardPriority
      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              var labels = [];
              if (response.data.boardPriority.length > 0) {
                angular.forEach(response.data.boardPriority, function (value, key) {
                  labels.push({
                    id: value.id,
                    name: value.name,
                    color: value.color
                  })
                });
              }
              vm.labels = labels;
              vm.newLabelName = '';
              BoardService.data.labels.push(labels[response.data.boardPriority.length - 1]);
              break;
            case 4006:
              break;
            case 1006:
              vm.newLabelName = '';
              vm.labels = vm.priority;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    /**
     * Update label
     */
    function updateLabel(id) {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }
      var boardPriority = [];

      if (id) {
        boardPriority.push({
          id: vm.board.labels.getById(vm.editLabelId).id,
          name: vm.board.labels.getById(vm.editLabelId).name,
          color: vm.board.labels.getById(vm.editLabelId).color
        });
      }

      data = {
        boardId: vm.board.id,
        boardPriority: boardPriority
      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              break;
            case 1006:
              vm.labels = vm.priority;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    /**
     * Remove label
     */
    function removePriority(priority) {

      var id;
      angular.forEach(priority, function (value) {

        angular.forEach(vm.cardcopy.idLabels, function (val) {
          if (value.id === val) {
            id = value.id;
          }
        });
      });
      if (vm.sessionData.proxy == true) {
        params = {
          cardId: vm.card.id,
          boardId: vm.board.id,
          priorityId: id,
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          cardId: vm.card.id,
          boardId: vm.board.id,
          priorityId: id,
          customerId: vm.sessionData.userId
        }
      }
      // vm.cardcopy.idLabels = [];

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.removecardpriority, params, '', header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.card.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Remove Priority Successfully...").position('top right'));
              break;
            case 4004:
              console.log(response.message);
              break;
            case 1006:
              vm.card.idLabels = vm.cardcopy.idLabels;
              vm.cardcopy = angular.copy(vm.card);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              console.log(response.message);
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
        });
    }

    function removeLabel(id) {

      if (vm.sessionData.proxy == true) {
        params = {
          boardId: vm.board.id,
          priorityId: id,
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          boardId: vm.board.id,
          priorityId: id,
          customerId: vm.sessionData.userId
        }
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.removepriority, params, '', header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.labels = response.data.labels;
              $mdToast.show($mdToast.simple().textContent("Remove Priority Successfully...").position('top right'));
              break;
            case 4004:
              console.log(response.message);
              break;
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
        });
      var arr = vm.board.labels;
      arr.splice(arr.indexOf(arr.getById(vm.editLabelId)), 1);

      angular.forEach(vm.board.cards, function (card) {
        if (card.idLabels && card.idLabels.indexOf(vm.editLabelId) > -1) {
          card.idLabels.splice(card.idLabels.indexOf(vm.editLabelId), 1);
        }
      });

      vm.newLabelName = '';
    }

    /**
     * Add member chips
     *
     * @param query
     * @returns {Array}
     */
    function memberQuerySearch(query) {
      return query ? vm.membersdd.filter(createFilterForMember(query)) : [];
    }

    /**
     * Add member chips
     *
     * @param query
     * @returns {Array}
     */
    function memberIdQuerySearch(query) {
      return query ? memberQuerySearch(query).map(function (member) {
        return member.id;
      }) : [];
    }

    /**
     * Member filter
     *
     * @param member
     * @returns {boolean}
     */
    function filterMember(member) {
      if (!vm.memberSearchText || vm.memberSearchText === '') {
        return true;
      }

      return angular.lowercase(member.name).indexOf(angular.lowercase(vm.memberSearchText)) >= 0;
    }

    /**
     * Update check list stats
     * @param list
     */
    function updateCheckedCount(taskId, completed) {
      vm.progressEmail = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          status: completed,
          taskId: taskId
        }
      } else {
        params = {
          status: completed,
          taskId: taskId
        }
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.completetask, params, '', header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              //For Progress Loader
              vm.progressEmail = false;
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              vm.card.activities = response.data.activities;
              getallTask(null, null, true);
              break;
            case 1006:
              //For Progress Loader
              vm.progressEmail = false;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              $timeout(function () {
                vm.tasks.getById(taskId).completed = !completed;
              }, 800)
              break;
            case 4006:
              //For Progress Loader
              vm.progressEmail = false;
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    /**
     * Add checklist item
     *
     * @param text
     * @param checkList
     */
    function addCheckItem(ev, text) {
      text = text || '';

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      }

      data = {
        cardId: cardId,
        taskTitle: text,
        taskType: "Approvals"
      };
      if (vm.isTemplate) {
        data.taskType = "Template";
        data.isTemplate = true;
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.createtask, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              var task = {
                'id': response.data.taskId,
                'idMembers': [],
                'title': response.data.taskTitle,
                'idChangeItems': [],
                'notes': response.data.notes,
                'startDate': response.data.startDate,
                'startDateTimeStamp': new Date().getTime(),
                'dueDate': response.data.dueDate,
                'dueDateTimeStamp': '',
                'completed': response.data.completed,
                'starred': response.data.starred,
                'important': response.data.important,
                'deleted': response.data.deleted,
                'tags': response.data.tags,
                'approvalTask': true,
                'idTags': [],
                'comments': response.data.comments,
                'activities': response.data.activities
              };
              vm.openTaskDialog(ev, task, true);
              break;
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4002:
              vm.selectedDuedate = '';
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4004:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    function updateTask(taskId, text) {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      }

      if (taskId) {
        data = {
          taskId: taskId,
          taskTitle: text,
          taskType: "Approval"
        };
      } else {
        data = {
          taskTitle: text,
          taskType: "Approval"
        };
      }
      if (vm.isTemplate) {
        data.taskType = "Template";
        data.isTemplate = true;
      }
      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.createtask, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:

              vm.card.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              vm.task.title = '';
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4002:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4004:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }


    /**
     * Remove checklist Item
     *
     * @param item
     */
    function removeChecklistItem(item, list) {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          taskId: item.id
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          taskId: item.id
        }
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.deletetask, params, '', header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              // below line remvoed
              // list.splice(list.indexOf(item), 1);

              // update scrum board ui
              // fix Added for issue id : #109
              list.splice(list.indexOf(item), 1);
              if (item.completed === true) {
                vm.completedTask--;
              }

              $mdToast.show($mdToast.simple().textContent("Task Removed Successfully...").position('top right'));
              vm.card.activities = response.data.activities;
              //For Progress Loader
              vm.progressEmail = false;
              break;
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4002:
              vm.selectedDuedate = '';
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        })
    }

    /**
     * Create checklist and Scroll to checklist section
     */
    function createCheckList() {
      vm.newCheckListTitle = "Approvals";
      (!((vm.card.checklists || []).length > 0)) && (vm.card.checklists.push({
        id: msUtils.guidGenerator(),
        name: vm.newCheckListTitle,
        checkItemsChecked: 0,
        checkItems: []
      }));
      scroll();
      vm.newCheckListTitle = '';
    }

    /**
     *
     */
    function scroll() {
      /**
       *  Scroll to checklist section , and focus on the checklist input box
       */
      setTimeout(function () {
        scrollTo(
          $document.find('md-dialog').find('md-dialog-content'),
          $document.find('.checklist')
        );
        $document.find('form[name="newCheckItemForm"] input[type="text"]').focus();
      }, 500);
    }

    /**
     * target - target element , source - source element
     * scroll to source element position
     * @param target
     * @param source
     */
    function scrollTo(target, source) {
      if ($(source).offset()) {
        var sourceElTop = Math.round($(source).offset().top || 0),
          targetElTop = Math.round($(target).offset().top || 0);
        $(target).animate({
          scrollTop: sourceElTop - targetElTop
        }, "slow");
      }
    }

    /* target to element having class .icon-grid  */
    function showBoardTypeAttributeList() {
      setTimeout(function () {
        scrollTo(
          $document.find('md-dialog').find('md-dialog-content'),
          $document.find('.icon-grid')
        );

      }, 500);
    }

    /**
     * Update attributeValue
     *
     */
    function updateAttribute() {

      var listId = "";
      angular.forEach(vm.board.lists, function (value, key) {
        angular.forEach(value.idCards, function (val, keys) {
          if (val === vm.card.id) {
            listId = value.id;
          }
        });
      });

      if (vm.sessionData.proxy == true) {
        params = {
          boardId: vm.board.id,
          listId: listId,
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          boardId: vm.board.id,
          listId: listId,
          customerId: vm.sessionData.userId
        }
      }

      data = {
        cardId: vm.card.id,
        additionalInfoList: vm.card.additionalInfo
      };
      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdatecard, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.card.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Details Updated Successfully...").position('top right'));
              break;
            case 1006:
              vm.card.name = vm.cardcopy.name;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }


    /**
     * Add new comment
     *
     * @param newCommentText
     */
    function addNewComment(newCommentText) {

      //For Progress Loader
      vm.progressEmail = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          cardId: vm.card.id
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          cardId: vm.card.id
        }
      }

      data = {
        message: newCommentText
      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.commentcard, params, data, header)
        .then(function (response) {

          //For Progress Loader
          vm.progressEmail = false;

          switch (response.code) {
            case 0:
              var idmember = '';
              angular.forEach(response.data.comments, function (value, key) {
                idmember = value.idMember
              });
              var newComment = {
                idMember: idmember,
                message: newCommentText,
                time: new Date()
              };
              vm.card.comments.unshift(newComment);
              vm.card.comments = response.data.comments;
              vm.card.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 4006:
              break;
            case 1006:
              //For Progress Loader
              vm.progressEmail = false;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    /**
     * Filter for chips
     *
     * @param query
     * @returns {filterFn}
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(item) {
        return angular.lowercase(item.displayObjectId).indexOf(lowercaseQuery) >= 0;
      };
    }

    /**
     * Filter for chips
     *
     * @param query
     * @returns {filterFn}
     */
    function createFilterForMember(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(item) {
        return angular.lowercase(item.name).indexOf(lowercaseQuery) >= 0;
      };
    }

    /**
     * Change card's view
     */
    function changeView(Name) {
      vm.showView = !vm.showView;
      vm.progressEmail = true;
      //if(vm.cardTypes.getById(vm.card.cardTypeId).name === 'CR'){
      if (Name === 'CR') {
        if (vm.card.modificationsTab) {
          $scope.IntroOptionsCard.steps = introService.getIntroObj("cards");
          $timeout(function () {
            $('md-tab-item').map(function (index, elem) {
              if (index >= 4 && index <= 5) {
                elem.setAttribute("id", 'step3' + index);
              }
            });
          });
        } else {
          $scope.IntroOptionsCard.steps = introService.getIntroObj("cardsEC");
          $timeout(function () {
            $('md-tab-item').map(function (index, elem) {
              if (index == 4) {
                elem.setAttribute("id", 'step3' + index);
              }
            });
          });
        }
        $(".card-dialog").toggleClass("view-changed");
        vm.progressEmail = false;
        vm.whereUsed.resolutionTasks = [];
        vm.productsWhereModi.resolutionTasks = [];
        getAllFuseObjectRevModi();
      } else if (Name === 'CO') {
        $(".card-dialog").toggleClass("toggle-eco-view");
      }
    }

    /**
     * Change cardDialog's class
     */
    function cardDialogClass() {
      if (vm.showView) {
        var cardType = 'CR';
        if (cardType === 'CR') {
          return "view-changed"
        }
        if (cardType === 'CO') {
          return "toggle-eco-view"
        }
      }
      return "";
    }

    /**
     * Toggle completed
     *
     * @param task
     */
    function toggleCompleted(task) {
      task.completed = !task.completed;
      var a = task.completed ? 1 : -1;

      angular.forEach(task.idChangeItems, function (id) {
        vm.changeItems.getById(id).completed += a;
      });

    }

    var formData = {};

    function fileAdded(file) {

      // Prepare the temp file data for media list

      var uploadingFile = {
        id: file.uniqueIdentifier,
        file: file,
        type: 'uploading'
      };
    }

    /**
     * Upload
     * Automatically triggers when files added to the uploader
     */
    function upload(files) {
      vm.progress = true;
      // Set headers
      vm.ngFlow.flow.opts.headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'authId': vm.sessionData.authId,
        'channel_name': vm.sessionData.channel_name,
        'proxy': vm.sessionData.proxy
      };

      vm.ngFlow.flow.upload();
    }

    /**
     * File upload success callback
     * Triggers when single upload completed
     *
     * @param file
     * @param message
     */
    function fileSuccess(file, message) {
      var response = JSON.parse(message);
      if (response.code == 0) {
        vm.arrayOfAttachmentFiles.push(response);
      } else {
        vm.progress = false;
        $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
      }
    }

    vm.uploadComplete = uploadComplete;
    vm.attachementApiCall = attachementApiCall;

    vm.fileUploadCounter = 0;

    function uploadComplete() {
      vm.totalfilesCount = vm.arrayOfAttachmentFiles.length || [];
      vm.attachementApiCall(vm.fileUploadCounter);
    }

    function attachementApiCall(index) {
      var file = vm.arrayOfAttachmentFiles[index];
      if (file) {
        addremoveAttachment(file).then(function (res) {
          if (res) {
            vm.fileUploadCounter += 1;
            if (vm.fileUploadCounter < vm.arrayOfAttachmentFiles.length) {
              vm.attachementApiCall(vm.fileUploadCounter);
            } else if (vm.fileUploadCounter === vm.arrayOfAttachmentFiles.length) {
              vm.fileUploadCounter = 0;
              vm.arrayOfAttachmentFiles = [];
            }
          }
        });
      }
    }

    function addremoveAttachment(response) {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          cardId: vm.card.id
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          cardId: vm.card.id
        }
      }

      var ext = response.data.fileName.substr(response.data.fileName.lastIndexOf('.') + 1);

      if (ext == 'jpg' || ext == 'jpeg' || ext == 'png') {
        data = {
          name: response.data.fileName,
          src: response.data.imagePath,
          type: "image"
        };
      } else {
        data = {
          name: response.data.fileName,
          src: response.data.imagePath,
          type: "link"
        };
      }

      return ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.addremovecardattachment, params, data, header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              //For Progress Loader
              vm.progress = false;
              vm.card.attachments = response.data.attachmentsList;
              if (vm.card.attachments.length > 0) {
                _.forEach(vm.card.attachments, attachment => {
                  if (attachment.src.indexOf('aws') !== -1) {
                    const urlComponents = attachment.src.split('/');
                    urlComponents[urlComponents.length-1] = urlComponents[urlComponents.length-1].replace(/[+]/g, '%20');
                    attachment.src = '';
                    for (let i=0; i < urlComponents.length-1; i++) {
                      attachment.src += `${urlComponents[i]}/`;
                    }
                    attachment.src += urlComponents[urlComponents.length-1];
                  }
                });
              }
              vm.card.activities = response.data.activities;
              vm.ngFlow.flow.files = [];
              break;
            case 1006:
              console.log(response.message);
              vm.progress = false;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
          return response;
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
          return response;
        });
    }

    function OpenLinkFunction(url) {

      if (!url.match(/^https?:\/\//i)) {
        url = 'http://' + url;
        window.open(url, '_blank');
      } else {
        window.open(url, '_blank');
      }
    }

    /**
     * Get Randaom value from array
     * @returns {*}
     */
    Array.prototype.randomElement = function () {
      return this[Math.floor(Math.random() * this.length)]
    };

    if (vm.card.due) {
      vm.selectedDuedate = vm.formatDate(vm.card.due);
    }
    /**
     * handle due date change
     */
    $scope.$watch(
      "vm.selectedDuedate",
      function handleDueDateChange(newValue, oldValue) {
        if (newValue) {
          vm.card.due = vm.card.due && vm.card.due.getDay() ? new Date(moment(vm.card.due).format('YYYY/MM/DD h:mm:ss')) : null;
        } else {
          vm.card.due = null;
        }
      }
    );

    /**
     * get change items by id
     * @param changeItemId
     * @returns {*}
     */
    function getChangeItemById(changeItemId) {

      var i = vm.resolutionTasks.filter(function (c) {
        if (c.objectId === changeItemId)
          return c;
      });

      if ((i || []).length > 0) {
        return i[0];
      }

      var j = vm.assemblyChanges.filter(function (c) {
        if (c.objectId === changeItemId)
          return c;
      });

      if ((j || []).length > 0) {
        return j[0];
      }

      return null;

    }


    /**
     *
     * find by property
     * @param o
     * @param prop
     * @param val
     * @param retprop
     * @returns {*}
     */
    Array.prototype.findByProperty = function (proptery, value, ignoreCase) {
      var self = this,
        empty = {};
      self = self || [];
      if (self.length === 0) return empty;
      for (var index = 0; index < self.length; index++) {
        var o = self[index];
        if (o.hasOwnProperty(proptery)) {
          if (o[proptery] === (ignoreCase ? value.toLowerCase() : value)) {
            return o;
          }
        }
      }
      return empty;
    };
    $scope.$watchCollection(angular.bind(vm, function () {
      return vm.modifications;
    }), function (newVal) {
    });

    function resetDueDate() {
      setTimeout(function () {
        vm.selectedDuedate = null;
      }, 300);
    }

    function goToDetails(chip, event) {
      if (event.button === 2) {
        return;
      }
      goToObjectDetails(chip.id || chip.objectId);
    }

    function goToObjectDetails(id) {
      var url;
      if (id.indexOf('products') !== -1) {
        url = $state.href('app.objects.products.details.basicInfo', {id: id});
      } else if (id.indexOf('parts') !== -1) {
        url = $state.href('app.objects.part.parts.basicInfo', {id: id});
      } else {
        url = $state.href('app.objects.documents.details.basicInfo', {id: id});
      }
      window.open(url, '_blank');
    }
  }
})();
