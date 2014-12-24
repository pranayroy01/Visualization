var tree_data = function () {

    /* first level: data source
     *  second level: csv dummy or classes 
     *  third ... n level: class properties or columns
     *  Iterate over subsets (in case of csv is just one subset; in case of RDF the subset are the classes */
    function create(datasource) {
        console.log('Creating tree content ...');
        console.dir(datasource);

        var treeContent = Ember.Object.create({
            label: 'ROOT',
            children: [],
            type: 'root',
            getChildren: function (node) {
                return node.children;
            },
            data: {}
        });

        var node = Ember.Object.create({
            label: datasource.name,
            expanded: true,
            draggable: "false",
            children: [],
            type: "datasource",
            getChildren: function (node) {
                var result = DS.PromiseArray.create({
                    promise: getNodeChildren(node)
                });
                return result;
            },
            data: {
                parent: [],
                label: datasource.name,
                location: datasource.location,
                format: datasource.format
            }
        });
        treeContent.children.push(node);

        return treeContent;
    }

    function branch(node, subsets, parent, format, location) {
        var children = [];

        for (var i = 0; i < subsets.length; i++) {
            var subset = subsets[i];
            children.push(Ember.Object.create({
                label: subset.label,
                expanded: (subsets.length === 1),
                draggable: (parent.length > 0) ? "true" : "false", // only properties are draggable, classes are not
                children: [],
                type: "item",
                parentNode: node,
                getChildren: function (node) {
                    var result = DS.PromiseArray.create({
                        promise: getNodeChildren(node).then(function (children) {
                            node.set('children', children);
                            return children;
                        })
                    });
                    return result;
                },
                data: {
                    parent: parent.concat([subset.id]),
                    id: subset.id,
                    label: subset.label,
                    format: format,
                    location: location,
                    datatype: subset.datatype //getNodeDatatype(parent.concat([subset.id]), format, location, subset.label, subset.id), - function call to get the type of a property                   
                }
            }));
        }

        return children;
    }

    function getDataModule(format) {
        switch (format) {
            case 'csv':
                return csv_data_module;
            case 'rdf':
                return sparql_data_module;
        }
        console.error("Unknown data format '" + format + "'");
        return null;
    }

    function getNodeChildren(node) {
        var data_module = getDataModule(node.data.format);
        var _class = node.data.parent[0];
        var _properties = node.data.parent.slice(1, node.data.parent.length);

        return data_module.queryData(node.data.location, _class, _properties).then(function (subsetInfo) {
            if (subsetInfo.length === 0) {
                node.isLeaf = true;
                return [];
            } else {
                var children = branch(node, subsetInfo, node.data.parent, node.data.format, node.data.location);
                return children;
            }
        });
    }

    function simplifyURI(uri) {
        var splits = uri.split(/[#/:]/);
        return splits[splits.length - 1];
    }

    function getNodeDatatype(parent, format, location, label, id) {

        //prepare service information
        var _class = parent[0];
        var data_module = getDataModule(format);
        var endpoint = location.endpoint;
        var graph = location.graph;

        //promise with a query result
        if (format === "rdf") {
            //request for two values of the parameter
            //sparql_data_module is engaged, check the function
            return data_module.queryExampleData(location, parent).then(function (result) {
                var columnsHeaders = result[0];
                var data = rows(result);
                console.log("QUERY RESULT FOR CONFIGURATION " + label);
                console.dir(data);

                //if smth returned can be converted to a data array then check for a type
                if (data.length > 0) {
                    var property = simplifyURI(parent[1]);
                    //todo: include a type comparison of two received values
                    //current approach for testing
                    if (typeof (data[0][property]) === "number") {
                        console.log("Datatype of " + label + " is numerical");
                        return "numerical";
                    }
//                } else if (Object.prototype.toString().call(data[0][property]) === '[object Date]') {
//                    return "numerical";
//                } 
                    else {
                        console.log("Datatype of " + label + " is categorical");
                        return "categorical";
                    }
                }
            });
        } else if (format === "csv") {
            //get two data rows from csv
            //csv_data_module is engaged, check the function
            return data_module.queryExampleData(location, [{id: id}]).then(function (receivedData) {
                //console.log("Data from tree data module "+receivedData);
                var dataRow = receivedData[1][id];
                if (typeof (dataRow) === "string") {
                    console.log("Datatype of " + label + " is categorical");
                    return "categorical";
                } else {
                    console.log("Datatype of " + label + " is numerical");
                    return "numerical";
                }
            });
        }

    }

    return {
        create: create
    };
}();

