(function() {
  'use strict';
  var dependencies;

  dependencies = ['ui.router', 'ngResource', 'app.constants', 'duScroll', 'appirio-tech-ng-ui-components'];

  angular.module('appirio-tech-messaging', dependencies);

}).call(this);

(function() {
  'use strict';
  var MessagingController;

  MessagingController = function($scope, MessagingService) {
    var activate, getUserMessages, onChange, sendMessage, vm;
    vm = this;
    vm.currentUser = null;
    onChange = function(messages) {
      return vm.messaging = messages;
    };
    activate = function() {
      vm.messaging = {
        messages: []
      };
      vm.newMessage = '';
      $scope.$watch('threadId', function() {
        return getUserMessages();
      });
      $scope.$watch('subscriberId', function() {
        return getUserMessages();
      });
      vm.sendMessage = sendMessage;
      return vm;
    };
    getUserMessages = function() {
      var params;
      if ($scope.threadId && $scope.subscriberId) {
        params = {
          id: $scope.threadId,
          subscriberId: $scope.subscriberId
        };
        return MessagingService.getMessages(params, onChange);
      }
    };
    sendMessage = function() {
      var message;
      if (vm.newMessage.length) {
        message = {
          threadId: $scope.threadId,
          body: vm.newMessage,
          publisherId: $scope.subscriberId,
          createdAt: moment(),
          attachments: []
        };
        vm.messaging.messages.push(message);
        MessagingService.postMessage(message, onChange);
        vm.newMessage = '';
        return $scope.showLast = 'scroll';
      }
    };
    return activate();
  };

  MessagingController.$inject = ['$scope', 'MessagingService'];

  angular.module('appirio-tech-messaging').controller('MessagingController', MessagingController);

}).call(this);

(function() {
  'use strict';
  var srv;

  srv = function(MessagesAPIService, ThreadsAPIService) {
    var getMessages, markMessageRead, postMessage;
    getMessages = function(params, onChange) {
      var messaging, resource;
      messaging = {
        messages: [],
        avatars: {}
      };
      resource = ThreadsAPIService.get(params);
      resource.$promise.then(function(response) {
        var i, len, message, ref;
        messaging.messages = response != null ? response.messages : void 0;
        ref = messaging.messages;
        for (i = 0, len = ref.length; i < len; i++) {
          message = ref[i];
          markMessageRead(message, params);
        }
        return typeof onChange === "function" ? onChange(messaging) : void 0;
      });
      resource.$promise["catch"](function() {});
      return resource.$promise["finally"](function() {});
    };
    markMessageRead = function(message, params) {
      var putParams, queryParams;
      queryParams = {
        id: message.id
      };
      putParams = {
        read: true,
        subscriberId: params.subscriberId,
        threadId: params.id
      };
      return MessagesAPIService.put(queryParams, putParams);
    };
    postMessage = function(message, onChange) {
      var resource;
      resource = MessagesAPIService.save(message);
      resource.$promise.then(function(response) {});
      resource.$promise["catch"](function(response) {});
      return resource.$promise["finally"](function() {});
    };
    return {
      getMessages: getMessages,
      postMessage: postMessage
    };
  };

  srv.$inject = ['MessagesAPIService', 'ThreadsAPIService'];

  angular.module('appirio-tech-messaging').factory('MessagingService', srv);

}).call(this);

(function() {
  'use strict';
  var directive;

  directive = function(MessagingService) {
    var link;
    link = function(scope, element, attrs) {
      var showLast;
      showLast = function(newValue, oldValue) {
        var $messageList, bottom, messageList, uls;
        if (newValue) {
          scope.showLast = false;
          uls = element.find('ul');
          messageList = uls[0];
          $messageList = angular.element(messageList);
          bottom = messageList.scrollHeight;
          if (newValue === 'scroll') {
            return $messageList.scrollTopAnimated(bottom);
          } else {
            return $messageList.scrollTop(bottom);
          }
        }
      };
      showLast(true);
      return scope.$watch('showLast', showLast);
    };
    return {
      restrict: 'E',
      templateUrl: 'views/messaging.directive.html',
      link: link,
      controller: 'MessagingController',
      controllerAs: 'vm',
      scope: {
        threadId: '@threadId',
        subscriberId: '@subscriberId'
      }
    };
  };

  directive.$inject = ['MessagingService'];

  angular.module('appirio-tech-messaging').directive('messaging', directive);

}).call(this);

(function() {
  'use strict';
  var directive;

  directive = function(MessagingService) {
    return {
      restrict: 'E',
      templateUrl: 'views/threads.directive.html',
      controller: 'ThreadsController',
      controllerAs: 'vm',
      scope: {
        subscriberId: '@subscriberId'
      }
    };
  };

  directive.$inject = ['MessagingService'];

  angular.module('appirio-tech-messaging').directive('threads', directive);

}).call(this);

(function() {
  'use strict';
  var srv, transformResponse;

  transformResponse = function(response) {
    var parsed, ref;
    parsed = JSON.parse(response);
    return (parsed != null ? (ref = parsed.result) != null ? ref.content : void 0 : void 0) || [];
  };

  srv = function($resource, API_URL) {
    var methods, params, url;
    url = API_URL + '/v3/messages/:id';
    params = {
      id: '@id'
    };
    methods = {
      put: {
        method: 'PUT'
      }
    };
    return $resource(url, {}, methods);
  };

  srv.$inject = ['$resource', 'API_URL'];

  angular.module('appirio-tech-messaging').factory('MessagesAPIService', srv);

}).call(this);

(function() {
  'use strict';
  var srv;

  srv = function(ThreadsAPIService) {
    var get;
    get = function(subscriberId, onChange) {
      var queryParams, resource, threadsVm;
      queryParams = {
        subscriberId: subscriberId
      };
      threadsVm = {
        threads: [],
        totalUnreadCount: {},
        avatars: {}
      };
      resource = ThreadsAPIService.query(queryParams);
      resource.$promise.then(function(response) {
        threadsVm.threads = response.threads;
        return typeof onChange === "function" ? onChange(threadsVm) : void 0;
      });
      resource.$promise["catch"](function() {});
      return resource.$promise["finally"](function() {});
    };
    return {
      get: get
    };
  };

  srv.$inject = ['ThreadsAPIService'];

  angular.module('appirio-tech-messaging').factory('ThreadsService', srv);

}).call(this);

(function() {
  'use strict';
  var srv, transformResponse;

  transformResponse = function(response) {
    var parsed, ref;
    parsed = JSON.parse(response);
    return (parsed != null ? (ref = parsed.result) != null ? ref.content : void 0 : void 0) || {};
  };

  srv = function($resource, API_URL) {
    var actions, params, url;
    url = API_URL + '/v3/threads/:id';
    params = {
      id: '@id',
      subscriberId: '@subscriberId'
    };
    actions = {
      query: {
        method: 'GET',
        isArray: false,
        transformResponse: transformResponse
      },
      get: {
        method: 'GET',
        isArray: false,
        transformResponse: transformResponse
      }
    };
    return $resource(url, params, actions);
  };

  srv.$inject = ['$resource', 'API_URL'];

  angular.module('appirio-tech-messaging').factory('ThreadsAPIService', srv);

}).call(this);

(function() {
  'use strict';
  var ThreadsController;

  ThreadsController = function($scope, ThreadsService) {
    var activate, onChange, removeBlanks, vm;
    vm = this;
    onChange = function(threadsVm) {
      vm.threads = removeBlanks(threadsVm.threads);
      vm.totalUnreadCount = threadsVm.totalUnreadCount;
      return vm.avatars = threadsVm.avatars;
    };
    removeBlanks = function(threads) {
      var i, len, noBlanks, thread;
      noBlanks = [];
      for (i = 0, len = threads.length; i < len; i++) {
        thread = threads[i];
        if (thread.messages.length) {
          noBlanks.push(thread);
        }
      }
      return noBlanks;
    };
    activate = function() {
      $scope.$watch('subscriberId', function() {
        if ($scope.subscriberId.length) {
          return ThreadsService.get($scope.subscriberId, onChange);
        }
      });
      return vm;
    };
    return activate();
  };

  ThreadsController.$inject = ['$scope', 'ThreadsService'];

  angular.module('appirio-tech-messaging').controller('ThreadsController', ThreadsController);

}).call(this);

(function() {
  'use strict';
  var filter;

  filter = function() {
    return function(createdAt) {
      return moment(createdAt).fromNow();
    };
  };

  angular.module('appirio-tech-messaging').filter('timeLapse', filter);

}).call(this);

angular.module("appirio-tech-messaging").run(["$templateCache", function($templateCache) {$templateCache.put("views/messaging.directive.html","<ul class=\"messages\"><li ng-repeat=\"message in vm.messaging.messages track by $index\"><avatar avatar-url=\"{{ vm.messaging.avatars[message.publisherId] }}\"></avatar><div class=\"message\"><p>{{ message.body }}</p><ul class=\"attachments\"><li ng-repeat=\"attachment in message.attachments track by $index\"><a href=\"#\">{{ message.attachments.originalUrl }}</a></li></ul><time>{{ message.createdAt | timeLapse }}</time></div></li><a id=\"messaging-bottom-{{ vm.threadId }}\"></a></ul><form ng-submit=\"vm.sendMessage()\"><textarea placeholder=\"Send a message&hellip;\" ng-model=\"vm.newMessage\"></textarea><button type=\"submit\" class=\"enter\">Enter</button><button type=\"button\" class=\"attach\"><div class=\"icon\"></div><span>Add Attachment</span></button></form>");
$templateCache.put("views/threads.directive.html","<ul><li ng-repeat=\"thread in vm.threads track by $index\"><a ui-sref=\"messaging({ id: thread.id })\"><header><h4>{{ thread.subject }}</h4><time>{{ thread.messages[0].createdAt | timeLapse }}</time></header><main><avatar avatar-url=\"{{ vm.avatars[thread.messages[0].publisherId]  }}\"></avatar><div ng-show=\"thread.unreadCount &gt; 0\" class=\"notification\">{{ thread.unreadCount }}</div><div class=\"message\"><div class=\"co-pilot\">{{ thread.messages[0].publisherId }}:</div><p>{{ thread.messages[0].body }}</p></div></main></a></li></ul><div ng-show=\"vm.threads.length == 0\" class=\"none\">None</div>");}]);