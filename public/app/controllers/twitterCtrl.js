angular.module('twitterController', ['twitterServices', 'chart.js'])

.controller('twitterCtrl', function (Tweet, $scope){
	var app = this;

	Tweet.gettwitter().then(function (data) {
		if (data.data.success) {
			app.likes = data.data.user.favourites_count;
			app.tweets = data.data.user.statuses_count;
			app.following = data.data.user.friends_count;
			app.followers = data.data.user.followers_count;
		} else {
			app.errorMsg = data.data.message;
		}
	});

	Tweet.gettweetscount().then(function (data){

		if(data.data.success) {

			$scope.labels = ["Total Tweets"];
			
			$scope.data = [];
			$scope.data.push(data.data.count);
			$scope.totalcount = data.data.count;
		}		
	});	

	Tweet.getbarchartdata().then(function (data){

		if (data.data.success) {

			data = data.data.count;

			$scope.value = [];
			$scope.labels = [];

			for(var i = 0; i < data.length; i++) {

			    $scope.value.push(data[i].count);		    

			    var myDate= data[i].date;
			    myDate = myDate.split('T')[0];
			    $scope.labels.push(myDate);
			}
		}		
	});

	Tweet.getmodeldatachart().then(function (data){

		if(data.data.success) {

			$scope.labels = ["Total Tweets"];
			
			$scope.mdata = [];
			$scope.mdata.push(data.data.modeldata);
			$scope.modelcount = data.data.modeldata;
		}		
	});

	Tweet.getmodelbarchart().then(function (data){

		if (data.data.success) {

			data = data.data.count;

			$scope.mvalue = [];
			$scope.mlabels = [];

			for(var i = 0; i < data.length; i++) {

			    $scope.mvalue.push(data[i].count);	

			    var myDate= data[i].date;
			    myDate = myDate.split('T')[0];
			    $scope.mlabels.push(myDate);
			}
		}		
	});
})

.controller('tweettableCtrl', function (Tweet, $scope, $timeout, $route){ 

	var app = this;

	$scope.currentPage = 1;
	$scope.pageSize = 10;
	$scope.maxSize = 10;

	Tweet.getTweets().then(function (data) {
		if (data.data.success) {
			app.tweetsData = data.data.tweets;
		} else {
			data.errorMsg = 'No Tweets Found';
		}
	});

	app.getName = function (tweet) {
		$scope.screenName = '@' + tweet.screenname;
		$('#tweetModal').modal('show');
	};

	app.tweetSend = function (screenname, tweettext, valid) {
		
		app.successMsg = false;
		app.errorMsg = false;	

		if(valid) {
			var tweetObject = {};
			tweetObject.screenName = screenname;
			tweetObject.tweetText = tweettext;		
			
			Tweet.sendTweet(tweetObject).then(function (data) {
				if(data.data.success) {	

					app.successMsg = data.data.message;					
					$timeout(function(){
						app.successMsg = false;	
						hideModal(); // Close modal
						$route.reload();				
					}, 2000);
				} else {				
					app.errorMsg = data.data.message;					
				}
			});
		} else {
			app.errorMsg = 'Please ensure form is filled out properly';
		}
	};

	var hideModal = function () {
		$("#tweetModal").modal('hide');
	};

	app.reTweet = function (tweetId) {
		var tweetIds = {};
		tweetIds.tid = tweetId;

		Tweet.reTweet(tweetIds).then(function (data){
			app.successMssg = false;
			app.errorMssg = false;

			if(data.data.success) {
				app.successMssg = data.data.message
			} else {
				app.errorMssg = data.data.message;
			}
		});
	};

	app.likeTweet = function (tweetId) {
		var tweetIds = {};
		tweetIds.tid = tweetId;

		Tweet.likeTweet(tweetIds).then(function (data){
			app.successMssg = false;
			app.errorMssg = false;

			if(data.data.success) {
				app.successMssg = data.data.message
			} else {
				app.errorMssg = data.data.message;
			}
		});
	};
})

.filter('pagination', function() {
	return function (data, start) {
		if (!data || !data.length) { return; }
		return data.slice(start);
	};
})


.controller('tweetsCtrl', function (Tweet, $scope) {

	var app = this;
	app.successMsg = false;
	app.errorMsg = false;

	$scope.languages = ["en", "eu"];
	$scope.results = ["mixed", "recent", "popular"];

	function getTweest() {
		Tweet.getTweets().then(function (data) {
			if (data.data.success) {
				app.tweets = data.data.tweets;	
			} else {
				data.errorMsg = 'No Tweets Found';
			}
		});
	}

	getTweest();

	app.tweetCrawl = function (tweetKeyword) {

		Tweet.crawlTweets(app.tweetKeyword).then(function (data){

			if (data.data.success) {
				app.successMsg = data.data.message;
				$scope.languages = '';
				$scope.results = '';
				app.tweetKeyword.keyword = '';
				app.tweetKeyword.tweetLimit = '';
			} else {
				app.errorMsg = data.data.message;
			}		
		});
	};
});