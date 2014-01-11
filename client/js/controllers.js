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
    $scope.sexo = ['M', 'F'];
    $scope.tipoPet =['Cachorro', 'Gato', 'Ave', 'Peixe', 'Roedor', 'Réptil', 'Outro'];
    
    $scope.petObj = {
        nome: '',
        tipo: $scope.tipoPet[0],
        raca: '',
        sexo: $scope.sexo[0]};


    // ---- Metodos do profile

    $scope.updateMyProfile = function(){
        //promocional
        if(!$scope.profile.step1){
            $scope.profile.step1 = true;
            $scope.profile.petikets = $scope.profile.petikets + 5;
        }

        Users.updateMyProfile($scope.profile,
            function(res){
                $scope.profile = res;
        }, function(err){
            $rootScope.error = err;
        });
    }

    // ---- Metodos dos pets
    $scope.addPet = function(){
        //promocional
        if(!$scope.profile.step2){
            $scope.profile.step2 = true;
             $scope.profile.petikets = $scope.profile.petikets + 5;
        }

        $scope.profile.pets.push($scope.petObj);
        Users.updateMyProfile($scope.profile,
            function(res){
                $scope.profile = res;
        }, function(err){
            $rootScope.error = err;
        });
        //resseta o form
        $scope.petObj = {
            nome: '',
            tipo: $scope.tipoPet[0],
            raca: '',
            sexo: $scope.sexo[0]};
    }

    
    
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

