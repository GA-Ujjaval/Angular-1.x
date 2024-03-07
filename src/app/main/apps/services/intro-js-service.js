(function () {
    'use strict';

    angular
        .module('app.customer')
        .service('introService', introService);

    /** @ngInject */
    function introService($q, $http) {
        var intro = {
            dashboardTasksHint: [
                {
                    element: '#step1',
                    intro: '<h2><span style="color: #33cccc;">Dashboard&nbsp;Tasks</span></h2><p>The Dashboard Tasks presents an overview of:</p><ul><li><strong>Due Tasks</strong> - Shows number of tasks where due date is set for Today/Next 3 days/Next 7 days based on your selection</li><li><strong>Overdue tasks</strong> - Shows number of tasks where due date was set for yesterday AND earlier</li><li>Clicking on the tile will take you to filtered view of&nbsp;tasks</li></ul>',
                    position: 'bottom'
                }
            ],
            dashboardCardsHint: [
                {
                    element: '#step2',
                    intro: '<h2><span style="color: #33cccc;">Dashboard&nbsp;Cards</span></h2><ul><li>Cards across all boards assigned to you, that are still open listed by priority</li><li>Clicking on colored bar chart will take you to filtered view of cards</li></ul>',
                    position: 'bottom'
                }
            ],
            impactVisualizerHint: [
                {
                    element: '#step66',
                    intro: '<h2><span style="color: #33cccc;">Impact Visualizer</span></h2><p>Clicking on this icon <md-icon md-font-icon="icon-impact-visualizer" class="s18 md-font material-icons icon-impact-visualizer"></md-icon>&nbsp;will display the <strong>Where-Used</strong> and <strong>Modifications</strong> information for this card.</p><p>Clicking on this again will bring you back to the default view of this card.&nbsp;</p>',
                    position: 'left',
                    tooltipClass: 'introjs-tooltip-width'
                }
            ],
            settings: [
                {
                    element: '#step0',
                    intro: '<h2><span style="color: #33cccc;">Create Member</span></h2><p>Add a member using the &lsquo;Add Member&rsquo; button. The member will be able to login using his/her Email address. Edit an existing user&rsquo;s details by clicking on the &lsquo;Edit&rsquo; icon and allows the Admin to edit the First Name, Last Name and role of the member. A member can be assigned one or more of the following roles:</p><ul><li><p>Customer Admin [can do everything (including system configuration edits]</p></li><li><p>Release Coordinator [can read/create/modify/copy/promote/demote cards and read/create/modify/copy/delete tasks]</p></li><li><p>Project Manager [can read/create/modify/copy/promote/demote cards and read/create/modify/copy/delete tasks]</p></li><li><p>Project Engineer [can read/create/copy cards and read/create/modify/copy/delete only his/her own tasks]</p></li><li><p>Read Only [can only read cards and tasks]</p></li></ul><p>The &lsquo;Member Role&rsquo; drop down is activated only if he/she is not selected as a &lsquo;Customer Admin&rsquo;</p><p><strong>Note:</strong> Once the member is created, he/she will receive an email with a link to set their password. The Email address is used as the username for login purposes.</p>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step1',
                    intro: '<h2><span style="color: #33cccc;">Categories &amp; Attributes</span></h2><p>In this section, Admin can create Object (includes Parts and Products) categories and custom attributes.</p><p><strong>Categories:&nbsp;</strong></p><ul><li>Parts and Products can be classified into groupings called &lsquo;Categories&rsquo;.</li><li>Categories can have any level of sub-categories.</li><li>All Product Categories have Bill-of-Materials enabled by default. This can be enabled/disabled for Part Categories at any time.</li></ul><p><strong>Custom Attributes:</strong></p><ul><li>Custom attributes (or fields or characteristics) can be created for part categories as well as product categories.</li><li>Custom attributes can either be on type text OR link.</li><li>Admin has the option to create a custom attribute for all categories under the selected object type or not.</li></ul>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step2',
                    intro: '<h2><span style="color: #33cccc;">Security</span></h2><p><strong>Proxy Setting:</strong></p><ul><li>Enabling this setting, allows the FusePLM company to access your database. Disabling this setting, prevents the FusePLM company, access to your database.</li><li>This setting can be changed at any point in time. The only reason for this setting is to allow FusePLM support team access to your database, in case a need arises during troubleshooting.</li><li>As a general practice to keep your database secure, you must Disable this setting.&nbsp;</li></ul>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                }
            ],
            objectsImport: [
                {
                    element: '#step1',
                    intro: '<h2><span style="color: #33cccc;">IMPORT Parts/Products/Bill-Of-Material</span></h2><p>It allows you to import Products, Parts and Bill-of-Materials from XLS, XLSX&nbsp;or CSV&nbsp;file formats.When importing BOMs, it automatically creates parts in FusePLM as well.<br /><br /><strong>Note:</strong>&nbsp;Reuse existing mapping configurations (OPTIONAL) using the drop down</p><p style="padding-left: 30px;"><iframe src="//www.youtube.com/embed/qKHoSNy9RaY" width="250" height="125" allowfullscreen="allowfullscreen"></iframe></p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step2',
                    intro: '<h2><span style="color: #33cccc;">Attribute Mapping</span></h2><p><strong>Set Matching criteria to prevent importing duplicates (OPTIONAL):</strong> It lets you select upto to Excel column names and the corresponding FusePLM attributes, to:</p><ul><li>Identify duplicated line items within the Excel spreadsheet (only one will be loaded) AND</li><li>check if the spreadsheet line item matches with a FusePLM record (in which case it will skip importing this part)</li></ul><p><strong>Map FusePLM attributes with Excel column names</strong>.</p><ul><li>FusePLM tries to auto-map the attributes as much as it can. This can be a big time saver.</li><li>You can also manually select the column name as desired.</li><li>The &lsquo;Part Name&rsquo; attribute is a required field, so make sure you map it to move ahead.</li></ul><p style="padding-left: 30px;">&nbsp;</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step3',
                    intro: '<h2><span style="color: #33cccc;">Pre-Import Summary</span></h2><ul><li>Displays a pre-import summary of what records will pass and fail the import process and why.</li><li>You can also optionally, save the Import process steps to a mapping configuration for reuse later.</li><li><strong>Note:</strong> There is&nbsp;no import&nbsp;done at this step, clicking Next will procced with&nbsp;the data import</li></ul><p style="padding-left: 30px;">&nbsp;</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step4',
                    intro: '<h2><span style="color: #33cccc;">Import Summary</span></h2><ul><li>Displays the import summary.</li><li>Click &lsquo;Done&rsquo; to complete process and Exit.</li></ul>',
                    position:'left'
                }
            ],
            objectsParts: [
                {
                    element: '#step1',
                    intro: '<h2><span style="color: #33cccc;">Object&nbsp;Header</span></h2><p>This displays:</p><ul><li>Object Number, Revision (Status)</li><li>Object Name</li><li>Category</li></ul>',
                    position:'bottom'
                },
                {
                    element: '#step2',
                    intro: '<h2><span style="color: #33cccc;">Change Status</span></h2><p>Objects can have one of 3 statuses &ndash; In Development, Released, Obsolete. The typical order of status in a product&rsquo;s lifecycle is In Development &gt; Released &gt; Obsolete. By default, when a product is created, it&rsquo;s status is set as &lsquo;In Development&rsquo;.</p><p>There are 2 ways to modify the status of an object:</p><ul><li><strong>Manually using this button:&nbsp;</strong>The status can be manually modified using the drop-down list.</li></ul><ul><li><strong>Automatically using the boards workflow:&nbsp;</strong>When an object is attached as an &lsquo;affected object&rsquo; to a card (inside a board), the Status of the object can be automatically set to &lsquo;Released&rsquo;, by dragging this card to a list that has <md-icon md-font-icon="icon-thumb-up" class="s18  md-font material-icons icon-thumb-up"></md-icon> icon in the list header:</li></ul>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step3',
                    intro: '<h2><span style="color: #33cccc;">Increment Revision&nbsp;</span></h2><p>Objects can be revisioned by clicking this button. Objects can be revisioned only if they&rsquo;re in <strong>&lsquo;Released&rsquo;</strong>&nbsp;or&nbsp;<strong>&lsquo;Obsolete&rsquo;&nbsp;</strong>Status.</p>',
                    position:'bottom'
                },
                {
                    element: '#step4',
                    intro: '<h2><span style="color: #33cccc;">Import Bill-Of-Material</span></h2><p>Allows you to import Bill-of-Material in XLS, XLSX and CSV formats. If objects already exist in the Bill-of-Material, they will be replaced with the Imported Bill-of-Material objects.</p><p>Objects in the Imported BOM that do not exist in FusePLM, will be created during this process.</p><p>NOTE: This button will always appear for all Products. It will appear for only those parts whose category has the setting Bill-of-Material enabled.</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step10',
                    intro: '<h2><span style="color: #33cccc;">Basic Info</span></h2><p>This tab contains basic attribute list for objects. The &lsquo;Associated Cards&rsquo; section lists all the cards where the object has been attached, as an &lsquo;Affected Object&rsquo;.</p><p>The Object History section lists the creation and modification history (created by, Created Date, Modified by, Modified Date).</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step11',
                    intro: '<h2><span style="color: #33cccc;">Additional&nbsp;Info</span></h2><p>Lists all the custom attributes that were added by the Admin.</p>',
                    position:'bottom'
                },
                {
                    element: '#step12',
                    intro: '<h2><span style="color: #33cccc;">Attachments</span></h2><p>Drag and drop one or more files to the object.</p><p> There is no limit on the number of attachments users can attach to any given object.</p>',
                    position:'bottom'
                },
                {
                    element: '#step13',
                    intro: '<h2><span style="color: #33cccc;">Sourcing</span></h2><p>FusePLM allows companies to specify the Manufacturer and Supplier information for any given part.</p><p> Companies can associate single Part number to multiple Manufacturer Part Numbers and Supplier Part Numbers.</p>',
                    position:'bottom'
                },
                {
                    element: '#step14',
                    intro: '<h2><span style="color: #33cccc;">Bill Of Materials</span></h2><p>You can view/add/edit Objects&nbsp;to the Bill-Of-Material (BOM) structure.</p><p>You can add Objects to the BOM in two ways:</p><ul><li>Manually one by one. Allows adding Multi-Level objects.</li><li>Importing them from XLS, XLSX and CSV files. Currently only allows Single level objects.</li></ul><p>BOMs are presented in two ways:</p><ul><li>Hierarchical - Multi-Level BOM view. There is&nbsp;no&nbsp;restriction on&nbsp;the number of levels.</li><li>Sourcing - Multi-Level BOM view with Manufacturer and Supplier information of Objects.</li></ul><p>NOTE: This tab will always appear for all Products. It will appear for only those parts whose category has the setting Bill-of-Material enabled.</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step15',
                    intro: '<h2><span style="color: #33cccc;">Where-Used</span></h2><p>This tab lists all the objects where the particular object has been referenced. </p><p>This information is particularly useful, to see where a particular object has been used, prior to making changes to it.</p>',
                    position:'bottom'
                },
                {
                    element: '#step16',
                    intro: '<h2><span style="color: #33cccc;">Timeline</span></h2><p>This shows the history of all actions performed for this Object.</p>',
                    position:'bottom'
                },
                {
                    element: '#step17',
                    intro: '<h2><span style="color: #33cccc;">Comments</span></h2><p>Users can collaborate by adding comments in this section.</p>',
                    position:'bottom'
                }
            ],
            objectsPartsBOM: [
                {
                    element: '#step1',
                    intro: '<h2><span style="color: #33cccc;">Object&nbsp;Header</span></h2><p>This displays:</p><ul><li>Object Number, Revision (Status)</li><li>Object Name</li><li>Category</li></ul>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step2',
                    intro: '<h2><span style="color: #33cccc;">Change Status</span></h2><p>Objects can have one of 3 statuses &ndash; In Development, Released, Obsolete. The typical order of status in a product&rsquo;s lifecycle is In Development &gt; Released &gt; Obsolete. By default, when a product is created, it&rsquo;s status is set as &lsquo;In Development&rsquo;.</p><p>There are 2 ways to modify the status of an object:</p><ul><li><strong>Manually using this button:&nbsp;</strong>The status can be manually modified using the drop-down list.</li></ul><ul><li><strong>Automatically using the boards workflow:&nbsp;</strong>When an object is attached as an &lsquo;affected object&rsquo; to a card (inside a board), the Status of the object can be automatically set to &lsquo;Released&rsquo;, by dragging this card to a list that has <md-icon md-font-icon="icon-thumb-up" class="s18  md-font material-icons icon-thumb-up"></md-icon> icon in the list header:</li></ul>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step3',
                    intro: '<h2><span style="color: #33cccc;">Increment Revision&nbsp;</span></h2><p>Objects can be revisioned by clicking this button. Objects can be revisioned only if they&rsquo;re in<strong>&lsquo;Released&rsquo;</strong>&nbsp;or&nbsp;<strong>&lsquo;Obsolete&rsquo;&nbsp;</strong>Status.</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step10',
                    intro: '<h2><span style="color: #33cccc;">Basic Info</span></h2><p>This tab contains basic attribute list for objects. The &lsquo;Associated Cards&rsquo; section lists all the cards where the object has been attached, as an &lsquo;Affected Object&rsquo;.</p><p>The Object History section lists the creation and modification history (created by, Created Date, Modified by, Modified Date).</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step11',
                    intro: '<h2><span style="color: #33cccc;">Additional&nbsp;Info</span></h2><p>Lists all the custom attributes that were added by the Admin.</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step12',
                    intro: '<h2><span style="color: #33cccc;">Attachments</span></h2><p>Drag and drop one or more files to the object. There is no limit on the number of attachments users can attach to any given object.</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step13',
                    intro: '<h2><span style="color: #33cccc;">Sourcing</span></h2><p>FusePLM allows companies to specify the Manufacturer and Supplier information for any given part. Companies can associate single Part number to multiple Manufacturer Part Numbers and Supplier Part Numbers.</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step14',
                    intro: '<h2><span style="color: #33cccc;">Where-Used</span></h2><p>This tab lists all the objects where the particular object has been referenced. This information is particularly useful, to see where a particular object has been used, prior to making changes to it.</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step15',
                    intro: 'Timeline',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step16',
                    intro: 'Comments',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                }
            ],
            scrumboard: [
                {
                    element: '#step1',
                    intro: '<h2><span style="color: #33cccc;">Modify Board </span></h2><p>Click to modify Board Name. Boards can be renamed at any time.</p><p>Use &lsquo;Filter Cards&rsquo; icon <md-icon md-font-icon="icon-filter-variant" class="s18  md-font material-icons icon-filter-variant"></md-icon>&nbsp;to filter the cards in the board based on:</p><ul><li>Card Name</li><li>Priority</li><li>Co-ordinator assigned to the card</li></ul><p>The filter criteria is cumulative. To reset filters, click on the Filter button again.</p><p>&nbsp;</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step2',
                    intro: '<h2><span style="color: #33cccc;">Lists</span></h2><p>The various states of a card within a workflow are represented as &lsquo;Lists&rsquo;.</p><p>Click to create List or modify List name for the board. Lists can be renamed at any time.</p><p>For eg: if an issue has 3 potential states viz. &lsquo;submitted&rsquo;, &lsquo;rejected&rsquo;, &lsquo;completed&rsquo; there will be 3 lists, one for each state.</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step3',
                    intro: '<h2><span style="color: #33cccc;">List Settings</span></h2><p>Behavior of lists can be controlled using list-level settings. Once the list is created, the following settings can be accessed by clicking on <md-icon md-font-icon="icon-dots-vertical" class="s18  md-font material-icons icon-dots-vertical"></md-icon></p><ul><li><strong>Remove List</strong> &ndash; Removes a list and all of it&rsquo;s cards.</li><li><strong>Lock List</strong> &ndash; When a list is locked (this setting is enabled), user cannot promote/demote cards from that list to another list. When enabled, <md-icon md-font-icon="icon-lock-outline" class="s18  md-font material-icons icon-lock-outline"></md-icon> icon appears in the list header as shown below. Enabling this setting, also allows the user to access another list-level setting:<ul><li><strong>Release Objects </strong>&ndash; When enabled; if a card is dropped into this list, all of it&rsquo;s affected objects&rsquo; will have their &lsquo;status&rsquo; automatically set to &lsquo;Released&rsquo;. When enabled, <md-icon md-font-icon="icon-thumb-up" class="s18  md-font material-icons icon-thumb-up"></md-icon> icon appears in the list header. This setting allows companies to follow a workflow-driven Release process.</li></ul></li><li><strong>Approvals Mandatory </strong>&ndash; When this option is enabled (checked), user can only promote/demote card TO this list, provided all the approvals in the checklist are marked as complete. When enabled, <img src="http://app.fuseplm.com/assets/images/scrumboard/approvals-mandatory.png" alt="" width="20" height="20" /> icon appears in the list header.</li></ul>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step4',
                    intro: '<h2><span style="color: #33cccc;">Board Settings</span></h2><p>Once you assign a name to your board, click here to access the following Board Settings (only visible to users with Admin Roles)</p><ol><li>Board Color</li><li>Card Cover Images</li><li>Priority</li><li>Assign Roles</li><li>Impact Visualizer</li></ol>',
                    position:'left',
                    tooltipClass: 'introjs-tooltip-width'
                }
            ],
            userScrumboard: [
                {
                    element: '#step1',
                    intro: '<h1><span style="color: #33cccc;">Board</span></h1><p>This board represents&nbsp;a workflow.</p><p>Use &lsquo;Filter Cards&rsquo; icon <md-icon md-font-icon="icon-filter-variant" class="s18  md-font material-icons icon-filter-variant"></md-icon>&nbsp;to filter the cards in the board based on:</p><ul><li>Card Name</li><li>Priority</li><li>Co-ordinator assigned to the card</li></ul><p>The filter criteria is cumulative. To reset filters, click on the Filter button again.</p><p>&nbsp;</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '.step5',
                    intro: '<h1><span style="color: #33cccc;">Cards and Lists</span></h1><p>The workflow interface is inspired by the Kanban style of project management that employs sticky note-type cards that can be dragged and dropped into different containers to change their state.</p><p><strong>Cards: </strong>An issue is represented within a board as a card. In other words, to create a new issue, you create a new card.<br><strong>Lists:</strong> The various states within a workflow are represented as &lsquo;Lists&rsquo;<br>List settings (as setup by the admin) appear as the following icons on the List header</p><p style="padding-left: 30px;"><md-icon md-font-icon="icon-lock-outline" class="s18  md-font material-icons icon-lock-outline"></md-icon><strong>&nbsp;Lock List</strong> List is locked, cannot promote/demote cards from that list to another list.</p><p style="padding-left: 30px;"><strong><md-icon md-font-icon="icon-thumb-up" class="s18  md-font material-icons icon-thumb-up"></md-icon>&nbsp;Release Objects </strong>if a card is dropped into this list, all of it&rsquo;s affected objects&rsquo; will have their &lsquo;status&rsquo; automatically set to &lsquo;Released&rsquo;. This allows a workflow-driven Release process.</p><p style="padding-left: 30px;"><strong><img src="http://app.fuseplm.com/assets/images/scrumboard/approvals-mandatory.png" alt="" width="20" height="20" />&nbsp;Approvals Mandatory </strong>&ndash; When this option is enabled (checked), user can only promote/demote card TO this list, provided all the approvals in the checklist are marked as complete. When enabled, &nbsp;icon appears in the list header.</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                }
            ],
            addNewBoard: [
                {
                    element: '#step1',
                    intro: '<h2><span style="color: #33cccc;">New Board</span></h2><p> Click to add a Name for Board or click to modify Board Name. Boards can be renamed at any time.</p>',
                    position:'bottom'
                },
                {
                    element: '#step26',
                    intro: '<h2><span style="color: #33cccc;">Lists</span></h2><p>The various states of a card within a workflow are represented as &lsquo;Lists&rsquo;.</p><p>Click to create List or modify List name for the board. Lists can be renamed at any time.</p><p>For eg: if an issue has 3 potential states viz. &lsquo;submitted&rsquo;, &lsquo;rejected&rsquo;, &lsquo;completed&rsquo; there will be 3 lists, one for each state.</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    intro: '<h2><span style="color: #33cccc;">List Settings</span></h2><p>Behavior of lists can be controlled using list-level settings. Once the list is created, the following settings can be accessed by clicking on <md-icon md-font-icon="icon-dots-vertical" class="s18  md-font material-icons icon-dots-vertical"></md-icon></p><ul><li><strong>Remove List</strong> &ndash; Removes a list and all of it&rsquo;s cards.</li><li><strong>Lock List</strong> &ndash; When a list is locked (this setting is enabled), user cannot promote/demote cards from that list to another list. When enabled, <md-icon md-font-icon="icon-lock-outline" class="s18  md-font material-icons icon-lock-outline"></md-icon> icon appears in the list header as shown below. Enabling this setting, also allows the user to access another list-level setting:<ul><li><strong>Release Objects </strong>&ndash; When enabled; if a card is dropped into this list, all of it&rsquo;s affected objects&rsquo; will have their &lsquo;status&rsquo; automatically set to &lsquo;Released&rsquo;. When enabled, <md-icon md-font-icon="icon-thumb-up" class="s18  md-font material-icons icon-thumb-up"></md-icon> icon appears in the list header. This setting allows companies to follow a workflow-driven Release process.</li></ul></li><li><strong>Approvals Mandatory </strong>&ndash; When this option is enabled (checked), user can only promote/demote card TO this list, provided all the approvals in the checklist are marked as complete. When enabled, <img src="http://app.fuseplm.com/assets/images/scrumboard/approvals-mandatory.png" alt="" width="20" height="20" /> icon appears in the list header.</li></ul>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step4',
                    intro: '<h2><span style="color: #33cccc;">Board Settings</span></h2><p>Once you assign a name to your board, click here to access the following Board Settings (only visible to users with Admin Roles)</p><ol><li>Board Color</li><li>Card Cover Images</li><li>Priority</li><li>Assign Roles</li><li>Impact Visualizer</li></ol>',
                    position:'left',
                    tooltipClass: 'introjs-tooltip-width'
                }
            ],
            cards: [
                {
                    element: '#step34',
                    intro: '<h2><span style="color: #33cccc;">Where Used</span></h2><p>This section is to show&nbsp;the where used&nbsp;affected object for all the associated objects of this card.</p>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step10',
                    intro: '<h2><span style="color: #33cccc;">Affected Objects</span></h2><p>This section lists&nbsp;all the associated objects of this card.<br />Clicking on each object will filter its corresponding Where Used objects on the right</p>',
                    position:'top',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step11',
                    intro: '<h2><span style="color: #33cccc;">Where Used Affected Objects</span></h2><p>This section lists the whereused objects for associated objects of this card</br>Clicking on each associated object on the left will filter its corresponding Where Used objects&nbsp;here.</p>',
                    position:'top',
                    tooltipClass: 'introjs-tooltip-width'
                }
            ],
            cardsEC: [
                {
                    element: '#step34',
                    intro: 'Header1',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step10',
                    intro: 'Affected Objects',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step11',
                    intro: 'WHERE USED',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                }
            ],
            cardsBar: [
                {
                    element: '#step9',
                    intro: 'explain about the numbers in the header bubble',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                }
            ],
            cardsModification: [
                {
                    element: '#step35',
                    intro: '<h2><span style="color: #33cccc;">Modifications</span></h2><p>This section gives a visual representation of the differences between the current revision and last revision of the &lsquo;Affected Objects&rsquo;.</p><p>The Affected object (on the left) can have one of the following color bars below, indicating the nature of difference between it&rsquo;s current and last revision:</p><ul><li> <button type="button" style="background: #2196f3; color: white; padding: 8px 15px; margin: 2px;">Initial Release</button> &ndash; means that the affected object just has one revision.</li><li><button type="button" style="background: #2196f3; color: white; padding: 8px 15px; margin: 2px;">Revision Change</button> &ndash; means that the affected object had a change in revision, but no change to it&rsquo;s Bill-of-Material structure.</li><li>Bill-of-Material structure change &ndash; means that the Bill-of-Material structure changed between the current and last revision for the Affected Object.<ul><li>Green bar &ndash; x part numbers were added</li><li>Red bar &ndash; y part numbers were removed</li><li>Yellow bar &ndash; Quantity of Reference Designators changed for z part numbers in the Bill-of-Materials</li></ul></li></ul>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step13',
                    intro: '<h2><span style="color: #33cccc;">Affected Objects</span></h2><p>This section lists&nbsp;all the associated objects of this card.<br />Clicking on each object will filter its corresponding modifications&nbsp;on the right.</p>',
                    position:'top',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step14',
                    intro: '<h2><span style="color: #33cccc;">Modifications of Affected Objects</span></h2><p>This section lists gives a visual representation of the differences between the current revision and last revision of all the associated objects of this card.<br />Clicking on each associated object on the left will filter its corresponding modifications&nbsp;here.</p>',
                    position:'top',
                    tooltipClass: 'introjs-tooltip-width'
                }
            ],
            boards: [
                {
                    element: '#step3',
                    intro: ' <h2><span style="color: #33cccc;">Add New Board</span></h2><p>Click here to create a new board (or workflow)</p>',
                    position:'left'
                }
            ],
            search:[
                {
                    element: '#step1',
                    intro: '<h2><span style="color: #33cccc;">Global Search</span></h2><p>The following data is searched for in each entity:</p><ul><li>Parts &ndash; Part Number, Revision, Category, Product Name, Status</li><li>Products - Product Number, Revision, Category, Product Name, Status</li><li>Tasks &ndash; Task Title</li><li>Cards &ndash; Card Title</li></ul>',
                    position:'bottom',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step2',
                    intro: '<h2><span style="color: #33cccc;">Global Search</span></h2><p>To specifically search across one of more of the following entities, select the desired option(s):</p><ul><li>All</li><li>Parts</li><li>Products</li><li>Cards</li><li>Tasks</li></ul>',
                    position:'bottom'
                }
            ],
            scrumboardSetting:[
                {
                    element: '#step5',
                    intro: '<h2><span style="color: #33cccc;">Board Color</span></h2><p>You can select the color scheme for a board here.</p>',
                    position:'left',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step16',
                    intro: '<h2><span style="color: #33cccc;">Cover Image</span></h2><p>When this setting is enabled, you can set a cover image for any card in the board, using the steps below:</p><ul><li>Open a card and use the &lsquo;attachments&rsquo; section to drag and drop an image file (png, jpg format) to the card.</li><li>Click the &lsquo;Actions&rsquo; button.</li><li>Use the drop down option, &lsquo;Make Cover&rsquo;.</li><li>This should now set the file as the cover image for this card.</li></ul>',
                    position:'left',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step7',
                    intro: '<h2><span style="color: #33cccc;">Priority</span></h2><p>You can assign a priority label for the cards here. Change the color and label of the priority as needed.</p>',
                    position:'left',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step8',
                    intro: '<h2><span style="color: #33cccc;">Assign Roles</span></h2><p>User Roles can be added or deleted from a particular board. To add a role, select from the &lsquo;Member Roles&rsquo; drop down list and click Add. Roles can only be added to a board one-by-one.</p><p>To remove a role from a board, click on the &lsquo;trash bin&rsquo; icon next to the role.</p><p>By default, every board is assigned to all Roles (Customer Admin, Project Manager, Release Coordinator, Project Engineer and Read-Only)</p>',
                    position:'left',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step9',
                    intro: '<h2><span style="color: #33cccc;">Impact Visualizer</span></h2><p>This setting controls the visibility of the &lsquo;Where-Used&rsquo; and &lsquo;Track Rev Modifications&rsquo; tabs in the &lsquo;Impact Visualizer&rsquo; section of any card.</p>',
                    position:'left',
                    tooltipClass: 'introjs-tooltip-width'
                }
            ],
            todo:[
                {
                    element: '#step1',
                    intro: '<h2><span style="color: #33cccc;">Add New Task</span></h2><p>Click here to add your own new to-do task. They are assigned to you, by default.</p>',
                    position:'right'
                },
                {
                    element: '#step2',
                    intro: '<h2><span style="color: #33cccc;">Tasks List</span></h2><p>This is your To-Do List. It lists tasks that were: Created by you, and, Assigned to you from the workflow cards (we call these Approval tasks).</p><p>- Tasks can be marked as complete by checking the box&nbsp; <md-icon md-font-icon="icon-checkbox-blank-outline" class="s18  md-font material-icons icon-checkbox-blank-outline"></md-icon><br />- Tasks can also be marked as Done, Important, Starred, OR, removed by clicking on&nbsp; <md-icon md-font-icon="icon-dots-vertical" class="s18  md-font material-icons icon-dots-vertical"></md-icon></p>',
                    position:'top',
                    tooltipClass: 'introjs-tooltip-width'
                }
            ],
            navigation:[
                {
                    intro: '<h2><span style="color: #33cccc;">Hello!</span></h2><p>Welcome onboard the FusePLM cruise ship!</p><p>FusePLM is an affordable, easy-to-use and easy-to-configure cloud-based system that helps electronics/mechanical engineering &amp; manufacturing companies manage Parts, Bill-of-Materials, issues and change process of their products.</p><p>It is designed to simplify the tasks involved in managing a product&rsquo;s lifecycle.</p><p style="padding-left: 90px;"><iframe src="//www.youtube.com/embed/g4Ewacp4Yas?rel=0" width="400" height="200" allowfullscreen="allowfullscreen"></iframe></p><b>How to use this onboarding Help module.</b><ul><li>Clicking <strong><em>Prev/Next</em> </strong>buttons below (or Left/Right arrow keys) allows you to cycle through a description of features.</li><li><strong><em>Got it!</em></strong> Button appears at the final feature. Clicking it will close the dialog and never show up again.</li><li>Clicking outside the Help dialog box closes it. To bring it back up, click on&nbsp;<span style="cursor: pointer; font-size:13px; color: rgb(0,0,0); font-weight: bold; border: 1px solid rgb(100,255,63); background: rgb(100,255,63); width: 20px; height: 20px; text-align: center; border-radius: 50%; position: relative; padding: 1px 6px 1px 6px;">?</span></li></ul>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#search #step20',
                    intro: '<h2><span style="color: #33cccc;">Global Search</span></h2><p>Allows you to search for Parts, Products, Cards and Tasks in the system. By default, it searches across all these entities.</p>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#search #step21',
                    intro: '<h2><span style="color: #33cccc;">Dashboard</span></h2><p>Presents an overview of:</p><ul><li>Tasks<ul><li>Due Tasks - Shows number of tasks where due date is set for Today/Next 3 days/Next 7 days based on your selection</li><li>Overdue tasks - Shows number of tasks where due date was set for yesterday AND earlier</li></ul></li><li>Cards across all boards assigned to you, that are still open</li></ul>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#customer #step20',
                    intro: '<h1><span style="color: #33cccc;">Boards, Lists and Cards</span></h1><p>The workflow interface is inspired by the Kanban style of project management that employs sticky note-type cards that can be dragged and dropped into different containers to change their state.</p><p><strong>1.Boards: </strong>A board is equivalent to a workflow. There can be multiple boards for the same company. For eg: a company that has 3 product lines (eg: phones, tablets, watches), can have 3 boards, each representing the workflow for each product line.</p><p><strong>2.Lists:</strong> The various states of a card (or issue) within a workflow are represented as &lsquo;Lists&rsquo;. For eg: if an issue has 3 potential states viz. &lsquo;submitted&rsquo;, &lsquo;rejected&rsquo;, &lsquo;completed&rsquo; there will be 3 lists, one for each state.</p><p><strong>3.Cards: </strong>An issue is represented within a board as a card. In other words, to create a new issue, you create a new card.</p>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#customer #step21',
                    intro: '<h2><span style="color: #33cccc;">Tasks</span></h2><p>This is your To-Do List. It lists tasks that were:</p><ul><li>Created by you, and,</li><li>Assigned to you from the workflow cards (we call these Approval tasks).</li></ul> ',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#object #step20',
                    intro: '<h2><span style="color: #33cccc;">Products</span></h2><p>FusePLM allows companies to manage their parts (viz. electronic/mechanical/software components, assemblies, sub-assemblies etc.) and products (a collection of parts). Collectively, there&rsquo;re called Objects, in FusePLM. By default, Products are assumed to have a Bill-of-Material structure.</p><p>By default, the list of products shows the 20 most recently modified products. This list is sorted based on the Last Modified Date. Users can sort lists based on other columns as desired.</p>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#object #step21',
                    intro: '<h2><span style="color: #33cccc;">Parts</span></h2><p>FusePLM allows companies to manage their parts (viz. electronic/mechanical/software components, assemblies, sub-assemblies etc.) and products (a collection of parts). Collectively, there&rsquo;re called Objects, in FusePLM.</p><p>By default, the list of Parts shows the 20 most recently modified parts. This list is sorted based on the Last Modified Date. Users can sort lists based on other columns as desired.</p>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#adminsetting #step20',
                    intro: '<h2><span style="color: #33cccc;">Settings</span></h2><p>This section is only available for Admins, you can perform the following actions here:</p><ul><li>Create new members</li><li>Create part/product categories</li><li>Create Custom Attributes</li><li>Manage other settings&hellip;</li></ul>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step24',
                    intro: '<h2><span style="color: #33cccc;">PLMBot</span></h2><p>It&nbsp;is an interactive chatbot that helps users perform tedious project management tasks, without the need to go through training.</p><p>It can be invoked from anywhere in the application, by clicking on the icon in the bottom right corner.</p><p>You can ask PLMBot questions such as:</p><ul><li>Show my cards</li><li>Create a card</li><li>Show my tasks</li><li>Create task</li></ul><p style="padding-left: 30px;"><iframe src="//www.youtube.com/embed/0AgcOFv32OY?rel=0" width="500" height="250" allowfullscreen="allowfullscreen"></iframe></p>',
                    position:'left',
                    tooltipClass: 'introjs-tooltip-width'
                }],
            userNavigation:[
                {
                    intro: '<h2><span style="color: #33cccc;">Hello!</span></h2><p>Welcome onboard the FusePLM cruise ship!</p><p>FusePLM is an affordable, easy-to-use and easy-to-configure cloud-based system that helps electronics/mechanical engineering &amp; manufacturing companies manage Parts, Bill-of-Materials, issues and change process of their products.</p><p>It is designed to simplify the tasks involved in managing a product&rsquo;s lifecycle.</p><p style="padding-left: 90px;"><iframe src="//www.youtube.com/embed/g4Ewacp4Yas?rel=0" width="400" height="200" allowfullscreen="allowfullscreen"></iframe></p><b>How to use this onboarding Help module.</b><ul><li>Clicking <strong><em>Prev/Next</em> </strong>buttons below (or Left/Right arrow keys) allows you to cycle through a description of features.</li><li><strong><em>Got it!</em></strong> Button appears at the final feature. Clicking it will close the dialog and never show up again.</li><li>Clicking outside the Help dialog box closes it. To bring it back up, click on&nbsp;<span style="cursor: pointer; font-size:13px; color: rgb(0,0,0); font-weight: bold; border: 1px solid rgb(100,255,63); background: rgb(100,255,63); width: 20px; height: 20px; text-align: center; border-radius: 50%; position: relative; padding: 1px 6px 1px 6px;">?</span></li></ul>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#search #step20',
                    intro: '<h2><span style="color: #33cccc;">Global Search</span></h2><p>Allows you to search for Parts, Products, Cards and Tasks in the system. By default, it searches across all these entities.</p>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#search #step21',
                    intro: '<h2><span style="color: #33cccc;">Dashboard</span></h2><p>Presents an overview of:</p><ul><li>Tasks<ul><li>Due Tasks - Shows number of tasks where due date is set for Today/Next 3 days/Next 7 days based on your selection</li><li>Overdue tasks - Shows number of tasks where due date was set for yesterday AND earlier</li></ul></li><li>Cards across all boards assigned to you, that are still open</li></ul>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#customer #step20',
                    intro: '<h1><span style="color: #33cccc;">Boards, Lists and Cards</span></h1><p>The workflow interface is inspired by the Kanban style of project management that employs sticky note-type cards that can be dragged and dropped into different containers to change their state.</p><p><strong>1.Boards: </strong>A board is equivalent to a workflow. There can be multiple boards for the same company. For eg: a company that has 3 product lines (eg: phones, tablets, watches), can have 3 boards, each representing the workflow for each product line.</p><p><strong>2.Lists:</strong> The various states of a card (or issue) within a workflow are represented as &lsquo;Lists&rsquo;. For eg: if an issue has 3 potential states viz. &lsquo;submitted&rsquo;, &lsquo;rejected&rsquo;, &lsquo;completed&rsquo; there will be 3 lists, one for each state.</p><p><strong>3.Cards: </strong>An issue is represented within a board as a card. In other words, to create a new issue, you create a new card.</p>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#customer #step21',
                    intro: '<h2><span style="color: #33cccc;">Tasks</span></h2><p>This is your To-Do List. It lists tasks that were:</p><ul><li>Created by you, and,</li><li>Assigned to you from the workflow cards (we call these Approval tasks).</li></ul>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#object #step20',
                    intro: '<h2><span style="color: #33cccc;">Products</span></h2><p>FusePLM allows companies to manage their parts (viz. electronic/mechanical/software components, assemblies, sub-assemblies etc.) and products (a collection of parts). Collectively, there&rsquo;re called Objects, in FusePLM. By default, Products are assumed to have a Bill-of-Material structure.</p><p>By default, the list of products shows the 20 most recently modified products. This list is sorted based on the Last Modified Date. Users can sort lists based on other columns as desired.</p>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#object #step21',
                    intro: '<h2><span style="color: #33cccc;">Parts</span></h2><p>FusePLM allows companies to manage their parts (viz. electronic/mechanical/software components, assemblies, sub-assemblies etc.) and products (a collection of parts). Collectively, there&rsquo;re called Objects, in FusePLM.</p><p>By default, the list of Parts shows the 20 most recently modified parts. This list is sorted based on the Last Modified Date. Users can sort lists based on other columns as desired.</p>',
                    position:'right',
                    tooltipClass: 'introjs-tooltip-width'
                },
                {
                    element: '#step24',
                    intro: '<h2><span style="color: #33cccc;">PLMBot</span></h2><p>It&nbsp;is an interactive chatbot that helps users perform tedious project management tasks, without the need to go through training.</p><p>It can be invoked from anywhere in the application, by clicking on the icon in the bottom right corner.</p><p>You can ask PLMBot questions such as:</p><ul><li>Show my cards</li><li>Create a card</li><li>Show my tasks</li><li>Create task</li></ul><p style="padding-left: 30px;"><iframe src="//www.youtube.com/embed/0AgcOFv32OY?rel=0" width="500" height="250" allowfullscreen="allowfullscreen"></iframe></p>',
                    position:'left',
                    tooltipClass: 'introjs-tooltip-width'
                }],
            plmBotHint: [
                {
                    element: '#plmbot-intro',
                    intro: '<h2><span style="color: #33cccc;">PLMBot</span></h2><p>It&nbsp;is an interactive chatbot that helps users perform tedious project management tasks, without the need to go through training.</p><p>It can be invoked from anywhere in the application, by clicking on the icon in the bottom right corner.</p><p>You can ask PLMBot questions such as:</p><ul><li>Show my cards</li><li>Create a card</li><li>Show my tasks</li><li>Create task</li></ul><p style="padding-left: 30px;"><iframe src="//www.youtube.com/embed/0AgcOFv32OY?rel=0" width="500" height="250" allowfullscreen="allowfullscreen"></iframe></p>',
                    position: 'bottom'
                }
            ]
        };

        this.getIntroObj = function (name) {
            return intro[name];
        };

    }
})();
