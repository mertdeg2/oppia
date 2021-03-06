// Copyright 2016 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Directive for the activities tab in the admin panel when Oppia
 * is in developer mode.
 */

require('domain/objects/NumberWithUnitsObjectFactory.ts');
require('domain/utilities/UrlInterpolationService.ts');
require('pages/admin-page/services/admin-task-manager.service.ts');

require('pages/admin-page/admin-page.constants.ts');

oppia.directive('adminDevModeActivitiesTab', [
  '$http', 'AdminTaskManagerService', 'UrlInterpolationService',
  'ADMIN_HANDLER_URL',
  function($http, AdminTaskManagerService, UrlInterpolationService,
      ADMIN_HANDLER_URL) {
    return {
      restrict: 'E',
      scope: {},
      bindToController: {
        setStatusMessage: '='
      },
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/admin-page/activities-tab/' +
        'admin-dev-mode-activities-tab.directive.html'),
      controllerAs: '$ctrl',
      controller: [function() {
        var ctrl = this;
        ctrl.reloadExploration = function(explorationId) {
          if (AdminTaskManagerService.isTaskRunning()) {
            return;
          }
          if (!confirm('This action is irreversible. Are you sure?')) {
            return;
          }

          ctrl.setStatusMessage('Processing...');

          AdminTaskManagerService.startTask();
          $http.post(ADMIN_HANDLER_URL, {
            action: 'reload_exploration',
            exploration_id: String(explorationId)
          }).then(function() {
            ctrl.setStatusMessage('Data reloaded successfully.');
            AdminTaskManagerService.finishTask();
          }, function(errorResponse) {
            ctrl.setStatusMessage(
              'Server error: ' + errorResponse.data.error);
            AdminTaskManagerService.finishTask();
          });
        };

        ctrl.DEMO_EXPLORATIONS = GLOBALS.DEMO_EXPLORATIONS;
        ctrl.DEMO_COLLECTIONS = GLOBALS.DEMO_COLLECTIONS;
        ctrl.numDummyExpsToPublish = 0;
        ctrl.numDummyExpsToGenerate = 0;

        ctrl.reloadAllExplorations = function() {
          if (AdminTaskManagerService.isTaskRunning()) {
            return;
          }
          if (!confirm('This action is irreversible. Are you sure?')) {
            return;
          }

          ctrl.setStatusMessage('Processing...');
          AdminTaskManagerService.startTask();

          var numSucceeded = 0;
          var numFailed = 0;
          var numTried = 0;
          var printResult = function() {
            if (numTried < GLOBALS.DEMO_EXPLORATION_IDS.length) {
              ctrl.setStatusMessage(
                'Processing...' + numTried + '/' +
                GLOBALS.DEMO_EXPLORATION_IDS.length);
              return;
            }
            ctrl.setStatusMessage(
              'Reloaded ' + GLOBALS.DEMO_EXPLORATION_IDS.length +
              ' explorations: ' + numSucceeded + ' succeeded, ' + numFailed +
              ' failed.');
            AdminTaskManagerService.finishTask();
          };

          for (var i = 0; i < GLOBALS.DEMO_EXPLORATION_IDS.length; ++i) {
            var explorationId = GLOBALS.DEMO_EXPLORATION_IDS[i];

            $http.post(ADMIN_HANDLER_URL, {
              action: 'reload_exploration',
              exploration_id: explorationId
            }).then(function() {
              ++numSucceeded;
              ++numTried;
              printResult();
            }, function() {
              ++numFailed;
              ++numTried;
              printResult();
            });
          }
        };

        ctrl.generateDummyExplorations = function() {
          // Generate dummy explorations with random title.
          if (ctrl.numDummyExpsToPublish > ctrl.numDummyExpsToGenerate) {
            ctrl.setStatusMessage(
              'Publish count should be less than or equal to generate count');
            return;
          }
          AdminTaskManagerService.startTask();
          ctrl.setStatusMessage('Processing...');
          $http.post(ADMIN_HANDLER_URL, {
            action: 'generate_dummy_explorations',
            num_dummy_exps_to_generate: ctrl.numDummyExpsToGenerate,
            num_dummy_exps_to_publish: ctrl.numDummyExpsToPublish
          }).then(function() {
            ctrl.setStatusMessage(
              'Dummy explorations generated successfully.');
          }, function(errorResponse) {
            ctrl.setStatusMessage(
              'Server error: ' + errorResponse.data.error);
          });
          AdminTaskManagerService.finishTask();
        };

        ctrl.reloadCollection = function(collectionId) {
          if (AdminTaskManagerService.isTaskRunning()) {
            return;
          }
          if (!confirm('This action is irreversible. Are you sure?')) {
            return;
          }

          ctrl.setStatusMessage('Processing...');

          AdminTaskManagerService.startTask();
          $http.post(ADMIN_HANDLER_URL, {
            action: 'reload_collection',
            collection_id: String(collectionId)
          }).then(function() {
            ctrl.setStatusMessage('Data reloaded successfully.');
          }, function(errorResponse) {
            ctrl.setStatusMessage(
              'Server error: ' + errorResponse.data.error);
          });
          AdminTaskManagerService.finishTask();
        };
      }]
    };
  }
]);
