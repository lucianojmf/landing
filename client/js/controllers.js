'use strict';

/* Controllers */

angular.module('petiko')
.controller('NavCtrl', ['$rootScope', '$scope', '$location', 'Auth', function($rootScope, $scope, $location, Auth) {
    $scope.user = Auth.user;
    $scope.userRoles = Auth.userRoles;
    $scope.accessLevels = Auth.accessLevels;

    $scope.logout = function() {
        Auth.logout(function() {
            $location.path('/login');
        }, function() {
            $rootScope.error = "Failed to logout";
        });
    };
}]);

angular.module('petiko')
.controller('LoginCtrl',
['$rootScope', '$scope', '$location', '$window', 'Auth', function($rootScope, $scope, $location, $window, Auth) {

    $scope.rememberme = true;
    $scope.userRole = Auth.userRoles.user;
    $scope.login = function() {
        Auth.login({
                username: $scope.username,
                password: $scope.password,
                rememberme: $scope.rememberme
            },
            function(res) {
                $location.path(Auth.verifyLogin());
            },
            function(err) {
                $rootScope.error = "Failed to login";
            });
    };

    $scope.loginOauth = function(provider) {
        $window.location.href = '/auth/' + provider;
    };
}]);

angular.module('petiko')
.controller('HomeCtrl',
['$rootScope', function($rootScope) {

}]);

angular.module('petiko')
.controller('RegisterCtrl',
['$rootScope', '$scope', '$location', 'Auth', function($rootScope, $scope, $location, Auth) {
    $scope.role = Auth.userRoles.user;
    $scope.userRoles = Auth.userRoles;

    $scope.register = function() {
        Auth.register({
                username: $scope.username,
                password: $scope.password,
                role: $scope.userRoles.user
            },
            function() {
                $location.path(Auth.verifyLogin());
            },
            function(err) {
                $rootScope.error = err;
            });
    };
}]);

angular.module('petiko')
.controller('ProfileCtrl',
['$rootScope', '$scope', 'Auth', 'Users', '$location', function($rootScope, $scope, Auth, Users,  $location) {
    //Objetos
    $scope.user = Auth.user;
    $scope.userRoles = Auth.userRoles;
    $scope.accessLevels = Auth.accessLevels;

    Users.getMyProfile(function(res) {
        $scope.profile = res;
        console.log($scope.profile);
    }, function(err) {
        $rootScope.error = err;
    });

    


    // ---- Metodos do profile

    $scope.updateMyProfile = function(){
        Users.updateMyProfile($scope.profile,
            function(res){
                $scope.profile = res;
        }, function(err){
            $rootScope.error = err;
        });
    }


    // ---- Metodos dos pets
    $scope.addPet = function(){
        
    }

    $scope.listPets = {
        options: [$scope.user.pets],
        option_new: {nomePet: '', tipoPet: '', racaPet: '', nascimentoPet: ''}
    };

    $scope.addPet = function(){
        
    }

    $scope.add = function() {
        // add the new option to the model
        $scope.listPets.options.push($scope.listPets.option_new);
        
        // clear the option.
        $scope.listPets.option_new = {nomePet: '', tipoPet: '', racaPet: '', nascimentoPet: ''};
    }

    $scope.registerPets = function() {
        // alert($scope.listPets.options);

        // Auth.registerPets(
        
        // user: $scope.user,
        
        // pets: $scope.listPets.options,

        // function(){
        //     $location.path('/profile');
        // },
        // function(err) {
        //     $rootScope.error = err;
        // });
    }

    $scope.delete = function(idx){
        $scope.listPets.options.splice(idx,1);
    }
    
}]);

angular.module('petiko')
.controller('PrivateCtrl',
['$rootScope', function($rootScope) {
}]);


angular.module('petiko')
.controller('AdminCtrl',
['$rootScope', '$scope', 'Users', 'Auth', function($rootScope, $scope, Users, Auth) {
    $scope.loading = true;
    $scope.userRoles = Auth.userRoles;

    
    Users.getAll(function(res) {
        $scope.users = res;
        $scope.loading = false;
    }, function(err) {
        $rootScope.error = "Failed to fetch users.";
        $scope.loading = false;
    });

}]);

