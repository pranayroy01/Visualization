/* input object
[
	{
		pattern: {xAxis: [[classURI1, xLabel, parentURI11, parentURI12, entityURI1]], - "year"
                          yAxis: [[classURI2, yLabel, parentURI21, parentURI22, entityURI2]], -"population"
                          group: [[classURI3, groupLabel, parentURI31, parentURI32, entityURI3]]  - "country"
                          } --- ["year","country"],"population"
		chart: "Column Chart"
	},
	{
		pattern: {xAxis: [[classURI1, xLabel, parentURI1,parentURI2,entityURI1]], - "country"
                          yAxis: [[classURI2, yLabel, parentURI3,parentURI4,entityURI2]], - "year"
                          groupBy: [],
                          addedSeries: []
                          } 
		chart: "Line Chart"
	},
        {
                pattern:{
                    xAxis: [[classURI1, xLabel, parentURI1,parentURI2,entityURI1]], 
                    yAxis: [[classURI2, yLabel, parentURI3,parentURI4,entityURI2]], 
                    groupBy: [],
                    addedSeries: []
                },
                chart: "Area Chart"
        },
        {
                pattern: {
                    xAxis: [[classURI1, xLabel, parentURI1,parentURI2,entityURI1]], - "country"
                    yAxis: [[classURI2, yLabel, parentURI3,parentURI4,entityURI2]], - "year"
                    group: [],
                    addedSeries: []
                },
                chart: "Scatter Chart"
        },
        {
                pattern: {
                    xAxis: [],
                    yAxis: [],
                    label: [],
                    color: [],
                    radius: []
                },
                chart: "Bubble Chart"
        },
        {
                pattern: {
                    measure: [],
                    slice: []
                },
                chart: "Pie Chart"
        },
        {
                pattern: {
                    lat: [],
                    long: [],
                    indicator: [],
                    label: []
                },
                chart: "Map"
        }
] */
function ranking(validPatterns)  {
    
    function finalLength(pattern)  {
        //count length of all pattern dimensions
            var len = 0;
            /*for (var i=0;i<pattern.length;i++){
                    if (Object.prototype.toString.call(pattern[i]) !=='[object Array]' ){
                            //if it is not an array
                            len ++;
                    } else {
                            //if subarray -  recursive function call
                            len+= finalLength(pattern[i]);
                    }
            }*/
            for (var property in pattern){
                len += pattern[property].length;
            }
            return len;
    };

    //comparator function for sort()
    function compare(a,b){
            return finalLength(a.pattern) - finalLength(b.pattern);
    };

//building the output

	//if input is empty => no valid allocations found
	if (validPatterns.length === 0){
		return "No valid patterns for the dataset";
	}

	//ranking - the larger the coverage the better
	var numAttributes = 3;
	var max = finalLength(validPatterns[0].pattern);

	//rank allocatoins
	validPatterns.sort(compare).reverse();

	//get necessary parameters		
	/*var ds_name = decodeURIComponent(req.query.name);
    var ds_location = decodeURIComponent(req.query.location);
    var ds_graph = decodeURIComponent(req.query.graph); // if rdf data source
    var ds_format = req.query.format;

    console.log('VISUALIZATION BACKEND: Retrieving recommendations for data source: ' + ds_name + ' ' + ds_location + ' ' + ds_format);
	*/
       
       
	//prepare infrastructure for building the configuration, test values
	var ds_model = null;
        var ds_name = "Newspaper Article Analysis";
        var ds_location = "http://localhost:8890/sparql";
        var ds_graph = "http://newspaper.org/articles_2007"; // if rdf data source
        var ds_format = "rdf";
        console.log('VISUALIZATION BACKEND: Retrieving recommendations for data source: ' + ds_name + ' ' + ds_location + ' ' + ds_format);

    if (ds_format === 'rdf') {
        ds_model = {
            name: ds_name,
            location: {endpoint: ds_location, graph: ds_graph},
            format: 'rdf'
        };
    }
    
    //prepare a configuration object for a top choice recommendation
    var configuration; 
    var dimensions = validPatterns[0].pattern;
    var dimensionValues = {};
        for (var dimension in dimensions){
            // get xAxis: [[classURI1, xLabel, parentURI11, parentURI12, entityURI1]]
            var axis = dimensions[dimension];
            var axisValues = [];
            
            for (var i=0; i<axis.length;i++){
                axisValues.push({
                    id: axis[i][0],
                    format: 'rdf',
                    label: axis[i][1],
                    location: {
                        endpoint: ds_location,
                        graph: ds_graph
                    },
                    parent: axis[i].slice(2)
                });
            }
            dimensionValues[dimension] = axisValues;
        }
    //build configuration for a top choice
    if (validPatterns[0].chart === "Line Chart") {
        //get plabels 
        var hLabel ="";
        var vLabel = "";
        for (var i= 0; i< dimensionValues['xAxis'].length; i++){
            hLabel += dimensionValues['xAxis'][i].label + " ";
        }
        for (var i= 0; i< dimensionValues['yAxis'].length; i++){
            vLabel += dimensionValues['yAxis'][i].label + " ";
        }
        
        
    	configuration  = {
    		id: 5345342,
	        name: "Line Chart",
	        thumbnail: "http://localhost:3002/thumbnails/line_chart.png",
	        structureOptions: {
	            dimensions: {
	                xAxis: {
	                    label: "Drag & drop a ordinal value",
	                    //value: [],
                            value: dimensionValues['xAxis'],
	                    metadata: {
	                        types: ["dates or ", "other continuous values such as distances"]
	                    }
	                },
	                yAxis: {
	                    label: "Drag & drop a measure",
	                    value: dimensionValues['yAxis'],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                orderBy: {
	                    label: "Order by",
	                    value: dimensionValues['orderBy'],
	                    metadata: {
	                        types: ["ordinal value "]
	                    }
	                },
	                addedSeries: {
	                    label: "Drag & drop additional series",
	                    value: dimensionValues['addedSeries'],
	                    metadata: {
	                        types: ["any"]
	                    }
	                }
	            }
	        },
	        layoutOptions: {
	            axis: {
	                hLabel: {
	                    label: "Horizontal Label",
	                    value: hLabel,
	                    metadata: {
	                        types: ["string"]
	                    }
	                }, vLabel: {
	                    label: "Vertical Label",
	                    value: vLabel,
	                    metadata: {
	                        types: ["string"]
	                    }
	                }, ticks: {
	                    label: "Ticks",
	                    value: 10,
	                    metadata: {
	                        types: ["number"]
	                    }
	                }, tooltip: {
	                    label: "Show Tooltip",
	                    value: true,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }, gridlines: {
	                    label: "Gridlines",
	                    value: true,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }
	            }
	        },
	        datasource: ds_model
    	};
    } else if (validPatterns[0].chart === "Column Chart") {
        var hLabel ="";
        var vLabel = "";
        for (var i= 0; i< dimensionValues['xAxis'].length; i++){
            hLabel += dimensionValues['xAxis'][i].label + " ";
        }
        for (var i= 0; i< dimensionValues['yAxis'].length; i++){
            vLabel += dimensionValues['yAxis'][i].label + " ";
        }
        
    	configuration = {
    		id: 282534,
	        name: "Column Chart",
	        thumbnail: "http://localhost:3002/thumbnails/column_chart.png",
	        structureOptions: {
	            dimensions: {
	                xAxis: {
	                    label: "Drag & drop categories",
	                    value: dimensionValues['xAxis'],
	                    metadata: {
	                        types: ["string"]
	                    }
	                }, yAxis: {
	                    label: "Drag & drop a measure",
	                    value: dimensionValues['yAxis'],
	                    metadata: {
	                        types: ["number"]
	                    }
	                }, group: {
	                    label: "Group by",
	                    value: dimensionValues['group'],
	                    metadata: {
	                        types: ["any"]
	                    }
	                }, stackedGroup: {
	                    label: "Build stacked groups by",
	                    value: dimensionValues['stackedGroup'],
	                    metadata: {
	                        types: ["any"]
	                    }
	                }
	            }
	        },
	        layoutOptions: {
	            axis: {
	                hLabel: {
	                    label: "Horizontal Label",
	                    value: hLabel,
	                    metadata: {
	                        types: ["string"]
	                    }
	                }, vLabel: {
	                    label: "Vertical Label",
	                    value: vLabel,
	                    metadata: {
	                        types: ["string"]
	                    }
	                }, widthRatio: {
	                    label: "Bar Width",
	                    value: 0.5,
	                    metadata: {
	                        types: ["number"]
	                    }
	                }, gridlines: {
	                    label: "Show Gridlines",
	                    value: true,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }, tooltip: {
	                    label: "Show Tooltip",
	                    value: true,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }, horizontal: {
	                    label: "Draw horizontally",
	                    value: false,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }
	            }
	        },
	        datasource: ds_model
    	};
    } else if (validPatterns[0].chart === "Area Chart") {
        var hLabel ="";
        var vLabel = "";
        for (var i= 0; i< dimensionValues['xAxis'].length; i++){
            hLabel += dimensionValues['xAxis'][i].label + " ";
        }
        for (var i= 0; i< dimensionValues['yAxis'].length; i++){
            vLabel += dimensionValues['yAxis'][i].label + " ";
        }
        
    	configuration = {
    		id: 386595,
	        name: "Area Chart",
	        thumbnail: "http://localhost:3002/thumbnails/area_chart.png",
	        structureOptions: {
	            dimensions: {
	                xAxis: {
	                    label: "Drag & drop a ordinal value",
	                    value: dimensionValues['xAxis'],
	                    metadata: {
	                        types: ["dates or ", "other continuous values such as distances"]
	                    }
	                },
	                yAxis: {
	                    label: "Drag & drop a measure",
	                    value: dimensionValues['yAxis'],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                orderBy: {
	                    label: "Order by",
	                    value: dimensionValues['orderBy'],
	                    metadata: {
	                        types: ["ordinal value "]
	                    }
	                },
	                addedSeries: {
	                    label: "Drag & drop additional series",
	                    value: dimensionValues['addedSeries'],
	                    metadata: {
	                        types: ["any"]
	                    }
	                }
	            }
	        },
	        layoutOptions: {
	            axis: {
	                hLabel: {
	                    label: "Horizontal Label",
	                    value: hLabel,
	                    metadata: {
	                        types: ["string"]
	                    }
	                }, vLabel: {
	                    label: "Vertical Label",
	                    value: vLabel,
	                    metadata: {
	                        types: ["string"]
	                    }
	                }, ticks: {
	                    label: "Ticks",
	                    value: 10,
	                    metadata: {
	                        types: ["number"]
	                    }
	                }, tooltip: {
	                    label: "Show Tooltip",
	                    value: true,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }, gridlines: {
	                    label: "Gridlines",
	                    value: true,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }
	            }
	        },
	        datasource: ds_model
    	};
    } else if (validPatterns[0].chart === "Bubble Chart") {
        var hLabel ="";
        var vLabel = "";
        for (var i= 0; i< dimensionValues['xAxis'].length; i++){
            hLabel += dimensionValues['xAxis'][i].label + " ";
        }
        for (var i= 0; i< dimensionValues['yAxis'].length; i++){
            vLabel += dimensionValues['yAxis'][i].label + " ";
        }
        
    	configuration = {
    		id: 3144372,
	        name: "Bubble Chart",
	        thumbnail: "http://localhost:3002/thumbnails/bubble_chart.png",
	        structureOptions: {
	            dimensions: {
	                label: {
	                    label: "Label",
	                    value: dimensionValues['label'],
	                    metadata: {
	                        types: ["string"]
	                    }
	                },
	                xAxis: {
	                    label: "Horizontal Axis",
	                    value: dimensionValues['xAxis'],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                yAxis: {
	                    label: "Vertical Axis",
	                    value: dimensionValues['yAxis'],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                color: {
	                    label: "Color",
	                    value: dimensionValues['color'],
	                    metadata: {
	                        types: ["string"]
	                    }
	                },
	                radius: {
	                    label: "Radius",
	                    value: dimensionValues['radius'],
	                    metadata: {
	                        types: ["number"]
	                    }
	                }

	            }
	        },
	        layoutOptions: {
	            axis: {
	                hLabel: {
	                    label: "Horizontal Label",
	                    value: hLabel,
	                    metadata: {
	                        types: ["string"]
	                    }
	                },
	                vLabel: {
	                    label: "Vertical Label",
	                    value: vLabel,
	                    metadata: {
	                        types: ["string"]
	                    }
	                },
	                ticks: {
	                    label: "Ticks",
	                    value: 10,
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                tooltip: {
	                    label: "Show Tooltip",
	                    value: true,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                },
	                gridlines: {
	                    label: "Gridlines",
	                    value: true,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }
	            }
	        },
	        datasource: ds_model
    	};
    } else if (validPatterns[0].chart === "Scatter Chart") {
        var hLabel ="";
        var vLabel = "";
        for (var i= 0; i< dimensionValues['xAxis'].length; i++){
            hLabel += dimensionValues['xAxis'][i].label + " ";
        }
        for (var i= 0; i< dimensionValues['yAxis'].length; i++){
            vLabel += dimensionValues['yAxis'][i].label + " ";
        }
        
    	configuration = {
    		id: 382774,
	        name: "Scatter Chart",
	        thumbnail: "http://localhost:3002/thumbnails/scatter_chart.png",
	        structureOptions: {
	            dimensions: {
	                yAxis: {
	                    label: "Vertical Axis",
	                    value: dimensionValues['yAxis'],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                xAxis: {
	                    label: "Horizontal Axis",
	                    value: dimensionValues['xAxis'],
	                    metadata: {
	                        types: ["number, ", "string or ", "date"]
	                    }
	                },
	                group: {
	                    label: "Groups",
	                    value: dimensionValues['group'],
	                    metadata: {
	                        types: ["date, ", "number or ", "string"]
	                    }
	                }
	            }
	        },
	        layoutOptions: {
	            axis: {
	                hLabel: {
	                    label: "Horizontal Label",
	                    value: hLabel,
	                    metadata: {
	                        types: ["string"]
	                    }
	                },
	                vLabel: {
	                    label: "Vertical Label",
	                    value: vLabel,
	                    metadata: {
	                        types: ["string"]
	                    }
	                },
	                gridlines: {
	                    label: "Show Gridlines",
	                    value: true,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                },
	                ticks: {
	                    label: "Ticks",
	                    value: 5,
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                tooltip: {
	                    label: "Show Tooltip",
	                    value: true,
	                    metadata: {
	                        types: ["boolean"]
	                    }
	                }
	            }
	        },
	        datasource: ds_model
    	};
    } else if (validPatterns[0].chart === "Pie Chart") {
    	configuration = {
    		id: 351574,
	        name: "Pie Chart",
	        thumbnail: "http://localhost:3002/thumbnails/pie_chart.png",
	        structureOptions: {
	            dimensions: {
	                measure: {
	                    label: "Drag & drop measure",
	                    value: dimensionValues['measure'],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                slice: {
	                    label: "Drag & drop series",
	                    value: dimensionValues['slice'],
	                    metadata: {
	                        types: ["any"]
	                    }
	                }
	            }
	        },
	        layoutOptions: {
	            tooltip: {
	                label: "Show Tooltip",
	                value: true,
	                metadata: {
	                    types: ["boolean"]
	                }
	            }
	        },
	        datasource: ds_model
    	};
    } else if (validPatterns[0].chart === "Map") {
    	configuration = {
    		id: 34223494,
	        name: "Map",
	        thumbnail: "http://localhost:3002/thumbnails/map.png",
	        structureOptions: {
	            dimensions: {
	                label: {
	                    label: "Label",
	                    value: dimensionValues['label'],
	                    metadata: {
	                        types: ["number, ", "string or ", "date"]
	                    }
	                },
	                lat: {
	                    label: "Latitude",
	                    value: dimensionValues['lat'],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                long: {
	                    label: "Longitude",
	                    value: dimensionValues['long'],
	                    metadata: {
	                        types: ["number"]
	                    }
	                },
	                indicator: {
	                    label: "Indicator",
	                    value: dimensionValues['indicator'],
	                    metadata: {
	                        types: ["number"]
	                    }
	                }
	            }
	        },
	        layoutOptions: {
	        },
	        datasource: ds_model
    	};
    }
	
	return {
		validPatterns: validPatterns,
		configuration: configuration
	};
    



};