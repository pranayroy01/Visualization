function templateMapping(editObject) {
    //the input object might be the result of the recommendation algorithm
    //or the JSON with changed template data, i.e. {tuningOptions:{height:500}}

    var tuningOptions = null;
        var structureOptions = null;
        var resultMapping = {
            mappingsTuning: [],
            mappingsStructure: [],
            configuration: {}
        };
    
        //Assuming there is a baseofmappings {option: template}
        var mapDB = {
            "dimensions": "dimension-area",
            "width": "tuningWidth",
            "height":"tuningHeight",
            "background_color": "tuningBckGrndColor",
            "hLabel":"tuningHorizontalLabel",
            "vLabel":"tuningVerticalLabel",
            "numGridlinesHor":"tuningGridLinesHorizontal",
            "numGridlinesVer":"tuningGridLinesVertical",
            "ticks":"tuningTicks",
            "widthPx":"tuningWidthPx",
            "widthRatio":"tuningWidthRatio"
        };

        //retrieving the fields
        if (editObject.hasOwnProperty("tuningOptions")) {
            tuningOptions = editObject["tuningOptions"];
        }

        if (editObject.hasOwnProperty("structureOptions")) {
            structureOptions = editObject["structureOptions"];
        }

        //invoking an appropriate template for a tuning parameter
        if (tuningOptions !== null) {
            for (var prop in tuningOptions) {
                if (tuningOptions.hasOwnProperty(prop)) {
                    if (typeof(tuningOptions[prop]) !== 'object') {
                        resultMapping.mappingsTuning.push({
                            template: mapDB[prop],
                            options: {
                                label: prop,
                                value: tuningOptions[prop]
                            }
                        });
                        //invokeTemplate(prop, tuningOptions[prop]);
                    } else {
                        var axisOptions = tuningOptions[prop];
                        for (var axisprop in axisOptions) {
                            resultMapping.mappingsTuning.push({
                            template: mapDB[axisprop],
                            options: {
                                label: axisprop,
                                value: axisOptions[axisprop]
                            }
                        });
                            //invokeTemplate(axisprop, axisOptions[axisprop]);
                        }
                    }
                }
            }
        }
    
    
        //invoking an appropriate template for a dimension parameter
        if (structureOptions !== null) {
            var dimensions = structureOptions['dimensions'];
        
            /*building the configuration object
             * { xAxis : [],
             *   yAxis:  []
             * }  
             */
            for (var prop in dimensions) {
                resultMapping.configuration[prop]=dimensions[prop].values;
            
                resultMapping.mappingsStructure.push({
                    template: mapDB['dimensions'],
                    options: {
                        label: prop,
                        value: resultMapping.configuration[prop]
                    }
                });
                //invokeTemplate(prop, dimensions[prop]);
            }
        }
    
        return resultMapping;


};



