(function ()
{
    'use strict';

    angular
        .module('app.core')
        .filter('filterByTags', filterByTags)
        .filter('filterByChangeItems', filterByChangeItems)
        .filter('filterSingleByTags', filterSingleByTags)
        .filter('filterChangeItems', filterChangeItems)
        .filter('filterByWhereUsedResolutionTasks',filterByWhereUsedResolutionTasks)
        .filter('groupBy',groupBy);


    /** @ngInject */
    function groupBy($parse) {
        return function (list, group_by) {

            var filtered = [];
            var prev_item = null;
            var group_changed = false;
            // this is a new field which is added to each item where we append "_CHANGED"
            // to indicate a field change in the list
            //was var new_field = group_by + '_CHANGED'; - JB 12/17/2013
            var new_field = 'group_by_CHANGED';

            // loop through each item in the list
            angular.forEach(list, function (item) {

                group_changed = false;

                // if not the first item
                if (prev_item !== null) {

                    // check if any of the group by field changed

                    //force group_by into Array
                    group_by = angular.isArray(group_by) ? group_by : [group_by];

                    //check each group by parameter
                    for (var i = 0, len = group_by.length; i < len; i++) {
                        if ($parse(group_by[i])(prev_item) !== $parse(group_by[i])(item)) {
                            group_changed = true;
                        }
                    }


                }// otherwise we have the first item in the list which is new
                else {
                    group_changed = true;
                }

                // if the group changed, then add a new field to the item
                // to indicate this
                if (group_changed) {
                    item[new_field] = true;
                } else {
                    item[new_field] = false;
                }

                filtered.push(item);
                prev_item = item;

            });

            return filtered;
        };
    }


    function filterByTags()
    {
        return function (items, idTags)
        {
            if ( (items||[]).length === 0 || (idTags||[]).length === 0 )
            {
                return items;
            }

            var filtered = [];

            items.forEach(function (item)
            {
                var match = idTags.every(function (tag)
                {
                    var tagExists = false;

                    item.idTags.forEach(function (itemTag)
                    {
                        if ( itemTag === tag)
                        {
                            tagExists = true;
                            return;
                        }
                    });

                    return tagExists;
                });

                if ( match )
                {
                    filtered.push(item);
                }
            });

            return filtered;
        };
    }

    function filterByChangeItems()
    {
        return function (tasks, idChangeItems)
        {
            if ( (tasks||[]).length === 0 || (idChangeItems||[]).length === 0 )
            {
                return tasks;
            }

            var filtered = [];

            tasks.forEach(function (task)
            {
                var match = idChangeItems.some(function (id)
                {
                    var taskExists = false;

                    task.idChangeItems.some(function(idItem){
                        if (id == idItem){
                            taskExists = true;
                        }

                        return taskExists;
                    });

                    return taskExists;
                });

                if ( match )
                {
                    filtered.push(task);
                }
            });

            return filtered;
        };
    }


    function filterChangeItems()
    {
        return function (changeItems, f)
        {
            f.modification = f.modification || false;
            if ( (changeItems||[]).length === 0 || (f.filters.idChangeItems||[]).length === 0 )
            {
                return changeItems;
            }

            var filtered = [];

            changeItems.forEach(function (item)
            {
                var match = f.filters.idChangeItems.some(function (id)
                {
                    return item.objectId == id;
                });

                if ( match )
                {
                    filtered.push(item);
                }
            });

            var mfiltered = [];

            if(f.modification){

                for (var property in f.filters.modifications) {

                    if (f.filters.modifications.hasOwnProperty(property)) {

                        if (f.filters.modifications[property] instanceof Array){

                            filtered.forEach(function (item)
                            {
                                var match = f.filters.modifications[property].some(function (id)
                                {
                                    return item.modificationMessage == id || item.modificationMessage == 'Revision change' ;
                                });

                                if ( match )
                                {
                                    mfiltered.push(item);
                                }
                            });

                        }

                    }

                }
            }

            if(mfiltered.length>0){
                filtered = mfiltered;
            }

            return filtered;
        };
    }

    function filterByWhereUsedResolutionTasks()
    {
        return function (products, idChangeItems)
        {
            if ( (products||[]).length === 0 || (idChangeItems||[]).length === 0 )
            {

                return products;
            }

            var filtered = [];
            //console.log('products : ', JSON.stringify(products));

            products.forEach(function (product)
            {
                var match = idChangeItems.some(function (id)
                {
                    //console.log('id : ', JSON.stringify(id));
                    //console.log('product : ', JSON.stringify(product));
                    var productExists = false;
                    angular.forEach(product.bomResponse,function(val,keys){
                        if(val.objectId === id)
                            productExists = true;
                    });

                    return productExists;
                });

                if ( match )
                {
                    filtered.push(product);
                   /* angular.forEach(products, function(value,key){
                        angular.forEach(product.whereUsedSet,function(V,k){
                            if(value.objectId === V){
                                    /!*console.log('whrerused : ', V);
                                 console.log('value.objectId : ', value.objectId);
                                 console.log('value : ', value);*!/
                                filtered.push(value);
                            }
                        });
                    });*/
                }
            });
            return filtered;
        };
    }

    /** @ngInject */
    function filterSingleByTags()
    {
        return function (itemTags, tags)
        {
            if ( itemTags.length === 0 || tags.length === 0 )
            {
                return;
            }

            if ( itemTags.length < tags.length )
            {
                return [];
            }

            var filtered = [];

            var match = tags.every(function (tag)
            {
                var tagExists = false;

                itemTags.forEach(function (itemTag)
                {
                    if ( itemTag.name === tag.name )
                    {
                        tagExists = true;
                        return;
                    }
                });

                return tagExists;
            });

            if ( match )
            {
                filtered.push(itemTags);
            }

            return filtered;
        };
    }

})();
