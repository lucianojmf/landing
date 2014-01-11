'use strict';

angular.module('petiko')
.factory('Auth', function($http, $cookieStore){

    var accessLevels = routingConfig.accessLevels
        , userRoles = routingConfig.userRoles
        , currentUser = $cookieStore.get('user') || { username: '', role: userRoles.public };

    $cookieStore.remove('user');

    function changeUser(user) {
        _.extend(currentUser, user);
    };

    return {
        authorize: function(accessLevel, role) {
            if(role === undefined)
                role = currentUser.role;

            return accessLevel.bitMask & role.bitMask;
        },
        isLoggedIn: function(user) {
            if(user === undefined)
                user = currentUser;
            return user.role.title == userRoles.user.title || user.role.title == userRoles.admin.title;
        },
        register: function(user, success, error) {
            $http.post('/register', user).success(function(res) {
                changeUser(res);
                success();
            }).error(error);
        },
        verifyLogin: function(user){
            if(user === undefined)
                user = currentUser;

            if(user.role.title == userRoles.admin.title)
                return '/admin';
            else if(user.role.title == userRoles.user.title)
                return '/profile';
            else if(user.role.title == userRoles.business.title)
                return '/business';
        },
        // registerPets: function(user, pets, sucess, error){
        //     alert(JSON.stringify(pets));
        //     $http.post('/registerPets', user, pets).success(function(res){
        //         success(data.user);
        //     }).error(error);
        // },
        login: function(user, success, error) {
            $http.post('/login', user).success(function(user){
                changeUser(user);
                success(user);
            }).error(error);
        },
        logout: function(success, error) {
            $http.post('/logout').success(function(){
                changeUser({
                    username: '',
                    role: userRoles.public
                });
                success();
            }).error(error);
        },
        accessLevels: accessLevels,
        userRoles: userRoles,
        user: currentUser
    };
});

angular.module('petiko')
.factory('Users', function($http, $cookieStore) {
    var currentUser = $cookieStore.get('user');
    return {
        getAll: function(success, error) {
            $http.get('/users').success(success).error(error);
        },


        getMyProfile: function(success, error) {
            $http.get('/myprofile', currentUser).success(success).error(error);
        },
        updateMyProfile: function(profile, success, error){
            $http.put('/myprofile', profile).success(success).error(error);
        },
    };
});
