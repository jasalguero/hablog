/******************************************************/
/*				INITS			            		  */
/******************************************************/
var HB = Em.Application.create({
});

HB.ready = function(){

}


/******************************************************/
/*				CONSTANTS							  */
/******************************************************/

HB.CONSTANTS = {
    PATH_CONTEXT : 'http://tech.piyush.purang.net/ppurang/blog',
    PATH_SEARCH : '/_search?q=title.content:*&sort=created.time:desc&pretty',
    PATH_EDIT: '/edit',

    PAGINATION:
    {
        SIZE: 10
    },

    SEARCH:
    {
        DEFAULT: '/_search',
        POST_LIST: "?q=title.content:*&sort=created.time:desc&size=%@1",
        TAG_FILTER: {
            facets : {
                tags : { terms : {field : 'state'} }
            }
        }

    }
};

/******************************************************/
/*				MODEL								  */
/******************************************************/

// POST ITEM
HB.Post = Em.Object.extend({
    uid:null,
    title:null,
    headline:null,
    state:null,
    author:null,
    created:null,
    creationDay: function (){
        return moment(this.get('created')).format('DD');
    }.property('created'),
    creationMonth: function (){
        return moment(this.get('created')).format('MMM');
    }.property('created'),
    creationYear:function (){
        return moment(this.get('created')).format('YYYY');
    }.property('created'),
    summary:null,
    sections:null,
    tags:[],
    rating:null,
    comments:null,
    commentsCount: function(){
        var total = 0;
        var commentsArray = this.get('comments');
        var commentsLength = commentsArray.length;
        for (var i = 0; i < commentsLength; ++i) {
            if (i in commentsArray) {
                var comment = commentsArray[i];
                total = total + comment.get('totalReplies') + 1;
            }
        }
        return total;
    }.property('comments')
});

// SECTION ITEM
HB.Section = Em.Object.extend({
    text:null,
    headline:null
});

// COMMENT ITEM
HB.Comment = Em.Object.extend({
    user:null,
    text:null,
    created: moment().subtract('years', 100),
    createdAgo: function(){
        return (this.get('created').fromNow());
    }.property('created'),
    rating:null,
    replies:[],
    totalReplies:0
});

// RATING COMPONENT
HB.Rating = Em.Object.extend({
    likes:0,
    dislikes:0
});

HB.Tag = Em.Object.extend({
    name: null,
    count: 0
})

/******************************************************/
/*				CONTROLLERS							  */
/******************************************************/

// Define the main application controller. This is automatically picked up by
// the application and initialized.
HB.ApplicationController = Em.Controller.extend({
    currentSection: null
});

// POST LIST CONTROLLER
HB.PostListController = Em.ArrayController.extend({
    //container with the list of posts
    content:[],

    //add a new post to the list checking that it was not previously there and ordered by creationg date
    addPost:function (post) {
        //console.log(post);
        // Check to see if there are any post in the controller with the same uid already
        var exists = this.filterProperty('uid', post.uid).length;
        if (exists === 0) {
            // If no results are returned, we insert the new item into the data controller in order of publication date
            var length = this.get('length'), idx;
            idx = this.binarySearch(Date.parse(post.created), 0, length);
            this.insertAt(idx, post);
            return true;
        }
    },
    // Binary search implementation that finds the index where a entry
    // should be inserted when sorting by date.
    binarySearch:function (value, low, high) {
        var mid, midValue;
        if (low === high) {
            return low;
        }
        mid = low + Math.floor((high - low) / 2);
        midValue = Date.parse(this.objectAt(mid).created);

        if (value < midValue) {
            return this.binarySearch(value, mid + 1, high);
        } else if (value > midValue) {
            return this.binarySearch(value, low, mid);
        }
        return mid;
    },

    recentPosts: function(){
        return this.get('content').slice(0,4);
    }.property('content')
});

// Define the main application controller. This is automatically picked up by
// the application and initialized.
HB.PostController = Em.ObjectController.extend({
});

HB.TagController = Em.ArrayController.extend({
    content: null,

    sortProperties: ['count'],

    init: function(){
        this._super();
        HB.datasource.getTagsFromServer();
    }
})

/******************************************************/
/*				VIEWS								  */
/******************************************************/
// View for the Post list
HB.PostListView = Em.View.extend({
    templateName:'postList'
});

//View for the single Post
HB.PostView = Em.View.extend({
    templateName:'post'
});

HB.ApplicationView = Em.View.extend({
    templateName: 'application',
    //Theme UI initialization if needed after the application view rendered the basic template
    didInsertElement: function(){
        theme_initialize();
    }
});


/******************************************************/
/*				ROUTER								  */
/******************************************************/

HB.Router = Em.Router.extend({
    root: Em.Route.extend({
        index: Em.Route.extend({
            route: '/',
            redirectsTo: 'posts'
        }),
        showMain: function(router, context) {
            console.log("routing to main page");
            router.transitionTo('posts');
        },
        posts: Em.Route.extend({
            route: '/posts',
            showPost: Em.Route.transitionTo('post'),
            connectOutlets: function(router) {
                router.get('applicationController').connectOutlet('postList');
                router.get('applicationController').set('currentSection', null);
            }
        }),
        post: Em.Route.extend({
            route: '/posts/:uid',
            connectOutlets: function(router, post) {
                console.log("redirecting to post")
                var targetPost = HB.postListController.findProperty('uid', post.uid);
                if (Em.none(targetPost)){
                    //go to main page if the post doesn't exist
                    router.transitionTo('posts');
                }else{
                    router.get('applicationController').connectOutlet('post', targetPost);
                    router.get('applicationController').set('currentSection', targetPost.get('title'));
                }
            }
        })
    })
});


/******************************************************/
/*				DATASOURCE			    			  */
/******************************************************/
HB.datasource = Em.Object.create({

    /**
     * Load posts from the server
     */
    getItemsFromServer : function () {
        $.ajax({
            url:HB.CONSTANTS.PATH_CONTEXT+HB.CONSTANTS.SEARCH.DEFAULT + HB.CONSTANTS.SEARCH.POST_LIST.fmt(HB.CONSTANTS.PAGINATION.SIZE),
            async:true,
            dataType:'json',
            success: function(data) {
                // Use map to iterate through the items and create a new JSON object for
                // each item

                //TODO: MAKE SAFE
                var results = data.hits.hits;
                results.map(function(item) {

                    var post = HB.CreatePostFromJSon(item._source);

                    HB.postListController.addPost(post);
                });
                console.log("Finished loading");
            }
        });
    },

    getTagsFromServer: function(){
        $.ajax({
            url:HB.CONSTANTS.PATH_CONTEXT+HB.CONSTANTS.SEARCH.DEFAULT.fmt(HB.CONSTANTS.PAGINATION.SIZE),
            async:true,
            data: JSON.stringify(HB.CONSTANTS.SEARCH.TAG_FILTER),
            type: 'POST',
            dataType:'json',
            success: function(data) {
                console.log(data);
                if(HB.PropertyExists(data, 'facets.tags.terms')){
                    var results = data.facets.tags.terms;
                    var tags = results.map(function(item){
                        if (HB.PropertyExists(item,'term'))
                        {
                            debugger;
                            var tag = HB.Tag.create();
                            tag.set('name',item.term);
                            tag.set('count',item.count);
                            return tag;
                        }

                    });

                    HB.get('router.tagController').set('content',tags);
                }

            }
        });
    }

});


/******************************************************/
/*				UTILITIES			    			  */
/******************************************************/

HB.Utilities = {
    Showdown : null
}


HB.CreatePostFromJSon = function (item){

    var post = HB.Post.create();
    post.set('uid', item.uid);
    post.set('headline', HB.Utilities.Showdown.makeHtml(item.headline.content));
    post.set('title', HB.Utilities.Showdown.makeHtml(item.title.content));
    post.set('author', item.author);
    post.set('summary', HB.Utilities.Showdown.makeHtml(item.summary.content));
    post.set('sections', HB.ParseSections(item.content));
    post.set('tags', item.tags);
    post.set('comments', HB.ParseComments(item.comments));
    post.set('created', moment(item.created.time));

    return post;
}


HB.InitializeMarkdownParser = function () {
    HB.Utilities.Showdown = new Showdown.converter();
};

HB.ParseSections = function(jsonContent){
    var sections = [];

    jsonContent.map(function(item){
        var section = HB.Section.create({
            text: item.text === undefined ? null : item.text.content === undefined ? null : HB.Utilities.Showdown.makeHtml(item.text.content),
            headline : item.headline === undefined ? null : item.headline.content === undefined ? null : HB.Utilities.Showdown.makeHtml(item.headline.content)

        });
        sections.push(section);
    });
    return sections;
}

HB.ParseComments = function (jsonContent){
    var comments = [];
    jsonContent.map(function(item){
        var comment = HB.Comment.create({
            uid:item.uid,
            text:item.text,
            created: item.created.time === undefined ? moment().subtract('years', 100) : moment(item.created.time),
            rating: HB.Rating.create({
                likes: item.rating === undefined ? 0 : item.rating.likes === undefined ? 0 : item.rating.likes,
                dislikes: item.rating === undefined ? 0 : item.rating.dislikes === undefined ? 0 : item.rating.dislikes
            }),
            replies: HB.ParseComments(item.replies),
            totalReplies: function(){
                var total = 0;
                var commentReplies = this.get('replies')
                var repliesLength = commentReplies.length
                for (var i = 0; i < repliesLength; ++i) {
                    if (i in commentReplies) {
                        var reply = commentReplies[i];
                        total = total + reply.get('totalReplies') + 1;
                    }
                }
                return total;
            }.property()
        });
        comments.push(comment);
    });

    return comments;
};

/**
 * Check if the nested property of an object exists
 * @param obj
 * @param prop
 * @return {boolean}
 */
HB.PropertyExists = function test(obj, prop) {
    var parts = prop.split('.');
    for(var i = 0, l = parts.length; i < l; i++) {
        var part = parts[i];
        if(obj !== null && typeof obj === "object" && part in obj) {
            obj = obj[part];
        }
        else {
            return false;
        }
    }
    return true;
}


$(function() {
    HB.InitializeMarkdownParser();
    HB.postListController = HB.PostListController.create();
    HB.datasource.getItemsFromServer();
    HB.initialize();
});
