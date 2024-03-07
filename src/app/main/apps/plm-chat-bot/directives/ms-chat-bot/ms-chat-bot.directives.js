(function ()
{
    'use strict';

    angular
        .module('app.chat-bot')
        .directive('msPlmChatBot', msPlmChatBot);

    /** @ngInject */
    function msPlmChatBot($timeout, $rootScope){
        return {
            restrict   : 'E',
            scope      : {
                panelOpen: '=?'
            },
            controller : 'MsPlmChatBotController as vm',
            templateUrl: 'app/main/apps/plm-chat-bot/directives/ms-chat-bot/ms-chat-bot.html',
            compile    : function (tElement)
            {
                tElement.addClass('ms-chat-bot-options');

                return function postLink(scope, iElement)
                {
                    var bodyEl = angular.element('body'),
                        backdropEl = angular.element('<div class="ms-chat-bot-options-backdrop"></div>');

                    // Panel open status
                    scope.panelOpen = scope.panelOpen || false;

                    /**
                     * Toggle options panel
                     */
                    function toggleOptionsPanel()
                    {
                        if ( scope.panelOpen )
                        {
                            closeOptionsPanel();
                        }
                        else
                        {
                            openOptionsPanel();
                        }
                    }
                    function introManipulations() {
                        introJs().setOption('tooltipClass', 'introjs-tooltip-width').addHints();
                        $("a.introjs-hint div").addClass('introHints');
                        $("a.introjs-hint.introjs-fixedhint").css({'display':'none'});
                        if($("a.introjs-hint .introjs-hint-pulse .question").length == 0) {
                            $("a.introjs-hint div.introjs-hint-pulse").append("<span class='question' style='color: rgb(0,0,0);font-weight: bold;'>?</span>");
                        }
                        $(".introjs-hint-dot").removeClass('introHints');
                    }

                    function openOptionsPanel()
                    {
                        $timeout(function(){
                            introManipulations();
                            $("a.introjs-hint").css({'z-index':'99999999','left':'520px'});
                            $(".introjs-hint-dot").css({'display':'block','background':'rgb(100,255,63)','border-color':'rgb(100,255,63)'});
                        });
                        // Set panelOpen status
                        scope.panelOpen = true;
                        $rootScope.plmBotPanelOpen = true;

                        // Add open class
                        iElement.addClass('open');
                        iElement.addClass('opened');

                        /**
                         * fix for auto focus
                         * please refer issues : https://github.com/fuseplmapp/new-fe-integration/issues/120
                         */
                        iElement.find('.md-input-container').addClass('md-input-focus');
                        iElement.find('textarea').focus();

                        // Append the backdrop
                        bodyEl.append(backdropEl);

                        // Register the event
                        backdropEl.on('click touch', closeOptionsPanel);
                    }

                    function safeApply(scope, fn) {
                        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
                    }

                    /**
                     * Close options panel
                     */
                    function closeOptionsPanel()
                    {
                        $timeout(function () {
                            introManipulations();
                            $("a.introjs-hint").first().css({'left':'320px'});
                            $("a.introjs-hint").last().remove();
                            $(".introjs-hint-dot").css({'display':'block','background':'green','border-color':'green'});
                        });
                        // Set panelOpen status
                        scope.panelOpen = false;
                        $rootScope.plmBotPanelOpen = false;

                        // Remove open class
                        iElement.removeClass('open');
                        iElement.removeClass('opened');

                        /**
                         * fix for auto focus
                         * please refer issues : https://github.com/fuseplmapp/new-fe-integration/issues/120
                         */
                        iElement.find('.md-input-container').removeClass('md-input-focus');

                        // De-register the event
                        backdropEl.off('click touch', closeOptionsPanel);

                        // Remove the backdrop
                        backdropEl.remove();

                        safeApply(scope, function(){});

                    }

                    // Expose the toggle function
                    scope.toggleOptionsPanel = toggleOptionsPanel;
                };
            }
        };
    }

})();