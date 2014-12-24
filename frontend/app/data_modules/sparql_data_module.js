var sparql_data_module = function () {

    function sparqlProxyQuery(endpoint, query) {
        var promise = Ember.$.getJSON('http://localhost:3002/sparql-proxy/' + endpoint + "/" + encodeURIComponent(query));
        return promise.then(function (result) {
            console.log("SPARQL DATA MODULE - SPARQL QUERY RESULT");
            console.dir(result);
            return result;
        });
    }

    function simplifyURI(uri) {
        var splits = uri.split(/[#/:]/);
        return splits[splits.length - 1];
    }

    function queryData(_location, _class, _properties) {
        if (_class) {
            return queryProperties(_location, _class, _properties);
        } else {
            return queryClasses(_location);
        }
    }

    function queryClasses(_location) {
        var graph = _location.graph;
        var endpoint = encodeURIComponent(_location.endpoint);
        var query = "";

        query += 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>';
        query += 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>';

        query += 'SELECT DISTINCT ?class ?classLabel ';
        query += 'WHERE ';
        query += '{';
        query += ' GRAPH <' + graph + '>';
        query += ' {';
        query += '  SELECT ?class ?classLabel COUNT(?x) as ?classSize';
        query += '  WHERE';
        query += '  {';
        query += '   ?x rdf:type ?class .';
        query += '   ?x ?property ?y .';
        query += '   OPTIONAL';
        query += '   {';
        query += '    ?class rdfs:label ?classLabel .';
        query += '   }';
        query += '  }';
        query += ' }';
        query += '}';
        query += 'ORDER BY DESC(?classSize)';

        console.log("SPARQL DATA MODULE - QUERY CLASSES");
        console.dir(query);

        return sparqlProxyQuery(endpoint, query).then(function (result) {
            var classes = [];
            for (var i = 0; i < result.length; i++) {
                var classURI = result[i].class.value;

                var classLabel = (result[i].classLabel || {}).value;
                if (!classLabel) {
                    classLabel = simplifyURI(classURI);
                }

                classes.push({
                    id: classURI,
                    label: classLabel
                });

            }
            return classes;
        });
    }

    function queryProperties(_location, _class, _properties) {
        var graph = _location.graph;
        var endpoint = encodeURIComponent(_location.endpoint);

        var query = "";

        query += 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ';
        query += 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ';

        query += 'SELECT DISTINCT ?property ?propertyLabel ?propertyType ';
        query += 'WHERE ';
        query += '{';
        query += ' GRAPH <' + graph + '>';
        query += ' {';
        query += '  ?x0 rdf:type <' + _class + '> .';

        for (var i = 0; i < _properties.length; i++) {
            query += '  ?x' + i + ' <' + _properties[i] + '> ?x' + (i + 1) + ' .';
        }

        query += '  ?x' + _properties.length + ' ?property ?z .';
        //query += '{ SELECT ?z WHERE { ?x0 ?property ?z. } LIMIT 1 }';
        query += '  OPTIONAL';
        query += '  {';
        query += '   ?property rdfs:label ?propertyLabel .';
        query += '   ?property a          ?propertyType  .';
        query += '  }';

        query += '  }';
        query += '} GROUP BY ?property';

        console.log("SPARQL DATA MODULE - QUERY PROPERTIES: ");
        console.dir(query);

        return sparqlProxyQuery(endpoint, query).then(function (result) {
            var properties = [];
            var literalProperties = [];
            for (var i = 0; i < result.length; i++) {

                if (!result[i].property) {
                    continue;
                }

                var propertyURI = result[i].property.value;
                var propertyLabel = (result[i].propertyLabel || {}).value;
                var propertyType = (result[i].propertyType || {}).value;

                if (!propertyLabel) {
                    propertyLabel = simplifyURI(propertyURI);
                }

                if (!propertyType || propertyType.indexOf("Object") > -1) {

                    properties.push({
                        id: propertyURI,
                        label: propertyLabel,
                        datatype: "nothing"
                    });
                } else {
                    literalProperties.push([propertyURI, propertyLabel]);
                }
            }

            if (literalProperties.length === 0) {
                return properties;
            } else {

                var queryType = "";
                queryType += 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ';
                queryType += 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ';
                queryType += 'SELECT DISTINCT ';   //?property ?propertyLabel ?propertyType ';
                for (var k = 0; k < literalProperties.length; k++) {
                    queryType += '?z' + k + ' ';
                }
                queryType += 'WHERE ';
                queryType += '{';
                queryType += ' GRAPH <' + graph + '>';
                queryType += ' {';
                for (var k = 0; k < literalProperties.length; k++) {
                    queryType += '?x' + k + ' <' + literalProperties[k][0] + '> ?z' + k + '. ';
                }
                queryType += ' }';
                queryType += '} LIMIT 1';

                console.log("QUERY for datatypes");
                console.log(queryType);

                return sparqlProxyQuery(endpoint, queryType).then(function (types) {
                    //size(types[0])= size(literalProperties)
                    var count = 0;
                    for (var typeIndex in types[0]) {
                        var type = types[0][typeIndex];
                        if (type.datatype) {
                            //numerical
                            properties.push({
                                id: literalProperties[count][0],
                                label: literalProperties[count][1],
                                datatype: "numerical"
                            });
                        } else {
                            //categorical
                            properties.push({
                                id: literalProperties[count][0],
                                label: literalProperties[count][1],
                                datatype: "categorical"
                            });
                        }
                        count++;
                    }
                    return properties;
                });
            }
            //return properties;
        });

    }

    function parse(location, selection) {
        var dimension = selection.dimension;
        var multidimension = selection.multidimension;
        var group = selection.group;
        var result = null;

        if (group.length > 0) {
            //CASE 1: dimension and grouped multidimension -> 1 dim; 1 mdim; just 1 group value;
            result = query_group(location, dimension, multidimension, group);

        } else {
            //CASES 2: dimension and/or multidimension -> 1 dim; 1..n mdim; 
            var dimension_ = dimension.concat(multidimension);
            result = query(location, dimension_);
        }
        console.log('SPARQL DATA MODULE - PARSED RESULT');
        console.dir(result);

        return result;
    }

    function query_group(location, dimension, multidimension, group) {
        var graph = location.graph;
        var endpoint = encodeURIComponent(location.endpoint);
        var dimension = dimension[0];
        var multidimension = multidimension[0];
        var group = group[0];
        var class_ = multidimension.parent[0];
        var columnHeaders = [];
        var selectedVariablesArray = [];
        var optionals = "";
        var selectVariables = "";

        return group_by(endpoint, graph, group).then(function (groupInstances) {
            selectVariables += " ?d";
            selectedVariablesArray.push("d");
            columnHeaders.push(dimension.label);

            for (var i = 0; i < groupInstances.length; i++) {
                var groupInstance = groupInstances[i];
                selectVariables += " ?z" + i;
                columnHeaders.push(groupInstance.label);
                selectedVariablesArray.push("z" + i);

                optionals += '\nOPTIONAL {\n';
                optionals += ' ?x' + i + ' rdf:type <' + class_ + '> .\n';
                optionals += ' ?x' + i + ' <' + dimension.id + '> ?d.\n';
                optionals += ' ?x' + i + ' <' + multidimension.id + '> ?z' + i + '.\n';
                optionals += ' ?x' + i + ' <' + group.id + '> <' + groupInstance.id + '>.\n';
                optionals += '}\n';
            }

            var query = '\n\
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\
            SELECT DISTINCT ' + selectVariables + '\n\
            WHERE {\n\
                GRAPH <' + graph + '> {\n\
                    ' + optionals + '\n\
                }\n\
            }';

            console.log('SPARQL DATA MODULE - QUERY FOR GROUPES');
            console.dir(query);

            return sparqlProxyQuery(endpoint, query);
        }).then(function (queryResult) {
            return convert(queryResult, columnHeaders, selectedVariablesArray);
        });

    }

    function group_by(endpoint, graph, groupProperty) {
        var class_ = groupProperty.parent[0];

        var groupValuesQuery = '\n\
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\
            SELECT DISTINCT ?instance WHERE {\n\
             GRAPH <' + graph + '> {\n\
              ?x rdf:type <' + class_ + '> .\n\
              ?x <' + groupProperty.id + '> ?instance .\n\
              { \n\
               SELECT ?label WHERE { \n\
                ?instance rdfs:label ?label \n\
               } LIMIT 1 \n\
              }\n\
             }\n\
            } ORDER BY ASC(?instance)';

        return sparqlProxyQuery(endpoint, groupValuesQuery).then(function (result) {
            var groupInstances = [];

            for (var i = 0; i < result.length; i++) {
                var instance = result[i].instance.value;
                var label = (result[i].label || {}).value || simplifyURI(instance);

                groupInstances.push({
                    id: instance,
                    label: label,
                    parent: [class_, groupProperty.id]
                });
            }
            return groupInstances;
        });
    }

    function query(location, dimensions) {
        var graph = location.graph;
        var endpoint = encodeURIComponent(location.endpoint);
        var columnHeaders = [];
        var optionals = "";
        var selectVariables = "";
        var selectedVariablesArray = [];
        var class_ = dimensions[0].parent[0];

        var nameExists = {}

        for (var i = 0; i < dimensions.length; i++) {
            var dimension = dimensions[i];
            var path = dimension.parent;

            selectVariables += " ?z" + i;
            var header;
            if (!nameExists[dimension.label]) {
                header = dimension.label;
            } else {
                header = dimension.label + " " + i;
            }
            nameExists[header] = true;
            columnHeaders.push(header);
            selectedVariablesArray.push("z" + i);

            for (var j = 1; j < path.length; j++) {
                if (j < path.length - 1) {
                    optionals += '\n\
                    ?x' + (j - 1) + ' <' + path[j] + '> ?x' + j + '.\n';
                } else {
                    optionals += '\n\
                    ?x' + (j - 1) + ' <' + path[j] + '> ?z' + i + '.\n';
                }
            }
        }

        var query = '\n\
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\
            SELECT DISTINCT ' + selectVariables + '\n\
            WHERE {\n\
                GRAPH <' + graph + '> {\n\
                     ?x0' + ' rdf:type <' + class_ + '>.\n\
                     ' + optionals + '\n\
                }\n\
            }';

        console.log('SPARQL DATA MODULE - DATA QUERY FOR VISUALIZATION CONFIGURATION');
        console.dir(query);

        return sparqlProxyQuery(endpoint, query).then(function (queryResult) {
            return convert(queryResult, columnHeaders, selectedVariablesArray);
        });
    }

//    function queryExampleData(location, parent) {
//
//        var endpoint = encodeURIComponent(location.endpoint);
//        var columnHeaders = [];
//        var _class = parent[0];
//        var property = parent[parent.length - 1];
//        columnHeaders.push(simplifyURI(property));
//        var selectedVariablesArray = [];
//
//        selectedVariablesArray.push('x');
//        var query = '\n\
//            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\
//            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\
//            SELECT DISTINCT ?x \n\
//            WHERE {\n\
//                GRAPH <' + location.graph + '> {\n\
//                     ?x0' + ' rdf:type <' + _class + '>.\n\
//                     ?x0 <' + property + '> ?x.\n\
//                     <' + property + '> rdf:type <http://www.w3.org/2002/07/owl#DatatypeProperty> \n\
//                }\n\
//            }\n\
//            LIMIT 2';
//        // a demand of a datatype property could be possibly omitted
//        // limit an output to 2 values
//
//        console.log('SPARQL DATA MODULE - DATA QUERY FOR VISUALIZATION CONFIGURATION');
//        console.dir(query);
//        return sparqlProxyQuery(endpoint, query).then(function (queryResult) {
//            console.log("DONE");
//            return convert(queryResult, columnHeaders, selectedVariablesArray);
//        });
//
//    }

    function convert(queryResults, columnHeaders, selectedVariablesArray) {
        var result = [];
        result.push(columnHeaders);
        for (var i = 0; i < queryResults.length; i++) {
            var queryResult = queryResults[i];
            var record = [];
            for (var j = 0; j < selectedVariablesArray.length; j++) {
                var p = selectedVariablesArray[j];
                var val = (queryResult[p] || {}).value;
                if (_.isUndefined(val)) {
                    record.push(null);
                    continue;
                }
                var value = simplifyURI(val);
                record.push(toScalar(value));
            }
            result.push(record);
        }
        return result;
    }

    return {
        queryData: queryData,
        parse: parse
    };
}(); 