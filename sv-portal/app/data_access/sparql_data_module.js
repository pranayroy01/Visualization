var sparql_data_module = function() {

    function sparqlProxyQuery(endpoint, query) {
        console.log(query);

        var promise = Ember.$.getJSON('http://localhost:3000/sparql-proxy/' + endpoint + "/" + encodeURIComponent(query));
        return promise.then(function(result) {
            console.log("SPARQL RESULT:");
            console.dir(result);
            return result;
        });
    }

    function simplifyURI(uri) {
        var splits = uri.split(/[#/:]/);
        return splits[splits.length - 1];
    }


    function read(location) {
        // lese die daten<=>graph Y aus dem sparql endpoint X ein
        // ergebnis der Query ist ein resultset

        // evtl instanzen für die preview

        // return liste klassen und properties
        var graph = location.graph;
        var endpoint = encodeURIComponent(location.endpoint);
        var classQuery = '\n\
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\
            SELECT DISTINCT ?class ?classLabel ?property ?propertyLabel WHERE {\n\
                GRAPH <' + graph + '> {\n\
                    ?x rdf:type ?class .\n\
                    OPTIONAL {\n\
                        ?class rdfs:label ?classLabel .\n\
                    } .\n\
                    OPTIONAL {\n\
                        ?x ?property ?y .\n\
                        OPTIONAL {\n\
                            ?property rdfs:label ?propertyLabel .\n\
                        }\n\
                    }\n\
                }\n\
            }';

        return sparqlProxyQuery(endpoint, classQuery).then(function(result) {
            var classInfo = {};

            for (var i = 0; i < result.length; i++) {
                var classURI = result[i].class.value;

                var classLabel = (result[i].classLabel || {}).value;
                if (!classLabel) {
                    classLabel = simplifyURI(classURI);
                }

                var classEntry = classInfo[classURI];
                if (!classEntry) {
                    classEntry = {
                        label: classLabel,
                        id: classURI,
                        properties: {}
                    };

                    classInfo[classURI] = classEntry;
                }

                if (!result[i].property) {
                    continue;
                }

                var propertyURI = result[i].property.value;
                var propertyLabel = (result[i].propertyLabel || {}).value;
                if (!propertyLabel) {
                    propertyLabel = simplifyURI(propertyURI);
                }

                classEntry.properties[propertyURI] = {
                    label: propertyLabel,
                    id: propertyURI
                }
            }

            console.dir(classInfo);
            console.log("ARRAY");
            // console.dir(_.values(classInfo)); //wandelt die map in ein array um/ underscorejs
            var array = _.values(classInfo);
            return array;
        });
    }

    function parse(location, selectedClass, queryOptions) {
        // retrun input für widgets d.h. genereriere tabellarische daten 
        // berücksichtige dabei die dimensions belegung

        var dimensions = queryOptions.dimension;
        var multidimension = queryOptions.multidimension.property;
        var group = queryOptions.group.property;

        console.log("PARSE");
        console.dir(dimensions);
        console.dir(multidimension);
        console.dir(group);

        var graph = location.graph;
        var endpoint = encodeURIComponent(location.endpoint);

        var selectVariablesArray = [];

        var groupValuesQuery = '\n\
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\
            SELECT DISTINCT ?instance WHERE {\n\
                GRAPH <' + graph + '> {\n\
                   ?x rdf:type <' + selectedClass.id + '> .\n\
                   ?x <' + group.id + '> ?instance .\n\
                }\n\
            }';

        return sparqlProxyQuery(endpoint, groupValuesQuery).then(function(result) {
            var groupInstances = [];

            for (var i = 0; i < result.length; i++) {
                groupInstances.push(result[i].instance.value);
            }

            console.dir(groupInstances);

            return groupInstances;
        }).then(function(groupInstances) {

            var optionals = "";
            var selectVariables = "";

            var simplifiedDimURIs = [];
            for (var j = 0; j < dimensions.length; j++) {
                simplifiedDimURIs[j] = simplifyURI(dimensions[j].property.id);
                selectVariables += " ?" + simplifiedDimURIs[j];
                selectVariablesArray.push(simplifiedDimURIs[j]);
            }
            for (var i = 0; i < groupInstances.length; i++) {
                var simplifiedGroupInstURI = simplifyURI(groupInstances[i]);
                selectVariables += " ?" + simplifiedGroupInstURI;
                selectVariablesArray.push(simplifiedGroupInstURI);

                optionals += ' OPTIONAL \n';
                optionals += '\n\
                    {';

                optionals += '\n\
                    ?x' + i + ' rdf:type <' + selectedClass.id + '> .\n';

                for (var j = 0; j < dimensions.length; j++) {
                    optionals += '\n\
                       ?x' + i + ' <' + dimensions[j].property.id + '> ?y' + i + '.\n'

                    optionals += '\n\
                        ?y' + i + ' <http://www.w3.org/2000/01/rdf-schema#label>  ?' + simplifiedDimURIs[j] + '.\n'

                    optionals += '\n\
                        OPTIONAL {?x' + i + ' <' + dimensions[j].property.id + '> ?' + simplifiedDimURIs[j] + '.}\n';
                }

                optionals += '\n\
                        ?x' + i + ' <' + multidimension.id + '> ?' + simplifiedGroupInstURI + '.\n';
                optionals += '\n\
                        ?x' + i + ' <' + group.id + '> <' + groupInstances[i] + '>. \n\
             }\n';

            }

            var query = '\n\
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\
            SELECT DISTINCT ' + selectVariables + '\n\
            WHERE {\n\
                GRAPH <' + graph + '> {\n\
                    { ' + optionals + '}\n\
                }\n\
            }';

            return sparqlProxyQuery(endpoint, query);
        }).then(function(queryResult) {
            console.log('QUERY RESULT FOR WIDGET');
            console.dir(queryResult);
            var result = [];
            result.push(selectVariablesArray);
            for (var i = 0; i < queryResult.length; i++) {
                var object = queryResult[i];
                console.log(selectVariablesArray.length);
                var record = []
                for (var j = 0; j < selectVariablesArray.length; j++) {
                    var p = selectVariablesArray[j];
                    console.log('ITEM ' + j + ': ' + p + '=' + object[p].value);

                    var value = object[p].value;
                    var parsedValue;
                    if (object[p].type === "typed-literal" && object[p].datatype === "http://www.w3.org/2001/XMLSchema#string") {
                        // Don't try to parse strings
                        parsedValue = value;
                    } else {
                        var parsedValue = parseInt(value);
                        if (parsedValue === 'NaN') {
                            parsedValue = parseFloat(value.replace(',', ''));
                        }
                        if (parsedValue === 'NaN') {
                            parsedValue = value;
                        }
                    }
                    record.push(parsedValue);
                }
                result.push(record);

                for (var property in object) {
                    console.log('item ' + i + ': ' + property + '=' + object[property].value);
                }

            }
            console.log("RESULT");
            console.dir(result);

            return result;

        });

    }

    return {
        read: read,
        parse: parse,
    };
}();